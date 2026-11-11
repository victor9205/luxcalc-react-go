package calculator

import (
	"errors"
	"math"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name, operation string
		a, b, want      float64
	}{
		{"add", "add", 2, 3, 5},
		{"subtract", "subtract", 2, 3, -1},
		{"multiply", "multiply", -2, 3, -6},
		{"divide", "divide", 9, 3, 3},
		{"zero addition", "add", 0, 4, 4},
		{"zero subtraction", "subtract", 0, 4, -4},
		{"zero product", "multiply", 4, 0, 0},
		{"zero dividend", "divide", 0, 4, 0},
		{"decimal addition", "add", .1, .2, .30000000000000004},
		{"decimal subtraction", "subtract", -1.5, .25, -1.75},
		{"decimal product", "multiply", .5, -3, -1.5},
		{"decimal quotient", "divide", -1, 4, -.25},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calculate(tt.operation, tt.a, tt.b)
			if err != nil {
				t.Fatal(err)
			}
			if math.Abs(got-tt.want) > 1e-14 {
				t.Fatalf("got %v, want %v", got, tt.want)
			}
		})
	}
}

func TestCalculateErrors(t *testing.T) {
	tests := []struct {
		name, operation, code string
		a, b                  float64
		message               string
	}{
		{"positive zero divisor", "divide", "DIVISION_BY_ZERO", 1, 0, "Cannot divide by zero"},
		{"negative zero divisor", "divide", "DIVISION_BY_ZERO", 1, math.Copysign(0, -1), "Cannot divide by zero"},
		{"unsupported", "power", "UNSUPPORTED_OPERATION", 2, 3, "Unsupported operation"},
		{"nan first operand", "add", "INVALID_INPUT", math.NaN(), 1, "Operands must be finite numbers"},
		{"nan second operand", "add", "INVALID_INPUT", 1, math.NaN(), "Operands must be finite numbers"},
		{"infinite first operand", "add", "INVALID_INPUT", math.Inf(1), 1, "Operands must be finite numbers"},
		{"infinite second operand", "add", "INVALID_INPUT", 1, math.Inf(-1), "Operands must be finite numbers"},
		{"overflow", "multiply", "NON_FINITE_RESULT", math.MaxFloat64, 2, "Result is not a finite number"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := Calculate(tt.operation, tt.a, tt.b)
			var calculationError *Error
			if !errors.As(err, &calculationError) {
				t.Fatalf("expected *Error, got %v", err)
			}
			if calculationError.Code != tt.code {
				t.Errorf("code %q, want %q", calculationError.Code, tt.code)
			}
			if calculationError.Message != tt.message {
				t.Errorf("message %q, want %q", calculationError.Message, tt.message)
			}
			if err.Error() != tt.message {
				t.Errorf("error string %q, want %q", err.Error(), tt.message)
			}
		})
	}
}
