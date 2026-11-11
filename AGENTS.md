# LuxCalc engineering guide

Work in this repository root. Preserve existing work; do not publish or push automatically.

- Backend: Go standard library; domain in `backend/internal/calculator`, HTTP in `backend/internal/httpapi`, bootstrap in `backend/cmd/server`. Module: `luxcalc/backend`.
- Frontend: React + TypeScript + Vite. The Go API is the sole source of arithmetic results. Use relative `/api` requests via the Vite proxy.
- Specifications: `openspec/changes/luxcalc-fullstack-foundation`. Executed plan: `docs/IMPLEMENTATION_PLAN.md`.
- Verify: backend `go fmt ./...`, `go vet ./...`, `go test ./... -coverprofile=coverage.out`; frontend `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build`.
- On this machine, portable Go is at `.tools/go/bin/go.exe` (ignored); do not commit tools, secrets, build output or transient screenshots. Curated `docs/images/` assets referenced by the README are tracked documentation.
- Test domain and asynchronous behavior meaningfully. Keep labels, visible focus, keyboard submission, mobile 320px and reduced motion working.
- Document actual evidence, never inferred coverage, browser checks, or model routing.
- Integrate through `main` using focused `feature/`, `fix/`, `test/`, `docs/`, `refactor/` or `chore/` branches and Conventional Commits. Verify before local `--no-ff` merges; preserve existing history and identity. See `docs/GIT_WORKFLOW.md`.
