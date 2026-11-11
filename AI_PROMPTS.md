# Actual AI prompts

The following master prompt was supplied by the user. It is reproduced verbatim as provided. Agent task prompts and verified model routing are recorded in docs/AI_WORKFLOW.md; no earlier prompt history was supplied.

````text
# MASTER PROMPT — LUXCALC FULL-STACK

**React + TypeScript + Go | Clean Architecture | SOLID | REST API | OpenSpec | Advanced UX | AI-Assisted Engineering**

## 0. Mission and project identity

You are the autonomous software engineering orchestrator responsible for creating **LuxCalc Full-Stack**, a professional open-source portfolio project.

**Project name:** LuxCalc Full-Stack

**GitHub repository name:** `luxcalc-react-go`

**Application name:** LuxCalc

**Tagline:** Modern Calculation. Thoughtful Engineering.

LuxCalc is the modern evolution of an earlier Delphi calculator developed using object-oriented programming, MVC, SOLID principles, and API integrations.

The objective is to demonstrate modern full-stack engineering using React, TypeScript, Go, REST APIs, specification-driven development, professional UX, automated testing, and efficient AI-assisted implementation.

Deliver a functional, maintainable, visually impressive application through one end-to-end execution request.

The project must remain small enough to complete through approximately 2–4 hours of focused engineering work.

**Execution priority:**

1. Correctness and working frontend/backend integration.
2. Outstanding frontend UX and responsive design.
3. Clean, maintainable architecture.
4. Automated tests and reliable verification.
5. Accurate documentation and specifications.
6. Efficient agent orchestration and token usage.

Do not introduce architectural complexity merely to demonstrate design patterns.

---

# 1. CRITICAL — WORKSPACE AND PROJECT DIRECTORY

**Always create and modify the project inside the directory currently opened by the Codex execution environment.**

The user will normally open:

`C:\Projects\luxcalc-react-go`

However, this path is an example, not a required absolute destination.

### Workspace discovery

Before creating or modifying files:

1. Determine the current working directory.
2. Inspect whether the directory is a Git repository.
3. Identify the active repository/workspace root.
4. Inspect the existing files and directory structure.
5. Confirm that the selected directory is a suitable project workspace.
6. Set the discovered directory as `PROJECT_ROOT`.

Use the project root as the base for all subsequent filesystem operations.

### Important rules

- Never hardcode `C:\Projects\luxcalc-react-go` as the execution destination.
- Never create another `luxcalc-react-go` directory inside the opened project directory.
- Never silently switch to a different workspace.
- Never create the project in a parent directory when a dedicated project folder is already open.
- Use relative file paths whenever possible.
- Do not change or delete unrelated existing projects.
- Do not reset an existing Git repository.
- If the selected directory is empty, initialize the project there.
- If Git is not initialized, initialize it in the selected project root once Git is available.
- If relevant application files already exist, inspect and reuse them.
- If the current directory is clearly a generic parent folder or an unrelated project, do not write into it blindly. Report the workspace mismatch.

Example of correct result:

```text
C:\Projects\luxcalc-react-go\
    backend\
    frontend\
    openspec\
    docs\
    README.md
    AGENTS.md
    AI_PROMPTS.md
    .gitignore
```

Incorrect:

```text
C:\Projects\luxcalc-react-go\
    luxcalc-react-go\
        backend\
        frontend\
```

The opened project workspace is the authority for file placement.

---

# 2. CRITICAL — AUTOMATIC ENVIRONMENT VALIDATION

The project must support development environments where some or all required tools are missing.

**Do not assume Go, Node.js, npm, TypeScript, OpenSpec, Git, or test dependencies are installed.**

Before planning or implementation, perform an environment preflight.

## 2.1 Detect the operating system

Identify:

- Operating system.
- Active shell.
- Current working directory.
- Relevant package managers.
- Available executables.
- Permissions and installation limitations.

For Windows, prefer commands compatible with PowerShell.

For Linux/macOS, use compatible native commands.

Do not assume Bash is available on Windows.

## 2.2 Verify required tooling

Check:

| Tool | Purpose | Required |
|---|---|---|
| Git | Repository management | Yes |
| Go toolchain | Backend implementation and testing | Yes |
| Node.js | Frontend and OpenSpec runtime | Yes |
| npm | JavaScript dependency management | Yes |
| TypeScript | Frontend type checking | Project dependency |
| React | Frontend framework | Project dependency |
| Vite | Development server and frontend build | Project dependency |
| Vitest | Frontend automated tests | Project dependency |
| React Testing Library | Component and interaction tests | Project dependency |
| OpenSpec | Specification-driven development | Preferred |
| Browser | Visual and interaction verification | Preferred |

