# LuxCalc Full-Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a polished, accessible React calculator backed by a verified standard-library Go JSON API in the opened workspace.

**Architecture:** A pure calculation package owns arithmetic; an HTTP package owns validation and transport; the server owns lifecycle. A typed frontend client and small presentation components share explicit contracts, while the root component owns cancellable asynchronous form state.

**Tech Stack:** Go standard library; React, TypeScript, Vite; Vitest, React Testing Library, jsdom, ESLint; project-local OpenSpec.

**Spec:** `openspec/changes/luxcalc-fullstack-foundation/design.md` and the `calculation-api`/`calculator-ui` specifications beside it. Read these once before execution; they define the contract and exact statuses.

## Executed outcome

All seven task deliverables are complete; OpenSpec `tasks.md` is the completed task tracker. The detailed step checklists below preserve the original planned procedure, including initial failure expectations, rather than reconstructing a perfect test-first history. Actual command evidence and execution variations are recorded in `docs/EXECUTION.md` and `docs/VERIFICATION.md`.

| Task | Completion evidence |
| --- | --- |
| T1 | Opened root confirmed; Git initialized; official Go checksum/version, Node/npm/Git and local OpenSpec verified |
| T2 | Pure domain tests pass, 100% statement coverage |
| T3 | HTTP contract tests pass, 96.4% coverage; server starts through real integration; review regressions fixed |
| T4 | Compatible locked frontend toolchain, source/config type checking, responsive presentation and numeric parser |
| T5 | 50 frontend tests pass, including client contracts, StrictMode, immediate guard, timeout, cancellation and late-response races |
| T6 | 7 real-browser scenarios pass; desktop/mobile screenshots inspected; docs and CI prepared; audits report zero vulnerabilities |
| T7 | One independent review completed; one Important and two Minor findings fixed; final quality checks passed |

Rulings: work stayed in the opened root without a worktree or commits, as requested; optional clipboard/history/advanced arithmetic were omitted to keep the core focused. Final review retained standard decoder duplicate-key/case behavior and documented float64 underflow/signed-zero behavior. No unresolved Critical/Important findings or deferred minor findings remain. Hosted CI, other browsers and real mobile hardware were not run locally.

## Global Constraints

- Work only in the discovered opened root `C:\Projetos\luxcalc-react-go`; paths below are relative to it. No nested project, worktree, reset, commit, push, or publication is requested.
- User explicitly authorizes automatic implementation after this internal readiness gate; do not stop for design confirmation. Executor ownership is backend/frontend source, manifests, and tests (T2–T5); the parent owns root scripts, documentation, environment reporting, browser QA/CI, and final review (T1/T6/T7).
- Preserve others' changes. One Luna Low executor implements T2–T5; one bounded independent final review follows. Do not spawn per-task agents or extra reviewers.
- Use module `luxcalc/backend`, standard-library HTTP, four operations, `float64`, and the exact contracts/statuses in the spec. No database, authentication, general CORS, advanced arithmetic, or history.
- API is authoritative; frontend must not compute result arithmetic. Accept decimal/scientific syntax only; output `String(result)` without precision truncation.
- Development listens on `127.0.0.1:8080` by default and Vite proxies `/api` to it. No external fonts.
- Detected baseline: Windows PowerShell 5.1, Git 2.56, Node 22.22.3, npm 10.9.8. Parent verified official checksum and portable Go 1.27.4 plus root local OpenSpec 1.17.0. Record these evidence-backed versions in T1.
- Vite 8.3.8 and Vitest 5.1 are the selected compatible lines; React 19.3.1, jsdom 31, ESLint 10.14, and TypeScript 5.9.3 are compatible candidates (TS 5.9 avoids uncertain lint support for TS 7). Retain actual installed versions and lockfiles. Never bypass security or compatibility errors.
- Use PowerShell-compatible commands. A local Go executable can be added to the current process PATH: `$env:Path = (Join-Path (Get-Location) '.tools\go\bin') + ';' + $env:Path`; avoid global settings.
- Record actual check results, coverage, visual inspection, and model routing. Optional copy-result may be omitted without weakening delivery.

## Review Focus

1. A request resolving after an edit or a later request must not restore an old result or unlock the later submit guard (T5 race test).
2. Burst click/Enter events before rerender must create one request, while Enter from a valid input remains usable (T5 tests).
3. Non-finite input/overflow, null versus zero, and oversized trailing JSON must produce predictable errors (T2/T3 tests).
4. Scientific notation and full-precision long results must remain accepted/readable, with no 320px overflow (T4/T5 tests, T6 browser check).
5. Timeout, unmount, and API error recovery must clean up timers/requests and allow a subsequent calculation (T5 tests, T6 integration).

