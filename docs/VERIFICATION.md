# Verification evidence

This document preserves the initial local implementation report and records later hosted verification separately. Its pre-commit repository notes describe the original delivery snapshot. For branching policy and the actual published history, see [GIT_WORKFLOW.md](GIT_WORKFLOW.md) and the Git graph.

## Hosted publication verification

The repository is public at [victor9205/luxcalc-react-go](https://github.com/victor9205/luxcalc-react-go). On 2026-11-11, GitHub's API confirmed the latest existing `main` workflow run at the start of the documentation refresh:

| Evidence | Verified value |
| --- | --- |
| Workflow | [Quality checks, `.github/workflows/ci.yml`](https://github.com/victor9205/luxcalc-react-go/actions/workflows/ci.yml) |
| Run | [43002167130, attempt 1](https://github.com/victor9205/luxcalc-react-go/actions/runs/43002167130) |
| Branch / event | `main` / `push` |
| Commit | [`86c77ff758558b2f2515c0400cd391da8826719b`](https://github.com/victor9205/luxcalc-react-go/commit/86c77ff758558b2f2515c0400cd391da8826719b) |
| Run / job | `completed` / `success`; job `verify` completed successfully |
| Hosted checks | Dependency restoration, `npm run verify`, Chromium installation and `npm run test:e2e` passed |
| Counts and coverage | Logs confirm 50 frontend tests, 7 browser tests; frontend statements 98.42%, Go domain 100%, HTTP 96.4%, overall Go 75.6% |

This is a pinned successful hosted baseline on Ubuntu/Chromium. Later pushes have their own runs; the [workflow page](https://github.com/victor9205/luxcalc-react-go/actions/workflows/ci.yml) and README badge expose current status. A success recorded for this SHA must not be assumed for a newer SHA. Hosted execution supplements the historical local evidence below.

## Initial local implementation report

Local execution date: 2026-11-11, in the opened `C:\Projetos\luxcalc-react-go` workspace. At this initial handoff, GitHub Actions had not yet run and publication was still pending; the later hosted result is recorded above.

## Toolchain and specifications

- Go 1.27.4 official archive hash matched before extraction; `go version` executed successfully.
- Node 22.22.3, npm 10.9.8, Git 2.56.0.windows.4 verified.
- OpenSpec 1.17.0 initialized with `--tools codex`; `npm run spec:validate` passed before implementation.
- Root `npm audit --audit-level=high`: zero vulnerabilities at the time of execution.
- Playwright 1.65.0 launched installed Chrome 157.0.8103.39. Playwright's bundled browser download failed with a certificate-chain error; installed Chrome is the supported fallback, without disabling TLS checks.

## Automated checks

`npm ci` and `npm --prefix frontend ci` restored the locked toolchains successfully using normal peer validation. `npm run verify` completed successfully after the application fixes:

| Check | Actual outcome |
| --- | --- |
| `go fmt ./...` | Passed |
| `go vet ./...` | Passed |
| `go test ./... -coverprofile=coverage.out` | All domain/HTTP tests passed |
| `go tool cover -func=coverage.out` | Domain 100%; HTTP 96.4%; all packages 75.6% |
| `npm run spec:validate` | Strict OpenSpec validation passed |
| Frontend `npm run lint` | Passed |
| Frontend `npm run typecheck` | Passed, including Vite/Vitest configuration |
| Frontend `npm run test:coverage` | 4 files, 50 tests passed |
| Frontend `npm run build` | Passed; Vite 8.3.8 production bundle |
| npm audits, root and frontend | Zero reported vulnerabilities in final dependency graphs |

Frontend V8 coverage: **98.42% statements (125/127), 93.9% branches (77/82), 100% functions (21/21), 99.16% lines (119/120)**. The selection includes `App`, presentation components, client and operand parsing; bootstrap, styles and test utilities are excluded. Domain `Calculate` and typed error formatting are covered. Go's overall percentage includes `cmd/server/main.go` at 0% unit coverage; startup is exercised through real browser integration, but signal/draining lifecycle is not claimed as an automated test.

[EXECUTION.md](EXECUTION.md) preserves the implementer's handoff evidence and the parent's completion/debugging pass, including the limits of the test-first record.

## Browser and integration checks

The committed suite `tests/e2e/calculator.spec.mjs`, run by `npm run test:e2e`, passed **7/7** in installed Chrome 157.0.8103.39. It started fresh Go and Vite processes through the root scripts, exercised the actual `/api` proxy, and stopped its managed services afterward.

- Desktop 1440×1000: invalid inputs, keyboard submission of `120 ÷ 4`, real HTTP 200/result 30, result display, stale-result removal after edit, and no page JavaScript errors in that scenario.
- Real division by zero: HTTP domain error displayed in React, then corrected input and successful retry.
- Mobile 320×740: full `0.30000000000000004`, scientific `1e+300`, single-column flow and no horizontal scrolling. Reduced-motion transition duration was checked.
- Simulated transport failure: useful connection guidance and recovery on edit.
- Held request: disabled submit, no duplicate request after Enter, edit cancellation and no stale display.
- Live transport: missing operand 400, unsupported operation 422, wrong method 405/`Allow: POST`, oversized trailing JSON 413 and encoded-slash JSON 404.
- Keyboard-only Tab/Enter sequence: brand, operation buttons, operands, visible focus, operation selection and successful API-backed calculation.

Desktop and mobile screenshots were visually inspected after contrast and long-result typography refinements. Curated screenshots are in `docs/images/`; transient screenshots and failure traces are ignored under `.artifacts/`. Small muted text contrast was improved from measured ratios below 4.5:1 to a darker common token; this is a focused check, not a claim of a complete WCAG certification or assistive-device audit. Testing used Chrome on Windows; other browsers and real mobile hardware were not exercised.

## Independent review

One independent read-only Sol high-effort review found no Critical issue, one Important issue and two Minor issues. All three were corrected in one bounded pass:

- **Important:** oversized bodies could produce 400 before reaching the 8 KiB limit when trailing JSON or an early malformed character was present. New regressions reproduced both failures; the handler now fully reads through `MaxBytesReader` before decoding, so every oversized calculation body receives 413. Both regressions passed afterward.
- **Minor:** an encoded slash could escape the JSON error envelope through `ServeMux`'s escaped-segment matching. A regression reproduced the plain-text 404. Direct exact escaped-path dispatch now returns the documented JSON 404.
- **Minor:** an unused frontend dependency on `file:..` coupled it to the parent tooling package. It was removed, the lockfile regenerated in the frontend directory, and clean installation rechecked.

Review decisions: duplicate/case-insensitive JSON keys retain Go decoder behavior; underflow and signed-zero display retain IEEE 754/JavaScript string behavior; clicking a selected operation invalidates the result as a deliberate edit action. These are documented scope/numeric choices, with no unresolved Critical/Important finding. No minor finding was deferred. The reviewer also probed a separately started live backend and stopped it afterward. There was no second review loop.

## Repository at the initial handoff

Git was initialized directly in the previously empty opened root, on `feat/luxcalc-foundation`. No existing history was reset. Source, lockfiles, specifications, documentation, curated screenshots and CI are new uncommitted files. Generated output, local tools and transient evidence are ignored. No commit, remote, push or publication was created by this task.