Also verify appropriate versions.

Use the version requirements documented by the selected dependency versions.

Do not assume that an executable's presence means its version is compatible.

For Windows, begin with commands equivalent to:

```powershell
Get-Location

git --version
go version
node --version
npm --version
openspec --version
```

Check executable availability before running dependent commands.

### TypeScript clarification

TypeScript does not need to be installed globally.

Prefer the project-local TypeScript dependency, recorded in `frontend/package.json` and its lockfile.

The same principle applies to Vite, Vitest, React Testing Library, and other frontend packages.

## 2.3 Dependency installation

For every missing or incompatible required dependency:

1. Determine the required compatible version.
2. Identify an official, trustworthy installation method.
3. Check whether the tool can be installed under current permissions.
4. Install the missing dependency when authorized and supported.
5. Avoid unnecessary global installation.
6. Recheck the executable and its version.
7. Verify the tool actually functions.
8. Record the installation result.

Prefer official package managers and package sources.

On Windows, consider `winget` when available and appropriate.

Do not use untrusted installation scripts, insecure download mirrors, certificate-validation bypasses, or arbitrary environment changes.

Do not modify global user settings unnecessarily.

If installation requires administrator privileges, an interactive approval, or another permission not already granted, respect that boundary.

### Missing dependency fallback

If a required dependency cannot be installed:

- Record the actual failure.
- Continue creating project source files where safe.
- Prepare accurate installation instructions.
- Perform all verification that remains possible.
- Mark unexecuted tests and builds as blocked.
- Do not claim the application was fully verified.

The objective is a working, reproducible environment, but never fabricate success.

---

# 3. PROJECT DEPENDENCY BOOTSTRAP

After validating the operating-system-level tooling, initialize and install project-specific dependencies.

## 3.1 Go backend

Inspect whether `backend/go.mod` already exists.

If absent:

1. Create the backend structure.
2. Initialize an appropriately named Go module.
3. Configure the backend packages.
4. Resolve module dependencies if any are required.
5. Verify module consistency.

Prefer Go's standard library.

Do not add a third-party HTTP framework unless there is a compelling reason.

The backend should use:

- `net/http`
- `encoding/json`
- `testing`
- `httptest`

Use the installed compatible Go version.

The exact module path must be valid and documented. Do not invent a GitHub username.

If the intended remote repository owner is unknown, select a valid local module name and document how to change it if necessary.

## 3.2 React frontend

Inspect whether a frontend project already exists.

If absent, initialize React + TypeScript + Vite within:

`PROJECT_ROOT/frontend`

Do not create an additional repository root.

Install the appropriate project dependencies:

- React.
- React DOM.
- TypeScript.
- Vite.
- React TypeScript types.
- Vitest.
- React Testing Library.
- Relevant testing utilities.
- DOM test environment.
- Compatible coverage provider.
- Appropriate linting dependencies.

Select versions that are mutually compatible and satisfy the installed Node.js version.

Generate and preserve `package-lock.json`.

Avoid unnecessary UI libraries, state-management frameworks, and runtime dependencies.

### Dependency installation rules

- If a valid lockfile already exists, prefer `npm ci`.
- If creating a new project, install dependencies and generate the lockfile.
- Reuse existing compatible dependencies.
- Do not silently upgrade unrelated dependencies.
- Do not ignore dependency-installation errors.
- Do not bypass security checks merely to make installation succeed.

## 3.3 Dependency validation

Before implementation, verify:

- Go commands execute.
- Go module resolves.
- Node/npm versions are compatible.
- npm dependencies install successfully.
- TypeScript compiler works.
- Vite can compile the minimal project.
- Test runner can execute.
- Required scripts exist.

Create appropriate npm scripts:

- `dev`
- `build`
- `lint`
- `typecheck`
- `test`
- `test:coverage`

Ensure these scripts invoke actual installed tools.

The final repository must allow another developer to restore dependencies using documented commands.

## 3.4 Environment report

Create:

`docs/ENVIRONMENT.md`

Keep it concise.

Record:

- Detected OS and shell.
- Validated tools and versions.
- Required project dependencies.
- Installed or reused dependencies.
- Installation blockers, if any.
- Exact setup commands.
- Verification results.

