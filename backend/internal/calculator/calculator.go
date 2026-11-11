package calculator

import "math"

type Error struct {
	Code    string
	Message string
}

func (e *Error) Error() string { return e.Message }

func Calculate(operation string, a, b float64) (float64, error) {
	if math.IsNaN(a) || math.IsInf(a, 0) || math.IsNaN(b) || math.IsInf(b, 0) {
		return 0, &Error{"INVALID_INPUT", "Operands must be finite numbers"}
	}
	var result float64
	switch operation {
	case "add":
		result = a + b
	case "subtract":
		result = a - b
	case "multiply":
		result = a * b
	case "divide":
		if b == 0 {
			return 0, &Error{"DIVISION_BY_ZERO", "Cannot divide by zero"}
		}
		result = a / b
	default:
		return 0, &Error{"UNSUPPORTED_OPERATION", "Unsupported operation"}
	}
	if math.IsNaN(result) || math.IsInf(result, 0) {
		return 0, &Error{"NON_FINITE_RESULT", "Result is not a finite number"}
	}
	return result, nil
}
