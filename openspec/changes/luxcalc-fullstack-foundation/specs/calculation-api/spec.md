## ADDED Requirements

### Requirement: Independent finite arithmetic

The calculation domain SHALL support `add`, `subtract`, `multiply`, and `divide` using `float64` independently of HTTP. It SHALL return a finite result or a typed error with a stable code and useful message.

#### Scenario: Calculate each supported operation
- **GIVEN** finite operands including positive, negative, decimal, and zero values
- **WHEN** a caller requests a supported operation
- **THEN** the domain returns its IEEE 754 arithmetic result without an error

#### Scenario: Reject unsupported operation
- **GIVEN** finite operands and operation `power`
- **WHEN** the domain calculates
- **THEN** it returns `UNSUPPORTED_OPERATION`

#### Scenario: Reject zero division
- **GIVEN** operation `divide` and a positive or negative zero divisor
- **WHEN** the domain calculates
- **THEN** it returns `DIVISION_BY_ZERO` and message `Cannot divide by zero`

#### Scenario: Reject non-finite operands
- **GIVEN** either operand is NaN or positive or negative infinity
- **WHEN** the domain calculates
- **THEN** it returns `INVALID_INPUT`

#### Scenario: Reject arithmetic overflow
- **GIVEN** finite operands whose arithmetic produces infinity or NaN
- **WHEN** the domain calculates
- **THEN** it returns `NON_FINITE_RESULT`

### Requirement: Successful calculation JSON contract

The API SHALL expose exactly `POST /api/calculate` accepting one JSON object with string `operation` and required numeric `a` and `b`, and SHALL return status 200 with `{ "result": number }` for a successful calculation. Zero SHALL be treated as a provided operand. Responses SHALL use `application/json`.

#### Scenario: Successful division
- **GIVEN** Content-Type `application/json` and body `{ "operation": "divide", "a": 120, "b": 4 }`
- **WHEN** the client POSTs to `/api/calculate`
- **THEN** status is 200 and the JSON result is 30

#### Scenario: Zero operand is valid
- **GIVEN** body `{ "operation": "add", "a": 0, "b": 2 }`
- **WHEN** the client POSTs JSON to `/api/calculate`
- **THEN** status is 200 and the result is 2

### Requirement: Strict bounded request validation

The API SHALL reject malformed JSON, unknown fields, trailing JSON values, non-object documents, missing/null/wrong-type operands, absent/null/empty operation, and JSON numbers outside `float64` with status 400 and `INVALID_INPUT`. It SHALL reject request bodies above 8192 bytes with status 413 and `INVALID_INPUT`. It SHALL require `application/json`, optionally with valid parameters, otherwise returning 415 and `INVALID_INPUT`.

#### Scenario: Invalid request data
- **GIVEN** a JSON request missing `a`, containing `b: null`, containing a string operand, an unknown property, a second JSON document, a non-object document, an empty operation, or invalid JSON syntax
- **WHEN** the client POSTs to `/api/calculate`
- **THEN** status is 400 and the response contains `error.code` equal to `INVALID_INPUT`

#### Scenario: Reject numeric overflow while parsing
- **GIVEN** a request containing numeric operand `1e309`
- **WHEN** the client POSTs JSON to `/api/calculate`
- **THEN** status is 400 with `INVALID_INPUT`

#### Scenario: Enforce body limit
- **GIVEN** a request body exceeding 8192 bytes, including oversized trailing content
- **WHEN** the client POSTs JSON to `/api/calculate`
- **THEN** status is 413 with `INVALID_INPUT`

#### Scenario: Oversized body with an early decoding error
- **GIVEN** a valid calculation followed by a second JSON value and padding, or an early malformed token with padding, exceeds 8192 bytes
- **WHEN** the client POSTs JSON to `/api/calculate`
- **THEN** status is 413 with `INVALID_INPUT` before JSON syntax or trailing-value classification

#### Scenario: Check media type
- **GIVEN** the Content-Type is missing, malformed, or `text/plain`
- **WHEN** the client POSTs to `/api/calculate`
- **THEN** status is 415 with `INVALID_INPUT`

#### Scenario: Accept JSON parameters
- **GIVEN** a valid calculation body and Content-Type `application/json; charset=utf-8`
- **WHEN** the client POSTs to `/api/calculate`
- **THEN** the API accepts the request

### Requirement: Predictable domain and route failures

The API SHALL return domain failures as status 422 and `{ "error": { "code": string, "message": string } }`. Known routes with incorrect methods SHALL return status 405, `METHOD_NOT_ALLOWED`, and the supported `Allow` header before evaluating Content-Type. Unknown paths SHALL return status 404 with `NOT_FOUND`. Internal decoder diagnostics SHALL NOT be exposed.

#### Scenario: Domain error response
- **GIVEN** division by zero, an unsupported nonempty operation, or finite arithmetic overflow
- **WHEN** the client submits the calculation
- **THEN** status is 422 with respectively `DIVISION_BY_ZERO`, `UNSUPPORTED_OPERATION`, or `NON_FINITE_RESULT` and a meaningful message

#### Scenario: Wrong calculation method
- **GIVEN** a GET request without Content-Type
- **WHEN** it targets `/api/calculate`
- **THEN** status is 405, `Allow` is `POST`, and error code is `METHOD_NOT_ALLOWED`

#### Scenario: Unknown path
- **GIVEN** a request to `/api/unknown`
- **WHEN** the server routes it
- **THEN** status is 404 with `NOT_FOUND`

### Requirement: Health and server lifecycle

The service SHALL expose `GET /api/health` returning status 200 and `{ "status": "ok" }`. The executable SHALL default to `127.0.0.1:8080`, support `ADDR`, apply finite HTTP timeouts, and gracefully shut down within five seconds after a termination signal.

#### Scenario: Healthy service
- **GIVEN** the server is running
- **WHEN** a client GETs `/api/health`
- **THEN** status is 200 and status is `ok`

#### Scenario: Wrong health method
- **GIVEN** a POST request to `/api/health`
- **WHEN** the server routes it
- **THEN** status is 405 and `Allow` is `GET`

#### Scenario: Local configurable startup
- **GIVEN** `ADDR` is unset or explicitly set
- **WHEN** the server starts
- **THEN** it listens on `127.0.0.1:8080` or the supplied address respectively

### Requirement: Meaningful backend verification

The repository SHALL provide table-driven domain tests, HTTP contract tests, formatting, vet, and coverage commands that execute using the documented Go toolchain. Documentation SHALL distinguish actual results from blocked checks and explain `float64` precision limitations.

#### Scenario: Reproducible backend check
- **GIVEN** the documented compatible Go toolchain and backend directory
- **WHEN** formatting, vet, tests with coverage, and coverage reporting run
- **THEN** the implementation is verified against operation, validation, status, and JSON-envelope cases and actual output is recorded
