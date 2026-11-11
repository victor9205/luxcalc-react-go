package httpapi

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"mime"
	"net/http"
	"strings"

	"luxcalc/backend/internal/calculator"
)

type calculationRequest struct {
	Operation string   `json:"operation"`
	A         *float64 `json:"a"`
	B         *float64 `json:"b"`
}
type errorEnvelope struct {
	Error apiError `json:"error"`
}
type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func NewHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.EscapedPath() {
		case "/api/calculate":
			calculate(w, r)
		case "/api/health":
			health(w, r)
		default:
			writeError(w, 404, "NOT_FOUND", "Route not found")
		}
	})
}
func health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", "GET")
		writeError(w, 405, "METHOD_NOT_ALLOWED", "Method not allowed")
		return
	}
	writeJSON(w, 200, map[string]string{"status": "ok"})
}
func calculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", "POST")
		writeError(w, 405, "METHOD_NOT_ALLOWED", "Method not allowed")
		return
	}
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || mediaType != "application/json" {
		writeError(w, 415, "INVALID_INPUT", "Content-Type must be application/json")
		return
	}
	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 8192))
	if err != nil {
		requestDecodeError(w, err)
		return
	}
	decoder := json.NewDecoder(bytes.NewReader(body))
	decoder.DisallowUnknownFields()
	var input calculationRequest
	if err := decoder.Decode(&input); err != nil {
		requestDecodeError(w, err)
		return
	}
	var trailing any
	if err := decoder.Decode(&trailing); err != io.EOF {
		if err == nil {
			err = errors.New("trailing value")
		}
		requestDecodeError(w, err)
		return
	}
	if input.A == nil || input.B == nil || strings.TrimSpace(input.Operation) == "" {
		writeError(w, 400, "INVALID_INPUT", "Operation and numeric operands are required")
		return
	}
	result, err := calculator.Calculate(input.Operation, *input.A, *input.B)
	if err != nil {
		var domain *calculator.Error
		if errors.As(err, &domain) {
			writeError(w, 422, domain.Code, domain.Message)
			return
		}
		writeError(w, 500, "INTERNAL_ERROR", "Calculation failed")
		return
	}
	writeJSON(w, 200, map[string]float64{"result": result})
}
func requestDecodeError(w http.ResponseWriter, err error) {
	var tooLarge *http.MaxBytesError
	if errors.As(err, &tooLarge) {
		writeError(w, 413, "INVALID_INPUT", "Request body must not exceed 8192 bytes")
		return
	}
	writeError(w, 400, "INVALID_INPUT", "Request body must be a valid calculation object")
}
func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, errorEnvelope{Error: apiError{code, message}})
}
func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