Do not include secrets, access tokens, personal directories beyond what is needed, or confidential machine information.

---

# 4. AUTONOMOUS EXECUTION CONTRACT

Complete the project through these phases:

1. Workspace identification.
2. Environment and dependency validation.
3. Selective skills and agent discovery.
4. OpenSpec initialization.
5. Requirements and architecture specifications.
6. Detailed implementation planning.
7. Internal planning quality gate.
8. Backend implementation.
9. Frontend implementation.
10. Automated tests.
11. Full-stack integration.
12. UX review and refinement.
13. Independent code review.
14. Documentation and final verification.

**Do not stop after planning.**

The user authorizes local implementation, dependency setup within permitted boundaries, and automated verification.

Do not push to GitHub or publish releases without explicit authorization.

Preserve any existing work and Git history.

Respect mandatory tool approval requirements.

If an optional tool cannot be installed, fall back to a simpler approach rather than blocking the complete project.

---

# 5. SOL → LUNA LOW MODEL STRATEGY

Apply the user's preferred cost-efficient development workflow.

## SOL — High-reasoning planner

Sol handles:

- Environment and architecture decisions.
- Skill/agent selection.
- OpenSpec generation.
- API design.
- UX design.
- Data validation decisions.
- Testing architecture.
- Detailed implementation planning.
- Executor readiness validation.

The planning phase must resolve important ambiguities before code generation.

## LUNA LOW — Low-cost executor

Luna Low handles:

- Implementation of precisely defined tasks.
- File creation.
- Application integration.
- Tests.
- Build and static checks.
- Bounded corrections.
- Evidence collection.

The plan must be detailed enough that the executor does not need to rediscover requirements or redesign the architecture.

## Actual model availability

Inspect the Codex environment for supported model selection and delegation.

If Sol and Luna Low are configured and available, use them.

If not, execute the same logical separation within the currently available model.

Never claim that a specific model executed a phase unless verified.

Do not spawn unnecessary agents.

Prefer one implementation executor and one bounded final review.

Optimize for the lowest practical cost of a correct, verified implementation.

---

# 6. SKILLS AND AGENTS

Before creating project-specific capabilities, inspect installed skills and agent configurations.

### Preferred capabilities

**OpenSpec**

Use for specification-driven development.

**Superpowers — writing-plans**

Use to generate an explicit implementation plan.

**Superpowers — executing-plans**

Use to execute the plan systematically.

**Superpowers — verification-before-completion**

Use for mandatory verification before reporting completion.

**Superpowers — systematic-debugging**

Use for substantive failures requiring root-cause investigation.

**Superpowers — requesting-code-review**

Use for a focused final review if available.

**skill-opportunity-discovery**

Use only when a reusable skill opportunity is genuinely identified.

**skill-evolution-auditor**

Use only when an existing skill has a verified limitation worth improving.

Read actual installed skill instructions before invocation.

### Skill creation

Evaluate whether a project-local `luxcalc-quality-gate` skill would materially improve quality or repeatability.

Create it only if:

- Existing capabilities are insufficient.
- It solves a real repeatable problem.
- Its expected benefit justifies the token/setup cost.
- Required approval policies permit creation.

Otherwise, use a normal verification script or checklist.

Do not create skills merely to make the repository appear sophisticated.

### Context-efficiency rules

- Read only relevant files.
- Avoid repeatedly loading specifications.
- Keep `AGENTS.md` concise.
- Use task-specific context.
- Prefer deterministic shell commands for mechanical work.
- Use small model contexts where appropriate.
- Avoid repeated failed attempts.
- Preserve diagnostic evidence.
- Avoid aggressive compression during sensitive code review.
- Measure token usage only when reliable metrics are available.

Do not install Headroom or another context proxy unless clearly justified and compatible.

---

# 7. OPENSPEC — SPECIFICATION-DRIVEN DEVELOPMENT

Inspect whether OpenSpec is installed and initialized.

If missing, install through an official compatible method when permitted.

If unavailable, preserve equivalent local specification documents and continue with the implementation.

Use the installed OpenSpec/Codex integration, respecting its actual command syntax.

Create one cohesive change:

`luxcalc-fullstack-foundation`

Include:

- Proposal.
- Functional requirements.
- UX requirements.
- Architecture and design decisions.
- Implementation tasks.
- Acceptance scenarios.

Use clear, testable requirements.

