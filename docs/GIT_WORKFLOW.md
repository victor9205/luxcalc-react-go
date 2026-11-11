# Git workflow

Use `main` as the integration branch. Start each focused branch from the latest validated local `main`; this project does not use a separate `develop` branch.

## Branch and commit names

Use lowercase kebab-case after a purpose prefix:

| Prefix | Purpose | Example |
| --- | --- | --- |
| `feature/` | New functionality | `feature/calculation-history` |
| `fix/` | Bug fixes | `fix/result-announcement` |
| `test/` | Tests and coverage | `test/timeout-recovery` |
| `docs/` | Documentation | `docs/api-examples` |
| `refactor/` | Behavior-preserving restructuring | `refactor/result-panel` |
| `chore/` | Tooling and infrastructure | `chore/dependency-maintenance` |

Use Conventional Commits: `<type>(<scope>): <imperative description>`. Examples: `feat(api): add percentage operation`, `fix(ui): announce validation errors`, `docs(workflow): document merge checks`. Describe only changes actually included; keep implementation and its required tests together when splitting would leave an incomplete snapshot.

## Complete and merge a branch

1. Inspect status and preserve unrelated changes. Create a focused branch from validated `main`.
2. Stage explicit paths or reviewed hunks. Inspect the staged diff and check for secrets, generated output and unintended files.
3. Commit using the existing Git author/committer identity and normal timestamps. Never amend/rebase existing commits to manufacture a timeline.
4. Run applicable checks and inspect the branch diff against `main`. Stop on failures or ambiguous conflicts.
5. Merge locally using `git merge --no-ff <branch>` and an accurate merge message. Confirm success and recheck status.
6. After the final merge, run the complete checks and retain working branches until verification is complete. Remove a branch later only after confirming it is merged and no longer needed.

Full-project gates, from the repository root:

```powershell
npm run verify
npm run test:e2e
```

`verify` runs Go formatting, vet, tests/coverage, OpenSpec strict validation, frontend lint, type checking, coverage and production build. The browser gate starts Go and Vite and exercises their real integration. See [environment setup](ENVIRONMENT.md) and [implementation verification](VERIFICATION.md).

For a backend-only stage, use `node scripts/backend.mjs fmt ./...`, `node scripts/backend.mjs vet ./...` and `node scripts/backend.mjs test ./...` (or the corresponding `go` commands inside `backend`). For a frontend-only stage, run `npm --prefix frontend run lint`, `typecheck`, `test:coverage` and `build`. If a component or its test harness is not yet present in an intermediate snapshot, record exactly which integration checks are deferred and run them when the required files exist.

## Protect main and existing work

Never force-push, use `reset --hard`, discard untracked files, or rewrite existing/published history. Do not change author identities or timestamps. Avoid direct feature commits on `main` after the initial baseline. When a remote is explicitly authorized, configure hosted branch protection to require pull requests/review and the `verify` CI job; disallow force-pushes and branch deletion. No hosted protection has been configured locally, and no remote push is automatic.

Track source, lockfiles, specs, workflow definitions and documentation assets. Curated screenshots in `docs/images/` are documentation referenced by the README; transient screenshots, test output, local tools, dependency folders, build output, caches and secrets remain ignored.

## Initial retrospective organization

The application already existed as untracked files. There were no commits, tracked files, `main` branch or remote; `HEAD` named the unborn `feat/luxcalc-foundation` branch. This organization records current logical units, not historical development dates:

1. A real initial baseline on `main`: ignore rules, line-ending/editor policy and license. Only configuration checks apply; application checks are deferred.
2. `feature/go-calculation-api`: complete Go domain, HTTP/server, backend tests and portable-Go runner. Backend checks apply; frontend/integration gates are deferred until their files are tracked.
3. `feature/react-calculator-ux`: complete frontend, locked dependencies and frontend tests. Frontend checks apply; the committed browser harness arrives in the next unit.
4. `chore/project-quality-and-documentation`: root tooling/lockfile, complete quality/browser/CI gates, OpenSpec integration, documentation and this workflow. These files stay together because the verification entry point requires the specs and the docs describe the final integrated project. Full regression and browser gates apply.

Each focused branch is merged locally with `--no-ff` after its checks pass. Branch tips remain available for inspection. Git's actual graph is the authoritative list of commits and current timestamps. Earlier implementation reports preserve their original pre-commit delivery context.

The baseline's ignore/attribute checks passed. The API unit passed formatting, vet, uncached Go tests and build. The UI unit passed lint, type checking, all 50 frontend tests with coverage and its production build. Complete root/browser gates are run on the quality unit before its merge and again on the final `main`; final outcomes are recorded in the merge message and delivery report. Application source is preserved rather than reformatted solely for this history operation.
