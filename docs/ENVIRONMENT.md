# Development environment

Validated on 2026-11-11 in the opened `luxcalc-react-go` workspace.

| Component | Observed version / result |
| --- | --- |
| OS | Windows NT 10.0.26300, x64 |
| Shell | Windows PowerShell 5.1.26100.9818 |
| Git | 2.56.0.windows.4; repository initialized in the opened root |
| Node.js | 22.22.3 |
| npm | 10.9.8 |
| Go | 1.27.4 windows/amd64, portable `.tools/go/bin/go.exe` |
| OpenSpec | 1.17.0, pinned root development dependency |
| Playwright | 1.65.0, pinned root development dependency |
| Prettier | 3.9.10, pinned root development dependency |
| Browser | System Chrome 157.0.8103.39; headless launch verified |

Go was absent. The official `go1.27.4.windows-amd64.zip` was downloaded from [go.dev](https://go.dev/dl/) and verified against the official SHA-256 `178ab98950ac69ab25069307dc6ade79f3816e414cce95b4da166a115cde1e7e` before extraction. Tools stay in ignored `.tools/`; no global settings were changed. The first PowerShell transfer stalled and was stopped; a bounded `curl.exe` download succeeded with certificate validation enabled.

The Playwright browser download failed with `SELF_SIGNED_CERT_IN_CHAIN`. The installed Chrome works through Playwright's supported `channel: 'chrome'` setting. No certificate checks were disabled. On another machine, use `npx playwright install chromium` and set `PLAYWRIGHT_CHANNEL=chromium` for browser checks; otherwise the default is installed Chrome.

## Restore and run

Install [Go](https://go.dev/doc/install) 1.27+ and Node.js 22.22.3+ (or a compatible current LTS). The exact JavaScript graph is recorded in both lockfiles. No global TypeScript, OpenSpec, Vite or test runner is needed.

```powershell
npm ci
npm --prefix frontend ci
npm run dev:backend
# In another terminal:
npm run dev:frontend
```

`scripts/backend.mjs` uses `.tools/go/bin/go.exe` on Windows when present, otherwise `go` from PATH. Direct backend commands also work after adding the portable Go bin directory to the current shell PATH.

```powershell
npm run verify
npm run test:e2e
```

Final verification evidence is recorded in [VERIFICATION.md](VERIFICATION.md). Backend uses only the Go standard library; frontend and tooling dependencies are declared in their package manifests and lockfiles. No required setup blockers remain after the Chrome fallback.

## Frontend dependencies and recovery

React/ReactDOM 19.3.1, TypeScript 5.9.3, Vite 8.3.8 with React plugin 6.0.0, Vitest/V8 coverage 5.1.0, jsdom 31.0.0 and React Testing Library 16.3.0 are pinned. Lint uses ESLint 10.14.0, `@eslint/js` 10.0.1, typescript-eslint 8.72.2, React Hooks plugin 7.1.1 and Refresh plugin 0.5.7. Full manifests/lockfiles are authoritative.

A mixed ESLint 9 / `@eslint/js` 10 setup failed peer validation during a restore check. The final supported ESLint 10/plugin versions resolve that conflict; installation uses normal npm peer validation. TypeScript 5.9 is within typescript-eslint's supported range. No `--force` or `--legacy-peer-deps` is needed for the final lockfile.

The lint graph (`@typescript-eslint/typescript-estree`, `eslint`, and `@eslint/config-array`) currently declares vulnerable older minimatch lines. Narrowly scoped npm overrides pin minimatch 11.0.7, which has supported CommonJS/ESM exports and meets this Node version. This addresses [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), whose patched release starts at 11.0.1. The override is verified with lint and clean installation; remove it when upstream ranges include a patched version. Audits are recorded in the final verification report.