Where appropriate, express them using GIVEN / WHEN / THEN.

Validate OpenSpec artifacts before implementation.

Do not create separate changes for trivial components.

Avoid duplicating detailed task descriptions across OpenSpec and other planning documents without a clear benefit.

---

# 8. BACKEND ARCHITECTURE

Implement a Go REST API using standard-library tools.

### Core operations

- Addition.
- Subtraction.
- Multiplication.
- Division.

Optional:

- Exponentiation.
- Square root.
- Percentage.

Only add optional operations after mandatory functionality is working and tested.

### HTTP API

`POST /api/calculate`

Example request:

```json
{
  "operation": "divide",
  "a": 120,
  "b": 4
}
```

Successful response:

```json
{
  "result": 30
}
```

Error response:

```json
{
  "error": {
    "code": "DIVISION_BY_ZERO",
    "message": "Cannot divide by zero"
  }
}
```

Implement predictable error handling with meaningful HTTP status codes.

Support error categories including:

- `INVALID_INPUT`
- `UNSUPPORTED_OPERATION`
- `DIVISION_BY_ZERO`
- `NON_FINITE_RESULT`

Validate:

- Missing operands.
- Numeric types.
- Unsupported operations.
- Division by zero.
- Malformed JSON.
- Non-finite arithmetic results.
- Incorrect HTTP methods.

Do not mistake a valid zero operand for a missing field.

Use `float64` for general-purpose calculations.

Document its numerical precision limitations, especially for monetary values.

### Clean Architecture and SOLID

Separate:

- HTTP transport.
- Request parsing and validation.
- Calculation domain logic.
- Application bootstrap.

Keep calculation logic independent of the HTTP layer.

Apply appropriate SOLID principles through meaningful responsibilities rather than unnecessary interfaces or inheritance structures.

Prefer a small number of focused packages.

---

# 9. FRONTEND ARCHITECTURE AND ADVANCED UX

**The frontend is one of the principal differentiators of LuxCalc.**

Use React + TypeScript + Vite.

Create a distinctive and polished calculator interface.

### Visual identity

Use a premium, modern, fintech-inspired design.

Implement:

- Consistent design tokens.
- Professional typography.
- Strong visual hierarchy.
- Deliberate spacing.
- Restrained accent colors.
- Elegant panels and surfaces.
- Accessible contrast.
- Carefully considered shadows and borders.
- Subtle interaction feedback.
- Modern desktop and mobile layouts.

Avoid a generic starter-template appearance.

### Desktop experience

Consider a two-panel layout.

**Calculation workspace**

- LuxCalc branding.
- Operand input fields.
- Operation selection.
- Main action.
- Validation feedback.

**Result workspace**

- Large calculation result.
- Mathematical expression.
- Initial empty state.
- Loading state.
- Error state.
- Success feedback.

### Mobile experience

- Responsive single-column layout.
- No horizontal scrolling at 320px.
- Comfortable touch controls.
- Readable results.
- Logical stacking.
- Mobile-friendly numeric input.

### UX requirements

Implement:

1. Input validation.
2. Actionable error messages.
3. Loading states.
4. Duplicate submission protection.
5. Network error handling.
6. Stale-result prevention.
7. Keyboard navigation.
8. Enter-to-submit.
9. Visible focus states.
10. Accessible labels.
11. Screen-reader status announcements.
12. Reduced-motion behavior.

The frontend must obtain calculated results from the Go API.

Do not duplicate authoritative arithmetic logic in JavaScript.

### Optional refinements

Consider:

- Copy result.
- Subtle result transitions.
- Simple in-memory history.
- Advanced-operation disclosure.

Implement only when inexpensive and clearly beneficial.

### UX verification

Where browser capabilities are available:

- Inspect desktop rendering.
- Inspect mobile rendering.
- Test keyboard navigation.
- Test validation states.
- Test API failure presentation.
- Check result overflow.
- Correct confirmed visual defects.

If browser-based verification is unavailable, report the limitation.

---

# 10. SOL IMPLEMENTATION PLAN

Create:

`docs/IMPLEMENTATION_PLAN.md`

The plan must be executable by a lower-cost coding model with minimal additional reasoning.

For every task, include:

- Task ID.
- Objective.
- Dependencies.
- Expected files.
- Data types and contracts.
- Exact implementation steps.
- Tests.
- Verification commands.
- Expected outcomes.
- Failure recovery.
- Definition of done.

### Task sequence

