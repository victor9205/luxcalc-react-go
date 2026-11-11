# Design

## Context and scope

The project starts in the opened `C:\Projetos\luxcalc-react-go` workspace. Keep source and Git history there, without a nested project or worktree. The product name is **LuxCalc**, the project is **LuxCalc Full-Stack**, and the tagline is **Modern Calculation. Thoughtful Engineering.** Core delivery is four operations, a Go API, an excellent React interface, tests, and reproducible documentation. Advanced operations, persistence, Docker, and history are out of scope. Copy-result is a small optional enhancement only after core checks pass.

## Decisions

### Focused backend packages

Use the local module `luxcalc/backend`; the unknown GitHub owner is not invented. `internal/calculator` owns `Calculate(operation string, a, b float64) (float64, error)` and `Error{Code string; Message string}` implementing `error`. `internal/httpapi.NewHandler() http.Handler` owns HTTP parsing and representation. `cmd/server` owns configuration, timeouts, signal handling, and shutdown. No application-service wrapper or interface is justified around a pure function.

Operations are exactly `add`, `subtract`, `multiply`, and `divide`. Validate finite operands first; reject an unsupported operation; reject positive or negative zero divisors; execute the operation; reject a NaN or infinite result. IEEE 754 `float64` is deliberate: `0.1 + 0.2` may produce `0.30000000000000004`, and monetary calculations require a separate decimal design.

### Explicit REST contract

`POST /api/calculate` consumes `{ "operation": "divide", "a": 120, "b": 4 }` and returns `200 { "result": 30 }`. Success contains a finite JSON number. Errors contain `{ "error": { "code": "DIVISION_BY_ZERO", "message": "Cannot divide by zero" } }`. Public domain codes are `INVALID_INPUT`, `UNSUPPORTED_OPERATION`, `DIVISION_BY_ZERO`, and `NON_FINITE_RESULT`.

| Condition | Status | Code |
| --- | --- | --- |
| Malformed JSON, unknown fields, multiple values, absent/null/wrong-type operands, absent/null/empty operation, invalid numeric representation | 400 | `INVALID_INPUT` |
| More than 8192 request-body bytes | 413 | `INVALID_INPUT` |
| Missing, malformed, or non-JSON Content-Type | 415 | `INVALID_INPUT` |
| Nonempty unsupported operation | 422 | `UNSUPPORTED_OPERATION` |
| Zero divisor | 422 | `DIVISION_BY_ZERO` |
| Arithmetic overflow or non-finite result | 422 | `NON_FINITE_RESULT` |
| Wrong method at known route | 405 with `Allow` | `METHOD_NOT_ALLOWED` |
| Unknown path | 404 | `NOT_FOUND` |

Check the method before Content-Type. Accept `application/json` with valid parameters using `mime.ParseMediaType`; do not accept arbitrary `+json`. Read the complete body through `http.MaxBytesReader` before decoding, so the 8192-byte limit takes precedence even when a malformed token or trailing JSON appears early. Classify `*http.MaxBytesError` from that bounded read as 413. Decode a request struct with pointer operands and `DisallowUnknownFields`, then require a second decode to return `io.EOF`. Struct decoding plus required-field checks reject arrays, scalars, `null`, and empty objects. JSON numbers outside `float64` are a malformed request, not a domain overflow. Dispatch exact escaped paths directly so noncanonical encoded paths also receive JSON errors. All API responses use `application/json`; do not expose raw decoder messages or stack traces.

`GET /api/health` returns `200 { "status": "ok" }`; other methods receive 405 and `Allow: GET`. Route paths are exact. `ADDR` defaults to `127.0.0.1:8080`. Server settings: `ReadHeaderTimeout` 5 seconds, `ReadTimeout` 10 seconds, `WriteTimeout` 15 seconds, `IdleTimeout` 60 seconds; shutdown allows 5 seconds and handles interrupt/termination signals. Vite proxies `/api` to `http://127.0.0.1:8080`; no broad CORS is needed. Production deployment must serve UI/API behind one origin or configure a specific deployment proxy.

### Frontend ownership and contracts

`src/lib/calculator.ts` owns `Operation`, `CalculateInput`, metadata, and lexical input validation. `src/lib/api.ts` owns `ApiError` and `calculate(input: CalculateInput, signal: AbortSignal): Promise<number>`. `App.tsx` owns form and asynchronous state; small `OperationSelector` and `ResultPanel` components own focused presentation. Components perform no arithmetic.