## File map and shared contracts

| Files | Responsibility |
| --- | --- |
| `backend/go.mod`, `backend/internal/calculator/calculator.go`, `calculator_test.go` | Module and pure arithmetic/error contract |
| `backend/internal/httpapi/handler.go`, `handler_test.go` | Exact routing, strict request decoding, JSON envelopes |
| `backend/cmd/server/main.go` | Environment address, timeouts, signals, graceful shutdown |
| `frontend/package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html` | Compatible locked frontend toolchain, proxy, lint/test/build |
| `frontend/src/main.tsx`, `App.tsx`, `styles.css` | Bootstrap, state orchestration, design tokens/responsive styling |
| `frontend/src/components/OperationSelector.tsx`, `ResultPanel.tsx` | Focused operation/result presentation |
| `frontend/src/lib/calculator.ts`, `calculator.test.ts` | Types, operation metadata, operand parsing |
| `frontend/src/lib/api.ts`, `api.test.ts` | Abortable validated REST client |
| `frontend/src/App.test.tsx`, `test/setup.ts` | User-facing asynchronous/accessible behavior tests |
| `package.json`, `package-lock.json`, `.gitignore`, `AGENTS.md` | Root verification/OpenSpec entry points and repository hygiene |
| `README.md`, `AI_PROMPTS.md`, `docs/ENVIRONMENT.md`, `docs/VERIFICATION.md` | Setup, actual prompt history, environment, verification evidence |
| `openspec/changes/luxcalc-fullstack-foundation/*` | One cohesive change and acceptance criteria |

Exact Go public interface: `Calculate(operation string, a, b float64) (float64, error)`; `type Error struct { Code string; Message string }`; `func (*Error) Error() string`; `func NewHandler() http.Handler`.

Exact TypeScript interfaces:

```ts
type Operation = 'add' | 'subtract' | 'multiply' | 'divide';
type CalculateInput = { operation: Operation; a: number; b: number };
type CalculationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: number; expression: string }
  | { status: 'error'; message: string };
// lib/calculator.ts exports these plus parseOperand(text: string): number | null.
// lib/api.ts exports ApiError extends Error with readonly code: string, status: number
// and constructor(code: string, message: string, status: number).
// calculate(input: CalculateInput, signal: AbortSignal): Promise<number>.
```

`OperationSelector` props are `{ value: Operation; onChange: (value: Operation) => void }`. `ResultPanel` props are `{ state: CalculationState }`. `App` is the default exported component and imports `calculate` directly from `lib/api`; tests can mock this boundary. Field errors are `{ a?: string; b?: string }`, separate from `CalculationState`.

---

### T1: Confirm a reproducible workspace, toolchain, and specification

**Objective:** Turn preflight evidence and manifests into an executable baseline. **Dependencies:** Parent preflight and these planning artifacts. **Files:** Root `package.json`/lockfile/`.gitignore`; `docs/ENVIRONMENT.md`; existing OpenSpec config and this change (do not overwrite planner work). Parent owns T1; executor creates `backend/go.mod` in T2.

**Interfaces:** Parent owns local `@fission-ai/openspec` and root scripts; backend module is `luxcalc/backend`. Frontend scripts are created in T4. Existing root commands are `dev:frontend`, `dev:backend`, `verify:frontend`, `verify`, `test:e2e`, and `spec:validate`; `verify` runs real backend/frontend/spec checks. `scripts/backend.mjs` resolves portable Go automatically.

- [x] Inspect `Get-Location`, `git status --short --branch`, existing manifests, and `AGENTS.md`; confirm current root, no nested repository, and preserve unrelated changes.
- [x] Run `git --version`, `node --version`, `npm --version`, and `go version` after adding the official portable Go path if necessary; record exact outputs and the pending/failed installations honestly.
- [x] Ensure `.gitignore` covers `.tools/`, `node_modules/`, `dist/`, coverage output, logs, `.env` variants while allowing `.env.example`, and temporary browser artifacts; retain lockfiles and source.
- [x] Execute `npm run spec:validate`; result: OpenSpec 1.17.0 reports `Change 'luxcalc-fullstack-foundation' is valid` under strict validation.
- [x] Write initial `docs/ENVIRONMENT.md` with OS/shell, selected versus verified versions, official Go installation method, dependency restoration commands, and outstanding blockers (parent preflight evidence; final details refreshed in T6).

