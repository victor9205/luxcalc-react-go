import { OPERATIONS, type Operation } from "../lib/calculator";
export function OperationSelector({
  value,
  onChange,
}: {
  value: Operation;
  onChange: (value: Operation) => void;
}) {
  return (
    <div className="operations" role="group" aria-label="Operation">
      {OPERATIONS.map((operation) => (
        <button
          type="button"
          key={operation.value}
          aria-label={operation.label}
          aria-pressed={value === operation.value}
          className={`operation${value === operation.value ? " selected" : ""}`}
          onClick={() => onChange(operation.value)}
        >
          <span aria-hidden="true">{operation.symbol}</span>
          <span>{operation.label}</span>
        </button>
      ))}
    </div>
  );
}