1. Validate project root.
2. Bootstrap missing required dependencies.
3. Validate toolchain.
4. Initialize and validate OpenSpec.
5. Define API and application architecture.
6. Implement Go calculation logic.
7. Implement HTTP handlers.
8. Add backend tests.
9. Initialize React/Vite/TypeScript.
10. Create LuxCalc frontend design system.
11. Implement calculator interface.
12. Integrate REST API.
13. Implement UI validation and asynchronous states.
14. Add frontend tests.
15. Verify end-to-end behavior.
16. Review responsive UX.
17. Run quality checks.
18. Document setup and decisions.
19. Perform final review.

### Plan-readiness gate

Before implementation, verify that:

- All requirements are addressed.
- Dependencies are available or blockers are documented.
- API contracts are explicit.
- File paths are relative to the actual project root.
- Frontend states are specified.
- Tests are defined.
- Verification commands are valid.
- No unnecessary abstractions were introduced.
- Implementation tasks have objective completion criteria.

Resolve ambiguities before handing tasks to the executor.

After successful internal validation, proceed with implementation automatically.

---

# 11. LUNA LOW IMPLEMENTATION RULES

Execute the validated plan.

- Follow the approved specifications.
- Use idiomatic code.
- Preserve type safety.
- Use clear naming.
- Avoid unused abstractions.
- Avoid duplication.
- Keep components focused.
- Prefer minimal dependencies.
- Do not redesign architecture without a genuine blocker.
- Do not refactor unrelated code.
- Test meaningful business behavior.

For calculation logic and error handling, prefer test-driven implementation:

1. Define expected behavior.
2. Write the test.
3. Confirm the expected failure.
4. Implement the functionality.
5. Rerun tests.
6. Refactor only when appropriate.
7. Verify again.

For failures:

1. Capture diagnostic evidence.
2. Identify the root cause.
3. Apply the smallest correction.
4. Rerun targeted tests.
5. Perform relevant regression checks.

Use systematic debugging for substantive problems.

Do not enter uncontrolled retry loops.

---

# 12. TESTING AND VERIFICATION

Testing is mandatory for both layers.

### Go tests

Cover:

- Every arithmetic operation.
- Positive, negative, decimal, and zero operands.
- Division by zero.
- Unsupported operations.
- Missing operands.
- Invalid JSON.
- Invalid operand types.
- Incorrect HTTP methods.
- Non-finite results.
- HTTP status codes.
- JSON response contracts.

Use table-driven tests and `httptest` where appropriate.

### React tests

Cover:

- Initial render.
- Operand entry.
- Operation selection.
- Input validation.
- Successful API calculation.
- Result presentation.
- Loading state.
- Network errors.
- API errors.
- Duplicate submission prevention.
- Keyboard submission.
- Stale-result behavior.

Use Vitest and React Testing Library.

### Backend verification

Run from the backend directory:

```bash
go fmt ./...
go vet ./...
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
```

### Frontend verification

Run the configured scripts for:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

Validate that the commands exist and that dependencies are installed.

### Integration verification

Start frontend and backend.

Verify:

- A successful calculation through the real API.
- A backend validation error.
- Correct React result presentation.
- Correct React error presentation.
- No duplicate calculation logic in the frontend.

### Verification integrity

Never invent:

- Test counts.
- Coverage percentages.
- Passing builds.
- Visual inspection.
- Token measurements.
- Model invocations.

Distinguish verified success, unverified behavior, and blocked checks.

---

# 13. INDEPENDENT REVIEW

Perform one bounded final review.

Examine:

- Calculation correctness.
- REST API contracts.
- Input validation.
- Error handling.
- Numerical edge cases.
- React state behavior.
- Accessibility.
- Responsive UX.
- Testing completeness.
- Dependencies.
- Architecture.
- Documentation.
- Maintainability.

Classify findings as:

**Critical:** Broken mandatory functionality or serious defect.

**Important:** Significant quality, testing, UX, or maintainability issue.

**Minor:** Low-impact improvement.

Fix critical and important issues.

Apply minor improvements only when low risk.

Rerun affected tests after corrections.

Do not conduct endless review/refactor cycles.

---

# 14. DOCUMENTATION

Create professional portfolio documentation.

## README.md

Include:

