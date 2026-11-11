# LuxCalc full-stack foundation

## Why

LuxCalc evolves an object-oriented Delphi calculator into a small, maintainable full-stack portfolio project. A polished calculator is useful only when its arithmetic, REST boundary, asynchronous UI, and setup instructions are dependable together.

## What Changes

- Add a standard-library Go REST service with four arithmetic operations, explicit validation, typed errors, health reporting, and graceful shutdown.
- Add a premium, accessible React/TypeScript calculator that obtains all results from the service and handles pending, failed, invalid, and superseded requests.
- Add meaningful backend and frontend tests, reproducible local dependencies, responsive browser verification, and honest verification evidence.
- Record architecture, environment, API, numerical limitations, and the actual AI-assisted workflow.

## Capabilities

### New Capabilities

- `calculation-api`: Independent arithmetic domain and a validated JSON HTTP API.
- `calculator-ui`: Responsive calculator workspace, accessible interaction, and reliable API-driven state.

### Modified Capabilities

None; the opened workspace was initially empty.

## Impact

Creates `backend/`, `frontend/`, root development scripts, project documentation, and this single OpenSpec change in the existing workspace. Development uses a Vite `/api` proxy to Go; there is no database, authentication, general CORS policy, remote font dependency, or automatic publication. Detailed execution is maintained once in `docs/IMPLEMENTATION_PLAN.md`.