**Verification/outcome:** Required executable versions print; OpenSpec validation passes or the exact optional limitation is recorded; manifests belong to the opened root. **Failure recovery:** Inspect the first installation/validation error, use the official compatible source or correct schema, avoid repeated reinstall attempts; continue source work if a tool remains unavailable. **DoD:** Workspace/toolchain evidence exists and every remaining prerequisite is explicit.

### T2: Implement the pure calculation domain with table-driven tests

**Objective:** Establish arithmetic and typed failure behavior independently of transport. **Dependencies:** T1 Go toolchain. **Files:** `backend/go.mod`, `backend/internal/calculator/calculator.go`, `calculator_test.go`.

**Interfaces:** Produce `Calculate` and `*Error` exactly as above; HTTP uses `errors.As` for codes. Error messages must be useful; pin division to `Cannot divide by zero`. Domain errors use the four codes from the spec.

- [ ] Create `backend/go.mod` with module `luxcalc/backend` and installed compatible Go directive if absent, then write `TestCalculate` table cases for add/subtract/multiply/divide, negative/decimal/zero operands, and `0.1 + 0.2`; assert expected float64 values with a small tolerance only for ordinary decimal test comparisons, not formatting claims.
- [ ] Write `TestCalculateErrors` cases for divide by positive/negative zero, unsupported `power`, NaN/infinite operands, and `math.MaxFloat64 * 2`; assert `errors.As(err, *Error)` plus `Code`, and the exact division message.
- [ ] Run `go test ./internal/calculator -v` from `backend`; expected initial failure is missing implementation, not a tooling failure.
- [ ] Implement finite-input validation, operation dispatch, zero-divisor handling, and finite-result validation in `Calculate`; define `Error.Error()` returning `Message` without HTTP imports.
- [ ] Run the same package test; expect every case to pass. Run `go fmt ./internal/calculator`.

**Verification/outcome:** Domain tests pass, no transport dependencies exist, unsupported and overflow behavior are distinct. **Failure recovery:** Inspect the failing table row, preserve IEEE arithmetic semantics, and correct validation order or error classification rather than loosening assertions. **DoD:** Pure arithmetic/error contract is fully usable by T3.

### T3: Implement strict HTTP transport and server lifecycle

**Objective:** Expose the calculation contract safely through standard-library HTTP. **Dependencies:** T2. **Files:** `backend/internal/httpapi/handler.go`, `handler_test.go`, `backend/cmd/server/main.go`, `backend/go.mod`.

**Interfaces:** Consume `calculator.Calculate`; export `NewHandler() http.Handler`. Private request DTO uses `Operation string`, `A *float64`, `B *float64` with JSON tags; private response DTOs implement the spec envelopes. Use exact route path matching and shared JSON writer/error helper.

- [ ] Write `TestCalculateHandler` success cases for four operations and zero operand, asserting status, JSON Content-Type, and numeric result. Write `TestHealthHandler` for `{status: "ok"}`.
- [ ] Write `TestCalculateHandlerInvalidRequests` with malformed/empty/null/array/scalar bodies, absent/null operands, string/boolean operands, absent/null/empty operation, `1e309`, unknown fields, trailing object, wrong media type, valid charset, over-8192-byte body, and oversized trailing whitespace. Assert statuses/codes from the spec rather than decoder text.
- [ ] Write `TestCalculateHandlerDomainErrors` for unsupported operation, divide by zero, and `1e308 * 10`, expecting 422 and correct envelopes. Write routing cases for GET calculate => 405/Allow POST even without Content-Type, POST health => 405/Allow GET, and unknown/trailing-slash paths => 404.
- [ ] Run `go test ./internal/httpapi -v`; expect failure for missing handler before implementation.
- [ ] Implement `NewHandler`, method/media checks, bounded complete-body reading through `http.MaxBytesReader(..., 8192)`, `DisallowUnknownFields`, required-field checks, and second-decode EOF validation. Classify `*http.MaxBytesError` from the bounded read as 413 before parsing. Dispatch exact escaped paths directly. Translate typed domain errors to 422; emit stable user messages and JSON for every route/error path. Review correction: full reading is required to prioritize 413 over early syntax/trailing-value errors.
- [ ] Implement `main`: read `ADDR` with local default, create the configured `http.Server` timeouts from design, handle `os.Interrupt`/`syscall.SIGTERM`, shut down with a five-second context, and report actual listen failures. Do not treat `http.ErrServerClosed` as an unexpected failure.
- [ ] Run `go mod tidy`, `go fmt ./...`, `go vet ./...`, `go test ./... -coverprofile=coverage.out`, and `go tool cover -func=coverage.out` from `backend`; record actual test/coverage output for T6.