`Operation = 'add' | 'subtract' | 'multiply' | 'divide'`. `CalculateInput = { operation: Operation; a: number; b: number }`. `parseOperand(text: string): number | null` trims surrounding whitespace, requires the full decimal/scientific pattern `[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?`, and requires `Number.isFinite(Number(value))`. Thus zero, negative values, decimal fractions, and scientific notation work; blank, hexadecimal, Infinity, separators, and trailing junk fail. Do not infer a locale decimal separator. Explain that a dot is the decimal separator.

The client POSTs JSON to `/api/calculate`, passes the signal to fetch, validates the response envelope, and rejects non-finite or malformed success data. A server error becomes `ApiError(code, message, status)`. A malformed response becomes `ApiError('INVALID_RESPONSE', 'The calculation service returned an invalid response.', status)`. UI network errors offer a retry; a 10-second request timer aborts with an actionable timeout message.

### State and race prevention

Use a discriminated state: `idle`; `loading`; `success` with result/expression; `error` with message. Track field errors separately for both operands. Keep input strings as entered and parse only for validation/submission. A synchronous ref marks a request active before awaiting anything, guarding click/Enter events even before React rerenders. Each request owns an `AbortController` and generation token. Any operand edit, operation change, clear action, or unmount aborts and invalidates the request, clears timers, resets the active guard, and clears old results/errors. A late promise checks its token before changing state, even when a mocked or noncompliant transport ignores abort. A request's finally block must not reset a newer request's guard.

The result is exactly `String(result)`, preserving the API number's round-trip representation rather than silently rounding. The expression uses submitted numeric values and the selected operator. Long/scientific output wraps inside its panel. Optional copy uses the same raw displayed string and reports failure without changing the calculation.

### Visual and accessible experience

Use warm offwhite canvas, deep green accents, a white operand panel, dark forest result panel, modest borders/shadows, and generous spacing. Use a local system font stack; no font fetch. Show a slim header with custom L monogram, `Workspace / Calculator` breadcrumb, and headline `A little clarity. In every calculation.` with green emphasis. Desktop has two balanced panels with tiny section indexes, segmented operation buttons, operand cards, emerald calculate action, subtle dot/grid texture, and an editorial footer. At 700px and below stack form before result and avoid horizontal scrolling at 320px.

Use a semantic form, labeled text inputs with `inputMode="decimal"`, four actual buttons with `aria-pressed`, a primary submit button, and a secondary clear button. Accessible names are exactly `First operand`, `Second operand`, `Add`, `Subtract`, `Multiply`, `Divide`, `Calculate`, and `Clear`. Disable submit while pending; keep edits available to cancel it. Provide field-specific `aria-invalid`/`aria-describedby`, a polite status/result announcement, and alert errors. Preserve visible keyboard focus, Enter submission, comfortable 44px controls, sufficient contrast, and reduced-motion styles. Empty, loading, success, and error panels have distinct useful copy. Icons can be inline SVG or text symbols without an icon package.

## Verification and tradeoffs

Use table-driven domain tests and `httptest` for the contract. Vitest/React Testing Library test lexical validation, API envelopes, user interaction, pending states, duplicate events, stale responses, timeout, and unmount. Browser checks use the real running services for desktop/mobile layout, keyboard operation, success, domain error, and service failure. Do not infer browser success from component tests. Record exact checks/coverage in docs only after execution.

Node 22.22.3 meets the selected Vite 8/Vitest 5 floor; project dependencies and lockfiles pin the actual installed compatible versions. Go is installed locally from the official distribution when absent; ignored `.tools/` content is environment-only. Root scripts provide an honest verification entry point. Keep a concise `AGENTS.md`, avoid extra custom skills, and use one bounded independent review after implementation.

## Risks and recovery

- If a required installation fails, preserve source, document the actual failure, run remaining checks, and mark affected checks blocked.
- If OpenSpec integration is unavailable, retain these artifacts and use the CLI when possible; lack of an optional editor integration does not block implementation.
- If a test fails, capture one focused diagnostic, correct the root cause, and rerun the affected checks; avoid broad redesign or retry loops.
- If browser tooling is unavailable, record responsive/interaction checks as unverified; do not fabricate screenshots or claims.
- Keep optional features removable so the four operations, accessibility, tests, and documentation remain the priority.