1. LuxCalc overview.
2. Technology stack.
3. Architecture.
4. Key features.
5. Prerequisites.
6. Dependency installation.
7. Backend setup and execution.
8. Frontend setup and execution.
9. API usage.
10. Error handling.
11. Testing commands.
12. Actual coverage results.
13. Design decisions.
14. SOLID and Clean Architecture principles actually implemented.
15. UX and accessibility.
16. OpenSpec methodology.
17. AI-assisted workflow.
18. Numerical limitations.
19. Future improvements.

## AI_PROMPTS.md

Document actual prompts used.

Include this master prompt verbatim when available.

Record meaningful follow-up prompts used for implementation, debugging, or review.

Do not fabricate missing prompt history.

## docs/ENVIRONMENT.md

Record:

- Detected development environment.
- Tool versions.
- Installed dependencies.
- Required commands.
- Actual validation results.
- Outstanding setup blockers.

## docs/IMPLEMENTATION_PLAN.md

Preserve the executed implementation plan as an engineering artifact.

Keep all documentation clear and reasonably concise.

---

# 15. GIT AND REPOSITORY HYGIENE

Use the existing workspace repository.

If the project root is not a Git repository, initialize Git there.

Do not create nested repositories.

Maintain an appropriate `.gitignore`.

Exclude:

- `node_modules`.
- Compiled build output.
- Temporary test artifacts.
- Local secrets.
- Environment-specific caches.
- Unnecessary generated files.

Include reproducible dependency manifests and lockfiles.

Do not push or publish automatically.

Do not expose credentials.

Preserve existing repository history and unrelated changes.

---

# 16. TIME AND SCOPE MANAGEMENT

Target approximately 2–4 hours of equivalent focused engineering effort.

Prioritize:

1. Functional correctness.
2. Actual frontend/backend integration.
3. Polished accessible UX.
4. Automated tests.
5. Maintainable architecture.
6. Documentation.
7. Optional enhancements.

Avoid unnecessary framework installation and large infrastructure changes.

If effort becomes constrained, remove optional functionality before compromising the core application.

Suggested removal order:

1. Docker.
2. Calculation history.
3. Advanced arithmetic operations.
4. Decorative transitions.
5. Other nonessential features.

The project must remain understandable and practical.

---

# 17. FINAL DELIVERY REPORT

At completion, report:

### A. Workspace

- Actual detected project root.
- Whether Git was already initialized.
- Whether the project was created in the opened directory.

### B. Environment

- Operating system.
- Validated tools and versions.
- Dependencies installed or reused.
- Installation failures or limitations.

### C. Implementation

- Completed functionality.
- Frontend and backend architecture.
- API integration status.

### D. OpenSpec

- Generated artifacts.
- Validation results.

### E. Skills and agents

- Capabilities discovered.
- Capabilities selected.
- Capabilities intentionally not used.
- Actual model routing, if verified.

### F. Tests

- Commands executed.
- Test results.
- Coverage.
- Build status.
- Integration results.

### G. UX

- Implemented design.
- Responsive behavior.
- Accessibility features.
- Browser checks actually performed.

### H. Repository status

- Git branch.
- Working-tree status.
- Commits, if any.
- Readiness for publication.

### I. Remaining actions

Identify unresolved blockers and required user actions.

---

# 18. FINAL EXECUTION DIRECTIVE

Begin immediately.

**First identify the active workspace.**

Use the current workspace as the LuxCalc project root.

Do not create a nested project directory.

Then:

1. Inspect the environment.
2. Verify Go, Node.js, npm, Git, and other necessary tools.
3. Install missing dependencies when supported and permitted.
4. Revalidate the installed tools.
5. Initialize the required Go and React/TypeScript dependencies.
6. Verify that project development commands can run.
7. Discover existing skills and agents.
8. Initialize or reuse OpenSpec.
9. Generate and validate specifications.
10. Create a detailed Sol-quality implementation plan.
11. Validate the plan for low-cost execution.
12. Automatically implement using the available Luna Low-compatible workflow.
13. Build the complete Go REST API.
14. Build the professional LuxCalc React frontend.
15. Implement advanced, accessible, responsive UX.
16. Execute tests and coverage checks.
17. Verify real frontend/backend integration.
18. Review and correct confirmed issues.
19. Complete documentation.
20. Perform the final quality gate.
21. Report the actual result.

Do not stop at planning.

Do not make unsupported claims of success.

Do not automatically publish the repository.

**Deliver LuxCalc Full-Stack as a complete, polished, maintainable, tested portfolio project, created directly in the workspace opened by Codex or VS Code.**

````
