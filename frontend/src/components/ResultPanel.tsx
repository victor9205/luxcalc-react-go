import type { CalculationState } from "../lib/calculator";
export function ResultPanel({ state }: { state: CalculationState }) {
  let body;
  if (state.status === "loading")
    body = (
      <>
        <span className="result-kicker">WORKING IT OUT</span>
        <p className="result-message">
          Your answer is on its way<span className="loading-dots">…</span>
        </p>
      </>
    );
  else if (state.status === "success")
    body = (
      <>
        <span className="result-kicker">YOUR RESULT</span>
        <p className="expression">{state.expression}</p>
        <output
          className={
            String(state.result).length > 14
              ? "result-number result-number--long"
              : "result-number"
          }
        >
          {String(state.result)}
        </output>
      </>
    );
  else if (state.status === "error")
    body = (
      <>
        <span className="result-kicker">NEEDS A SECOND LOOK</span>
        <p className="result-message" role="alert">
          {state.message}
        </p>
        <p className="result-hint">Check the values and try again.</p>
      </>
    );
  else
    body = (
      <>
        <span className="result-kicker">YOUR RESULT</span>
        <div className="empty-mark" aria-hidden="true">
          =
        </div>
        <p className="result-message">
          A clear answer, thoughtfully calculated.
        </p>
        <p className="result-hint">Your result will appear here.</p>
      </>
    );
  return (
    <section
      className="result-panel"
      aria-label="Calculation result"
      aria-live="polite"
      aria-busy={state.status === "loading"}
    >
      {body}
    </section>
  );
}