**Verification/outcome:** Domain/HTTP tests and vet pass; server compiles and has a documented runtime entry point. **Failure recovery:** Reproduce one failing request with `httptest`, check decoder/error order before changing policy; do not enable CORS to hide proxy mistakes. **DoD:** Exact HTTP contract and runnable robust bootstrap exist.

### T4: Bootstrap typed frontend and accessible responsive presentation

**Objective:** Establish the locked frontend toolchain, types, and polished UI surfaces. **Dependencies:** T1; T3 is not required for static rendering. **Files:** Frontend config/manifests, `index.html`, `src/main.tsx`, `src/styles.css`, `src/lib/calculator.ts`, `calculator.test.ts`, `src/components/{OperationSelector,ResultPanel}.tsx`, `src/App.tsx`, `src/test/setup.ts`.

**Interfaces:** Export shared TypeScript contracts from the file map. Export an `OPERATIONS` readonly list of `{ value: Operation; label: string; symbol: string }` with Add/+; Subtract/−; Multiply/×; Divide/÷. Components use the exact props above. `App` initially holds strings/selection/idle state, then receives full behavior in T5.

- [ ] Initialize Vite React TypeScript directly in `frontend` only if absent; install compatible React/ReactDOM, TypeScript/types, Vite/plugin, Vitest/matching V8 coverage, RTL/user-event/jest-dom, jsdom, ESLint/typescript-eslint/react-hooks/react-refresh. Preserve `package-lock.json`. Do not overwrite root files or use another package manager.
- [ ] Configure real `dev`, `build` (`tsc -b && vite build`), `lint`, `typecheck` (`tsc -b --pretty false`), `test` (`vitest run`), `test:coverage` (`vitest run --coverage`) scripts. Configure Vite `/api` proxy to `http://127.0.0.1:8080`, Vitest jsdom/setup, and focused source coverage including client/components but excluding bootstrap/test setup.
- [ ] Write `parseOperand` table tests: accept `0`, `-2.5`, `.5`, `1.`, `+2`, `1e3`, trimmed decimal; reject empty/whitespace, `0x10`, `Infinity`, `NaN`, `1,5`, `1_000`, `12abc`, `1e309`. Run `npm test -- src/lib/calculator.test.ts` expecting missing function failure.
- [ ] Implement exported contracts and `parseOperand` using the full-string regex and finite-number check in the design; no arithmetic result function belongs here. Rerun the parsing tests.
- [ ] Implement the semantic form and reusable operation/result presentation with labels, button types, `aria-pressed`, field association hooks, polite status, alert errors, and all four result states. Accessible names are exactly `First operand`, `Second operand`, `Add`, `Subtract`, `Multiply`, `Divide`, `Calculate`, and `Clear`. Branding/tagline use the exact copy in the spec.
- [ ] Implement a warm offwhite canvas, slim topbar/custom L monogram, `Workspace / Calculator` breadcrumb, headline `A little clarity. In every calculation.` with green emphasis, white operand panel and dark forest result panel, tiny section indexes, segmented operation row, operand cards, emerald CTA, subtle dot/grid texture, and editorial footer. Stack at 700px; add 44px controls, focus-visible rings, reduced-motion rules, and `min-width: 0`/overflow wrapping. Use a local font stack and text/inline icons only.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` from `frontend`; expect real tools to execute successfully. Remove unused starter assets/styles/counters.

**Verification/outcome:** Frontend boots/builds; lexical parsing is tested; required states and accessible surfaces exist. **Failure recovery:** Resolve the first actual compatibility/type/config error with a supported matching dependency version; do not disable strict checks wholesale. **DoD:** T5 can integrate behavior without redesigning the visual/component contracts.

### T5: Integrate REST and race-safe asynchronous UI with behavioral tests

**Objective:** Make the form work reliably through the real API contract. **Dependencies:** T3/T4. **Files:** `frontend/src/lib/api.ts`, `api.test.ts`, `App.tsx`, `App.test.tsx`; focused presentation/style fixes only when needed.

**Interfaces:** `calculate(input, signal)` and `ApiError` match the shared contract. `App` owns string inputs, selection, field errors, `CalculationState`, synchronous pending ref, current controller, timeout, and monotonic request token. The client returns the API number unchanged.

- [ ] Write API-client tests asserting POST URL/method/headers/body/signal, accepted finite numeric result including zero, mapped server envelope/status, rejected malformed/nonfinite success response, and propagated fetch rejection. Run targeted tests and confirm the missing-client failure.
- [ ] Implement the abortable typed client with runtime envelope checks; accept server error messages only when the envelope contains nonempty code/message strings; otherwise use `INVALID_RESPONSE` with the pinned design message. Avoid frontend arithmetic/retries.
- [ ] Write initial/validation/success/operation tests using RTL and `userEvent` with a mocked `calculate`. Assert form labels, operation pressed state, no call for invalid input, exact valid input object, returned `0.30000000000000004` displayed in full, and expression derived from submitted values.
- [ ] Write deferred-promise tests for loading/disabled submit, immediate double form submission => one call, Enter submission, API/network failure => useful alert and retry, and ten-second timeout => aborted signal and retry enabled. Use fake timers only in the timeout test and restore timers afterward.
- [ ] Write race tests: success disappears on either operand edit or operation change; pending request signal aborts on each edit/clear/unmount; A ignored after edit; B remains locked when A settles late; clear resets both strings, operation to `add`, field errors, and result. Mock A to ignore abort so generation checks are actually exercised.
- [ ] Run `npm test -- src/lib/api.test.ts src/App.test.tsx`; confirm expected failing behavioral assertions before integrating state.
- [ ] Implement submit validation and synchronous guard before creating the request; schedule ten-second timeout; set loading; capture submitted values/token; set success/error only for the current token. Invalidate/abort/clear timer on every edit/clear/unmount and ignore superseded catch/finally branches. Timeout must display its own useful message while cancellation from edits remains silent.
- [ ] Connect accessible field errors, live messages, clear action, and expression/result presentation. Keep editing controls active during loading. If adding optional clipboard support, copy `String(result)`, announce copy success/failure, and add its focused test; otherwise skip it.
- [ ] Run `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build`; record actual counts and coverage without hardcoding expected percentages.

**Verification/outcome:** Both API and user-level tests pass; all required UI states and races are covered; no authoritative JS arithmetic exists. **Failure recovery:** Capture the failing event order, check request-token ownership and timer cleanup, and make the smallest fix; do not replace targeted race tests with sleeps. **DoD:** A user can calculate, cancel by editing, recover from failures, and never see a superseded result.

### T6: Verify real integration, refine UX, and complete factual documentation

**Objective:** Prove the working product beyond mocks and make it reproducible. **Dependencies:** T3/T5. **Files:** Root scripts/`AGENTS.md`, `README.md`, `AI_PROMPTS.md`, `docs/ENVIRONMENT.md`, `docs/VERIFICATION.md`; narrow source/style fixes discovered by verification. Optional `.github/workflows/ci.yml` only if cheap and matching real commands.

**Interfaces:** Parent owns this task. Root scripts delegate `npm --prefix frontend ...`; portable backend commands use `scripts/backend.mjs`. `spec:validate` uses local OpenSpec; `verify:frontend` runs lint/typecheck/coverage/build; `verify` invokes backend, frontend, then spec validation sequentially. `dev:backend` and `dev:frontend` start individual services; `test:e2e` uses the parent's Playwright/system Chrome setup.

- [ ] Add root scripts and concise `AGENTS.md` with directory map, exact quality commands, workspace/preservation rules, and prohibition on fabricated check results. If CI is added, use supported setup-node/setup-go actions and locked install commands; do not add release/publish automation.
- [ ] Start Go and Vite as hidden background processes or managed command sessions; capture logs/session IDs for cleanup. Wait on `/api/health` and the frontend URL rather than using arbitrary long sleeps.
- [ ] Verify real HTTP success (`divide 120/4 => 30`), malformed/missing input 400, and divide-by-zero 422 with PowerShell or a Node fetch probe; verify the Vite `/api/health` proxy reaches Go.
- [ ] Use available browser automation to inspect a desktop viewport around 1440×1000 and mobile 320×800; perform real UI success and zero-division; verify Tab/focus, Enter, field validation, operation toggles, clear, long result wrapping, and absence of page horizontal overflow. Capture screenshots/evidence only for checks actually performed.
- [ ] Stop/pause the backend or use an observed deterministic network failure path and confirm useful React error/retry behavior; restore the service if subsequent checks need it. Correct confirmed layout/accessibility defects, then rerun affected tests and one relevant viewport check.
- [ ] Write README sections for overview/tagline, stack, architecture, features, prerequisites/setup/run, API request/errors, test commands and actual coverage, real SOLID responsibilities, UX/accessibility, OpenSpec, actual model workflow, float64 limitations, and focused future improvements. Explain local module renaming without inventing a repository owner and development-only Vite proxy/production same-origin expectation.
- [ ] Populate `AI_PROMPTS.md` with the supplied master prompt verbatim (UTF-8 source attachment is available to parent) plus meaningful actual planner/executor/review prompts or accurate references; never invent prompt history. Update environment report and `docs/VERIFICATION.md` with commands, actual results, browser scope, blockers, and current check time.
- [ ] Run root `npm run verify` and `npm run test:e2e`; also run `go fmt ./...` and `go tool cover -func=coverage.out` from `backend` through the available Go path. Inspect `git diff --check`, `git status --short --branch`, and ensure no dependencies, tools, secrets, build output, or coverage artifacts are tracked.

**Verification/outcome:** The real API and React integration are exercised, responsive evidence exists or is explicitly unavailable, and setup/docs reflect real commands. **Failure recovery:** Diagnose service logs and proxy target before changing client contracts; if browser/tooling is unavailable, record precisely which checks remain unverified and continue all deterministic checks. **DoD:** Product and documentation are ready for one bounded independent review.

### T7: Bounded final independent review and completion evidence

**Objective:** Resolve meaningful remaining defects and deliver an honest final report. **Dependencies:** T6. **Files:** Reviewer reads whole change; executor owns only confirmed targeted fixes and factual document/task status updates.

**Interfaces:** One reviewer reports `Critical`, `Important`, and `Minor` findings with file/line, reproducible consequence, and targeted recommendation. The reviewer does not redesign scope or silently edit app code. Parent orchestrates this final review; the executor does not spawn additional agents.

- [ ] Request the single independent review of arithmetic/JSON contract/validation, finite numbers, async races, accessibility/mobile, dependency/tool configuration, architecture, test coverage gaps, and documentation accuracy; include actual test/browser evidence and known limitations.
- [ ] Triage findings against the specs; fix every Critical/Important item and only low-risk Minor items. Add or strengthen the regression test for a real behavioral defect before its correction.
- [ ] Rerun the affected targeted checks after each bounded correction; run `npm run verify` once after the final code change. Record final actual coverage and build results; do not repeat passing suites without a reason.
- [ ] Mark completed plan/OpenSpec tasks accurately, revalidate OpenSpec, run `git diff --check` and `git status --short --branch`, and stop managed development processes that are no longer needed.
- [ ] Deliver final evidence covering actual workspace/Git branch, environment/tool versions/install outcomes, functionality/architecture/integration, OpenSpec status, selected skills/actual model routing, tests/coverage/build/browser UX, repository status/no publication, and unresolved actions.

**Verification/outcome:** No unresolved Critical/Important finding remains; final report matches executable evidence. **Failure recovery:** If an external prerequisite genuinely blocks a required check, preserve work and state the exact unverified outcome and necessary next action; never label blocked work as passed. **DoD:** Complete local portfolio project and a self-contained factual handoff; no push, release, or commit is made.

## Coverage map and internal readiness gate

| Master prompt stage | Owning plan task |
| --- | --- |
| 1 root; 2 missing dependencies; 3 toolchain; 4 OpenSpec; 5 architecture | T1 and this validated design |
| 6 domain | T2 |
| 7 handlers; 8 backend tests | T3 |
| 9 React bootstrap; 10 design system; 11 interface | T4 |
| 12 REST; 13 async/validation; 14 frontend tests | T5 |
| 15 end-to-end; 16 responsive UX; 17 quality; 18 docs | T6 |
| 19 final review | T7 |

- [x] Mandatory requirements map to a task and acceptance scenario; optional scope is explicitly limited.
- [x] API statuses/envelopes, exported names/types, paths, frontend state, and numeric behavior agree across artifacts.
- [x] Five review-focus failures have owning tests/checks.
- [x] Each task states dependencies, files, steps, verification outcomes, recovery, and DoD without duplicating the specs' full contract.
- [x] User authorization permits automatic execution and the requested single-executor/bounded-review routing; no design approval stop is needed.
- [x] No architecture blocker remains. Parent verified portable Go/root OpenSpec installations; browser download certificate failure is handled by validated system Chrome, not a certificate bypass.

Planning self-review found no omitted mandatory stage. Runtime dependency/CLI results, browser availability, and actual coverage remain evidence to collect during execution.
