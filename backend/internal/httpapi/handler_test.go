package httpapi

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCalculateHandler(t *testing.T) {
	tests := []struct {
		name, body string
		want       float64
	}{
		{"add", `{"operation":"add","a":2,"b":3}`, 5},
		{"subtract", `{"operation":"subtract","a":2,"b":3}`, -1},
		{"multiply", `{"operation":"multiply","a":2,"b":3}`, 6},
		{"divide", `{"operation":"divide","a":9,"b":3}`, 3},
		{"zero operand", `{"operation":"add","a":0,"b":3}`, 3},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", "/api/calculate", strings.NewReader(test.body))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()
			NewHandler().ServeHTTP(rec, req)
			if rec.Code != 200 {
				t.Fatalf("status %d: %s", rec.Code, rec.Body.String())
			}
			if !strings.HasPrefix(rec.Header().Get("Content-Type"), "application/json") {
				t.Fatalf("Content-Type %q", rec.Header().Get("Content-Type"))
			}
			var payload struct {
				Result float64 `json:"result"`
			}
			if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
				t.Fatal(err)
			}
			if payload.Result != test.want {
				t.Errorf("result %v, want %v", payload.Result, test.want)
			}
		})
	}
}

func TestHealthHandler(t *testing.T) {
	rec := httptest.NewRecorder()
	NewHandler().ServeHTTP(rec, httptest.NewRequest("GET", "/api/health", nil))
	if rec.Code != 200 {
		t.Fatalf("status %d", rec.Code)
	}
	var payload map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	if payload["status"] != "ok" {
		t.Fatalf("status body %#v", payload)
	}
}

func TestInvalidRequests(t *testing.T) {
	tests := []struct {
		name, body, contentType string
		status                  int
	}{
		{"empty", "", "application/json", 400},
		{"malformed", "{", "application/json", 400},
		{"null body", "null", "application/json", 400},
		{"array", "[]", "application/json", 400},
		{"scalar", `"x"`, "application/json", 400},
		{"missing operand", `{"operation":"add","a":1}`, "application/json", 400},
		{"null operand", `{"operation":"add","a":null,"b":1}`, "application/json", 400},
		{"string operand", `{"operation":"add","a":"1","b":1}`, "application/json", 400},
		{"boolean operand", `{"operation":"add","a":true,"b":1}`, "application/json", 400},
		{"missing operation", `{"a":1,"b":2}`, "application/json", 400},
		{"null operation", `{"operation":null,"a":1,"b":2}`, "application/json", 400},
		{"empty operation", `{"operation":"","a":1,"b":2}`, "application/json", 400},
		{"invalid number", `{"operation":"add","a":1e309,"b":1}`, "application/json", 400},
		{"unknown field", `{"operation":"add","a":1,"b":2,"extra":1}`, "application/json", 400},
		{"trailing object", `{"operation":"add","a":1,"b":2}{}`, "application/json", 400},
		{"missing content type", `{"operation":"add","a":1,"b":2}`, "", 415},
		{"wrong content type", `{"operation":"add","a":1,"b":2}`, "text/plain", 415},
		{"json charset", `{"operation":"add","a":1,"b":2}`, "application/json; charset=utf-8", 200},
		{"oversized body", strings.Repeat(" ", 8193), "application/json", 413},
		{"oversized trailing whitespace", `{"operation":"add","a":1,"b":2}` + strings.Repeat(" ", 8200), "application/json", 413},
		{"oversized trailing JSON", `{"operation":"add","a":1,"b":2}{}` + strings.Repeat(" ", 9000), "application/json", 413},
		{"oversized malformed content", "!" + strings.Repeat(" ", 9000), "application/json", 413},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", "/api/calculate", strings.NewReader(test.body))
			if test.contentType != "" {
				req.Header.Set("Content-Type", test.contentType)
			}
			rec := httptest.NewRecorder()
			NewHandler().ServeHTTP(rec, req)
			if rec.Code != test.status {
				t.Fatalf("status %d, want %d: %s", rec.Code, test.status, rec.Body.String())
			}
		})
	}
}

func TestDomainErrorsAndRouting(t *testing.T) {
	tests := []struct {
		name, method, path, body, contentType string
		status                                int
		code, allow                           string
	}{
		{"divide by zero", "POST", "/api/calculate", `{"operation":"divide","a":1,"b":0}`, "application/json", 422, "DIVISION_BY_ZERO", ""},
		{"unsupported", "POST", "/api/calculate", `{"operation":"power","a":1,"b":2}`, "application/json", 422, "UNSUPPORTED_OPERATION", ""},
		{"overflow", "POST", "/api/calculate", `{"operation":"multiply","a":1e308,"b":10}`, "application/json", 422, "NON_FINITE_RESULT", ""},
		{"wrong calculate method before content type", "GET", "/api/calculate", "", "", 405, "METHOD_NOT_ALLOWED", "POST"},
		{"wrong health method", "POST", "/api/health", "", "", 405, "METHOD_NOT_ALLOWED", "GET"},
		{"unknown route", "GET", "/api/unknown", "", "", 404, "NOT_FOUND", ""},
		{"trailing slash", "GET", "/api/health/", "", "", 404, "NOT_FOUND", ""},
		{"encoded slash", "GET", "/api%2Fhealth", "", "", 404, "NOT_FOUND", ""},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(test.method, test.path, bytes.NewBufferString(test.body))
			if test.contentType != "" {
				req.Header.Set("Content-Type", test.contentType)
			}
			rec := httptest.NewRecorder()
			NewHandler().ServeHTTP(rec, req)
			if rec.Code != test.status {
				t.Fatalf("status %d want %d: %s", rec.Code, test.status, rec.Body.String())
			}
			if test.allow != "" && rec.Header().Get("Allow") != test.allow {
				t.Errorf("Allow %q want %q", rec.Header().Get("Allow"), test.allow)
			}
			if test.code != "" {
				var payload struct {
					Error struct {
						Code string `json:"code"`
					} `json:"error"`
				}
				if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
					t.Fatal(err)
				}
				if payload.Error.Code != test.code {
					t.Errorf("code %q want %q", payload.Error.Code, test.code)
				}
			}
		})
	}

}
