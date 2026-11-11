import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, calculate } from "./lib/api";
import {
  parseOperand,
  type CalculationState,
  type Operation,
} from "./lib/calculator";
import { OperationSelector } from "./components/OperationSelector";
import { ResultPanel } from "./components/ResultPanel";

const symbols: Record<Operation, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};
const TIMEOUT_MESSAGE = "This calculation took too long. Please try again.";

export default function App() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [operation, setOperation] = useState<Operation>("add");
  const [fieldErrors, setFieldErrors] = useState<{ a?: string; b?: string }>(
    {},
  );
  const [state, setState] = useState<CalculationState>({ status: "idle" });
  const pending = useRef(false);
  const token = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const invalidate = useCallback(() => {
    token.current += 1;
    pending.current = false;
    controller.current?.abort();
    controller.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      invalidate();
    };
  }, [invalidate]);

  function editA(value: string) {
    invalidate();
    setA(value);
    setFieldErrors((old) => ({ ...old, a: undefined }));
    setState({ status: "idle" });
  }
  function editB(value: string) {
    invalidate();
    setB(value);
    setFieldErrors((old) => ({ ...old, b: undefined }));
    setState({ status: "idle" });
  }
  function editOperation(value: Operation) {
    invalidate();
    setOperation(value);
    setState({ status: "idle" });
  }
  function clear() {
    invalidate();
    setA("");
    setB("");
    setOperation("add");
    setFieldErrors({});
    setState({ status: "idle" });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const first = parseOperand(a);
    const second = parseOperand(b);
    const errors: { a?: string; b?: string } = {};
    if (first === null)
      errors.a = "Enter a finite number using a dot for decimals.";
    if (second === null)
      errors.b = "Enter a finite number using a dot for decimals.";
    setFieldErrors(errors);
    if (first === null || second === null) {
      setState({ status: "idle" });
      return;
    }

    pending.current = true;
    const requestToken = ++token.current;
    const requestController = new AbortController();
    controller.current = requestController;
    setState({ status: "loading" });
    timer.current = setTimeout(() => {
      if (token.current !== requestToken || !mounted.current) return;
      token.current += 1;
      timer.current = null;
      controller.current = null;
      pending.current = false;
      setState({ status: "error", message: TIMEOUT_MESSAGE });
      requestController.abort();
    }, 10_000);
    const input = { operation, a: first, b: second };
    try {
      const result = await calculate(input, requestController.signal);
      if (token.current === requestToken && mounted.current)
        setState({
          status: "success",
          result,
          expression: `${input.a} ${symbols[input.operation]} ${input.b}`,
        });
    } catch (error) {
      if (
        token.current === requestToken &&
        mounted.current &&
        !requestController.signal.aborted
      )
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "Unable to reach the calculation service. Check your connection and try again.",
        });
    } finally {
      if (token.current === requestToken) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        controller.current = null;
        pending.current = false;
      }
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="LuxCalc home">
          <span className="brand-mark">L</span>
          <span>
            Lux<span>Calc</span>
          </span>
        </a>
        <div className="breadcrumb">
          <span>Workspace</span>
          <span aria-hidden="true">/</span>
          <strong>Calculator</strong>
        </div>
        <span className="topbar-note">A quieter way to calculate</span>
      </header>
      <section className="intro" id="top">
        <p className="eyebrow">PRECISION, WITH A LITTLE MORE CARE</p>
        <h1>
          A little clarity.
          <br />
          <span>In every calculation.</span>
        </h1>
        <p className="intro-copy">
          A considered space for the numbers that move your day forward.
        </p>
      </section>
      <div className="workspace">
        <section className="form-panel">
          <div className="panel-heading">
            <span className="section-index">01 / INPUT</span>
            <h2>Set the values</h2>
            <p>Choose an operation and enter your numbers.</p>
          </div>
          <form onSubmit={submit} noValidate>
            <fieldset className="operation-field">
              <legend>Operation</legend>
              <OperationSelector value={operation} onChange={editOperation} />
            </fieldset>
            <div className="operand-grid">
              <div className="operand-card">
                <label htmlFor="operand-a">First operand</label>
                <input
                  id="operand-a"
                  name="a"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="e.g. 120"
                  value={a}
                  onChange={(e) => editA(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.a)}
                  aria-describedby={fieldErrors.a ? "error-a" : undefined}
                />
                {fieldErrors.a && (
                  <span className="field-error" id="error-a" role="alert">
                    {fieldErrors.a}
                  </span>
                )}
              </div>
              <span className="operator-between" aria-hidden="true">
                {symbols[operation]}
              </span>
              <div className="operand-card">
                <label htmlFor="operand-b">Second operand</label>
                <input
                  id="operand-b"
                  name="b"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="e.g. 4"
                  value={b}
                  onChange={(e) => editB(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.b)}
                  aria-describedby={fieldErrors.b ? "error-b" : undefined}
                />
                {fieldErrors.b && (
                  <span className="field-error" id="error-b" role="alert">
                    {fieldErrors.b}
                  </span>
                )}
              </div>
            </div>
            <p className="input-note">
              Use a dot as the decimal separator. Scientific notation is
              welcome.
            </p>
            <div className="form-actions">
              <button
                className="calculate-button"
                type="submit"
                disabled={state.status === "loading"}
              >
                <span>
                  {state.status === "loading" ? "Calculating" : "Calculate"}
                </span>
                <span aria-hidden="true">↗</span>
              </button>
              <button className="clear-button" type="button" onClick={clear}>
                Clear
              </button>
            </div>
          </form>
        </section>
        <div className="result-wrap">
          <div className="result-title">
            <span className="section-index">02 / RESULT</span>
            <span className="live-status" role="status">
              {state.status === "loading"
                ? "Calculating…"
                : state.status === "success"
                  ? "Ready"
                  : ""}
            </span>
          </div>
          <ResultPanel state={state} />
        </div>
      </div>
      <footer className="footer">
        <span className="footer-mark">L</span>
        <span>Modern Calculation. Thoughtful Engineering.</span>
        <span className="footer-note">Made for clear thinking.</span>
      </footer>
    </main>
  );
}
