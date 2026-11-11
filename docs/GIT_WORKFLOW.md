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

1. Inspect status and preserve unrelated work. Verify `origin`, run `git fetch origin`, and inspect `main` versus `origin/main`. Fast-forward with `git merge --ff-only origin/main` if needed; stop on divergence or unsafe local changes.
2. Create a focused branch from the latest validated `main` and implement only that change. For each of these post-publication improvements, create exactly one focused Conventional Commit.
3. Review the actual diff and run applicable checks. Documentation-only changes require `git diff --check`, link/path checks and evidence consistency; application changes require the relevant backend/frontend/browser checks.
4. Stage explicit paths or reviewed hunks, inspect the staged diff, and check for secrets, generated output and unintended files. Commit using the configured identity and current timestamps.
5. Switch to `main` and merge locally with `git merge --no-ff <branch>`. The merge is a separate commit with two parents; do not squash the implementation commit. Confirm the merged tree and recheck status.
6. When that task explicitly authorizes publication, push the verified `main` with `git push origin main`. Confirm the remote SHA and the implementation commit's ancestry. Inspect the Actions run for that exact pushed SHA; a previous successful run does not prove the new commit passed.
7. Start the next branch from the synchronized `main`. After the final merge, run the complete local checks below. Retain branch tips until verification is complete; remove a branch later only when it is merged and no longer needed.

Full-project gates, from the repository root:

```powershell
npm run verify
npm run test:e2e
```

`verify` runs Go formatting, vet, tests/coverage, OpenSpec strict validation, frontend lint, type checking, coverage and production build. The browser gate starts Go and Vite and exercises their real integration. See [environment setup](ENVIRONMENT.md) and [implementation verification](VERIFICATION.md).

For a backend-only stage, use `node scripts/backend.mjs fmt ./...`, `node scripts/backend.mjs vet ./...` and `node scripts/backend.mjs test ./...` (or the corresponding `go` commands inside `backend`). For a frontend-only stage, run `npm --prefix frontend run lint`, `typecheck`, `test:coverage` and `build`. If a component or its test harness is not yet present in an intermediate snapshot, record exactly which integration checks are deferred and run them when the required files exist.

## Protect main and existing work

Never force-push, use `reset --hard`, discard untracked files, or rewrite existing/published history. Do not amend old commits, rebase/cherry-pick completed features to reconstruct their development, or change author identities/timestamps. Avoid direct feature commits on `main`. Respect existing branch protection and stop if it blocks a push; changing repository settings requires separate authorization. Review requirements, required `verify` checks and disabled force-pushes are recommended protection practices, not a claim that this document configured or inspected those settings. Committing or merging does not imply permission to push.

Track source, lockfiles, specs, workflow definitions and documentation assets. Curated screenshots in `docs/images/` are documentation referenced by the README; transient screenshots, test output, local tools, dependency folders, build output, caches and secrets remain ignored.

## Historical record and published baseline

The application was completed before its Git history was organized. The initial local preparation grouped already-existing code, tests and documentation retrospectively. Its logical stages must not be presented as a record of when the features were originally designed or implemented.

At the start of the post-publication improvements, published `origin/main` had this **linear** ancestry:

| Commit | Actual contents / role |
| --- | --- |
| `3871957` | Repository's initial commit |
| `66ff749` | Existing repository baseline policy |
| `ab1c420` | Existing Go domain, API, server and tests |
| `31878af` | Existing React interface, locked toolchain and tests |
| `86c77ff` | Existing quality gates, OpenSpec and engineering documentation |

The retained `feature/go-calculation-api`, `feature/react-calculator-ux` and `chore/project-quality-and-documentation` branches point to a **separate earlier local lineage**. That lineage includes merge commits `989dcc9` and `753af67`, and ends at `74db39d`. Those merges are not ancestors of published baseline `86c77ff`. The two tips `74db39d` and `86c77ff` have identical file trees, but their commit ancestry differs. Both lineages, branch tips, authors, dates and contents are preserved; this documentation correction neither moves them nor manufactures historical merges.

## Genuine post-publication merges

The process above applies to new focused work. The publication/CI documentation improvement demonstrates the actual workflow: branch `docs/refresh-publication-ci-status` contains implementation commit `89ec0ac`; merge `57915c9` has parents `86c77ff` and `89ec0ac`, was pushed to `origin/main`, and passed [hosted run 43112301777](https://github.com/victor9205/luxcalc-react-go/actions/runs/43112301777). The subsequent history and UX documentation branches follow the same one-commit plus separate `--no-ff` merge contract.

Inspect reality with `git log --graph --oneline --decorate --all -20`, `git show --no-patch --format="%H %P" <merge-sha>` and `git merge-base --is-ancestor <branch> main`. A merge should have two parents and a real focused change relative to its first parent. Earlier implementation reports retain their original local-handoff context; [verification evidence](VERIFICATION.md) records publication and hosted CI separately.
