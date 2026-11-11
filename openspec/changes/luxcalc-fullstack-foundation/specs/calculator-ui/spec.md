## ADDED Requirements

### Requirement: Distinct responsive calculator workspace

The frontend SHALL use React and TypeScript, display LuxCalc branding and the tagline `Modern Calculation. Thoughtful Engineering.`, and present warm white/deep green premium surfaces with deliberate spacing and local system typography. It SHALL provide operand inputs, four operation buttons, calculate/clear actions, and a result workspace, in two desktop panels and a single mobile column without horizontal overflow at 320px.

#### Scenario: Desktop presentation
- **GIVEN** the calculator opens in a desktop viewport
- **WHEN** the page renders
- **THEN** the calculation form and initial result workspace are visible in a balanced two-panel layout

#### Scenario: Narrow screen and long result
- **GIVEN** a 320px viewport and a long or scientific-notation result
- **WHEN** the user views the result
- **THEN** the form precedes the result, output stays inside its panel, and the page has no horizontal scrolling

### Requirement: Validated API-authoritative arithmetic

The frontend SHALL obtain all computed results from `POST /api/calculate` rather than duplicating arithmetic. It SHALL accept finite signed decimal/scientific operand text and SHALL reject blank, hexadecimal, Infinity, separators, and partially numeric strings before making a request. It SHALL preserve valid zero values and explain dot decimal notation.

#### Scenario: Valid form submission
- **GIVEN** operands `120` and `4` and selected operation `divide`
- **WHEN** the user submits
- **THEN** the client sends `{ "operation": "divide", "a": 120, "b": 4 }` and displays the returned API result

#### Scenario: Scientific and zero inputs
- **GIVEN** finite operands such as `0`, `-2.5`, `.5`, or `1e3`
- **WHEN** they are submitted
- **THEN** validation accepts their numeric values

#### Scenario: Invalid text
- **GIVEN** either operand is blank, `0x10`, `Infinity`, `1,5`, `12abc`, or `1e309`
- **WHEN** the user submits
- **THEN** the client makes no API call and displays an actionable field error

### Requirement: Clear asynchronous states and failure recovery

The interface SHALL distinguish initial, loading, success, validation failure, API failure, network failure, and a ten-second timeout. It SHALL prevent duplicate in-flight submissions with an immediate guard. Invalid success response data SHALL be shown as a service response failure.

#### Scenario: Pending request and duplicate submission
- **GIVEN** a calculation request is unresolved
- **WHEN** another click or Enter submission occurs before or after React rerenders
- **THEN** only one request exists and the UI communicates loading with a disabled submit action

#### Scenario: API domain error
- **GIVEN** the API returns `DIVISION_BY_ZERO` and `Cannot divide by zero`
- **WHEN** the request completes
- **THEN** the interface presents the error with a useful correction path

#### Scenario: Network or service failure
- **GIVEN** fetch rejects or the API returns malformed result data
- **WHEN** the request settles
- **THEN** the interface displays a useful error and permits retry

#### Scenario: Request timeout
- **GIVEN** an active request has not completed for ten seconds
- **WHEN** its timeout expires
- **THEN** the request is aborted, a timeout error is announced, and the user can submit again

### Requirement: Invalidate stale results on every edit

Operand edits, operation changes, clear, and unmount SHALL abort and invalidate an active request. Operand/operation edits and clear SHALL remove the previous result immediately. Late responses from superseded requests SHALL NOT alter current UI state or unlock a newer request.

#### Scenario: Edit an existing success
- **GIVEN** a successful result is visible
- **WHEN** either operand or the selected operation changes
- **THEN** the old result disappears immediately

#### Scenario: Superseded request completes late
- **GIVEN** request A is pending, an edit invalidates A, and request B starts
- **WHEN** A resolves after the edit, even if transport ignores abort
- **THEN** A cannot show a result or reset B's pending guard

#### Scenario: Clear or unmount during request
- **GIVEN** a request is pending
- **WHEN** the user clears the form or the component unmounts
- **THEN** the request is aborted, its timer is removed, and its late resolution has no visible effect

### Requirement: Accessible keyboard and status behavior

The form SHALL have explicit labels, semantic submit behavior, operation buttons exposing `aria-pressed`, visible focus styles, field-error associations, announced result/loading/error messages, 44px touch controls, and reduced-motion support. Enter SHALL submit valid inputs. Editing controls SHALL remain available while a request is pending.

#### Scenario: Keyboard calculation
- **GIVEN** a user navigates with Tab and selects an operation using the keyboard
- **WHEN** the user presses Enter from an operand input
- **THEN** the form submits and the returned result is available through a live status announcement

#### Scenario: Announced validation failure
- **GIVEN** an invalid operand
- **WHEN** the user submits
- **THEN** its input exposes `aria-invalid`, the label remains available, and associated error text explains the correction

#### Scenario: Reduced motion preference
- **GIVEN** the user prefers reduced motion
- **WHEN** the interface changes state
- **THEN** nonessential motion is disabled

### Requirement: Preserve API result precision

The interface SHALL display the full round-trip JavaScript string representation of the finite API number without silently rounding or presenting monetary precision guarantees.

#### Scenario: Floating-point representation
- **GIVEN** the API returns `0.30000000000000004`
- **WHEN** the result is rendered
- **THEN** that full numeric string is displayed and remains readable

### Requirement: Reproducible frontend and integration verification

The repository SHALL retain compatible dependency manifests/lockfiles and actual lint, typecheck, test, coverage, and build scripts. Tests SHALL exercise validation, success/error states, duplicate submission, keyboard submission, timeout, and stale response behavior. Available browser tooling SHALL verify the real Go/Vite integration and desktop/mobile behavior; unavailable checks SHALL be reported honestly.

#### Scenario: Restore and verify frontend
- **GIVEN** the documented compatible Node/npm environment
- **WHEN** a developer restores the lockfile and runs documented quality commands
- **THEN** the frontend can be checked and built reproducibly

#### Scenario: Real integrated calculation
- **GIVEN** Go and Vite are both running with the documented development proxy
- **WHEN** a user performs a calculation and then division by zero
- **THEN** the real result and the real backend error are displayed through the React interface
