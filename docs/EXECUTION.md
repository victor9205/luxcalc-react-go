# Execution evidence (T2–T5)

- Backend domain RED: `go test ./internal/calculator -v` failed because the planned `Calculate` and `Error` symbols did not exist. GREEN: the same command passed all arithmetic and typed-error cases.
- HTTP RED: `go test ./internal/httpapi -v` first failed because `NewHandler` did not exist. GREEN: the route and contract tests passed after implementation; expanded coverage now includes success values, strict decoding, limits, statuses, and `Allow` headers.
- API-client RED: `npm test -- src/lib/api.test.ts` failed because `./api` did not exist. GREEN: API request/envelope tests passed after implementation.
- Frontend: `npm run typecheck` and `npm run lint` passed. `npm run build` passed with Vite 8.3.8. A targeted frontend run passed 7 selected tests; the full App suite still has a timeout-test hang under investigation and is not claimed as passing.
- Backend latest: package tests passed (`calculator` 93.3%, `httpapi` 96.4%). `go vet ./...` passed before the HTTP test expansion; rerun after expansion. Coverage report command has not yet completed successfully.
- Browser integration evidence is owned by the parent; parent reports all seven real-browser checks passed against the Go/Vite integration, including desktop, 320px layout, errors, network recovery, cancellation, and keyboard focus.

## Parent completion pass

The handoff notes above describe the executor's state at handoff, not the final result.

- First browser run: four failures and two passes. The network response was correct, but StrictMode replay left the mounted ref false. After setup/cleanup symmetry was corrected, all seven final browser scenarios passed. The primary success test also runs inside StrictMode.
- The isolated ten-second timeout assertion completed, but the cleanup hook then hung. Root cause: `beforeEach(() => mockedCalculate.mockReset())` returned the mock; Vitest executed the returned function as teardown, yielding a never-settling mocked request. A block body returning nothing fixed it (failing hook → passing isolated test). Fake timers then reduced the timeout case from ten seconds to milliseconds.
- Corrected the API-error test fixture to throw the actual `ApiError` contract, rather than a generic network error. Added thirteen race/recovery tests: every edit/clear, late responses, B's lock and timer ownership, timeout despite ignored abort, retry and unmount cleanup. Added malformed client-envelope and connection tests.
- Validation announcement regression: the test could not find an alert before the fix; adding alert semantics to associated field messages made it pass. Muted text/focus contrast and responsive typography for long results were refined and screenshots inspected.
- Final full application check: 50 frontend tests passed; Go domain/HTTP tests passed; formatting, vet, lint, type checking, strict OpenSpec validation and Vite production build passed. Coverage and final review details are in `docs/VERIFICATION.md`.
- Some added regression coverage was written after the worker's corresponding fix. The recorded domain/client RED→GREEN and browser/validation regressions are actual evidence; this repository does not claim that every line followed a test-first sequence.

## Independent review corrections

Oversized trailing JSON and early malformed content returned 400 instead of the specified 413; both new tests failed before bounded full-body reading and passed afterward. The encoded-slash routing case also failed its JSON contract before exact escaped-path dispatch and passed afterward. The unused parent-package dependency was removed and its lockfile regenerated from the frontend directory. The final full checks were rerun after these corrections; the verification report is the authority for final coverage.
