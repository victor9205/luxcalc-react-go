# LuxCalc Full-Stack

**Modern Calculation. Thoughtful Engineering.**

LuxCalc is a focused full-stack calculator and open-source engineering portfolio project, inspired by an earlier Delphi application built with OOP, MVC and SOLID. It pairs a responsive React workspace with an independently tested Go calculation API.

![LuxCalc desktop workspace showing a calculation returned by the Go API](docs/images/luxcalc-desktop.png)

[View the 320px mobile layout](docs/images/luxcalc-mobile.png).

## Run locally

Prerequisites: Git, Go 1.27+, Node.js 22.22.3+ (or a compatible current LTS), npm. See [environment setup](docs/ENVIRONMENT.md) for the actual validated versions and portable Go fallback used on Windows.

```powershell
npm ci
npm --prefix frontend ci
npm run dev:backend
```

In a second terminal:

```powershell
npm run dev:frontend
```

Open **http://localhost:5173**. The Go API listens on `127.0.0.1:8080`. Vite proxies `/api` to it, so development needs no permissive CORS policy. Set `ADDR` to change the backend address; change the Vite proxy target too if you change the port. For production, build the frontend and configure an HTTPS reverse proxy to serve `frontend/dist` and route `/api` to Go; the Vite development server is not a production server.

## Features and architecture

- Addition, subtraction, multiplication and division through the real Go API.
- Operand validation, actionable errors, loading feedback, duplicate submission protection and cancellation of obsolete requests.
- Keyboard submission, accessible labels and status announcements, visible focus and reduced-motion support.
- Responsive workspace for desktop and narrow mobile screens.

```text
React UI → typed fetch client → /api/calculate
                                ↓
                    Go HTTP parsing/validation
                                ↓
                    independent calculator domain
```

`backend/internal/calculator` owns arithmetic and typed domain errors. `backend/internal/httpapi` handles bounded JSON decoding, required operands, response contracts and HTTP semantics. `backend/cmd/server` owns process configuration and server lifecycle. The valid local Go module name is `luxcalc/backend`; change it and its imports together if a future repository owner chooses a fully qualified module path.

`frontend/src` holds React state, presentation, numeric input validation and the typed API client. JavaScript does not compute authoritative arithmetic results. Vite, TypeScript, Vitest and React Testing Library support development; the backend uses only the standard library.

This applies Clean Architecture and SOLID through focused responsibilities and inward dependencies. The domain imports no HTTP package; transport can change without changing arithmetic. No repository, persistence layer, service interface or dependency injection framework is needed for four stateless operations.

## API

```powershell
$body = @{ operation = 'divide'; a = 120; b = 4 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8080/api/calculate -ContentType application/json -Body $body
```

```json
{"result":30}
```

Request contract: `POST /api/calculate`, `Content-Type: application/json`, one JSON object with `operation` (`add`, `subtract`, `multiply`, `divide`) and required finite numeric `a`, `b`. Zero is a valid operand. Unknown fields and additional JSON values are rejected. Body limit: 8 KiB. Health check: `GET /api/health`.

```json
{"error":{"code":"DIVISION_BY_ZERO","message":"Cannot divide by zero"}}
```

| Status | Meaning |
| --- | --- |
| 400 | `INVALID_INPUT`: malformed/missing/incorrectly typed input |
| 404 | Unknown route |
| 405 | Wrong HTTP method; includes `Allow` |
| 413 | `INVALID_INPUT`: body exceeds limit |
| 415 | `INVALID_INPUT`: JSON content type required |
| 422 | `UNSUPPORTED_OPERATION`, `DIVISION_BY_ZERO`, `NON_FINITE_RESULT` |

## Verification

```powershell
npm run verify
npm run test:e2e
```

`verify` runs Go formatting, vet, tests with coverage, OpenSpec strict validation, frontend lint, type checking, coverage and production build. Individual commands:

```powershell
cd backend
go fmt ./...
go vet ./...
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
cd ../frontend
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
```

Browser tests default to installed Chrome. To use Playwright Chromium, run `npx playwright install chromium` and set `PLAYWRIGHT_CHANNEL=chromium`. CI uses Chromium. [Actual results and coverage](docs/VERIFICATION.md) distinguish local evidence from checks that have not run in hosted CI.

Latest local evidence: **50 frontend tests and 7 browser tests passed**. Frontend statement coverage is **98.42%**. Go coverage is **100%** for the domain, **96.4%** for HTTP, and **75.6%** overall including the server bootstrap (0% unit coverage). Formatting, vet, lint, type checking, OpenSpec validation and production build passed. Browser checks cover 1440px desktop and 320px mobile layouts, keyboard operation, real responses/errors, network failure and request cancellation. These are local results, not a claim that hosted CI ran.

## Specifications and AI-assisted development

One OpenSpec change, [luxcalc-fullstack-foundation](openspec/changes/luxcalc-fullstack-foundation), defines the API, UX, architecture, acceptance scenarios and tasks. Validate it with `npm run spec:validate`. The [implementation plan](docs/IMPLEMENTATION_PLAN.md) records the executable decisions and task completion evidence.

The user authorized local setup, implementation and verification in one request. [AI_PROMPTS.md](AI_PROMPTS.md) preserves that request verbatim; [AI workflow](docs/AI_WORKFLOW.md) records the actual task prompts, model routing and selected capabilities. No global context proxy or project-specific skill was needed: ordinary scripts provide the repeatable quality gate.

## Numerical limits and future work

The API uses IEEE 754 `float64`; decimal values such as `0.1 + 0.2` can expose binary representation error. Results are general-purpose approximations, unsuitable for financial accounting requiring exact decimal arithmetic. Integers beyond `2^53 − 1` may lose exactness. Overflow is rejected rather than serialized as infinity. Very small values may underflow to zero. Input and result formatting must not imply extra precision.

Future improvements could add exact decimal arithmetic as an explicit separate mode, broader operations and persistent history. Authentication, databases, Docker and unnecessary infrastructure are outside this small portfolio project's scope.

MIT licensed; see [LICENSE](LICENSE). The repository is prepared locally; publication requires a separate user action.
