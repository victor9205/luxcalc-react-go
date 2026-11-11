export type Operation = "add" | "subtract" | "multiply" | "divide";
export type CalculateInput = { operation: Operation; a: number; b: number };
export type CalculationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: number; expression: string }
  | { status: "error"; message: string };
export const OPERATIONS: readonly {
  value: Operation;
  label: string;
  symbol: string;
}[] = [
  { value: "add", label: "Add", symbol: "+" },
  { value: "subtract", label: "Subtract", symbol: "−" },
  { value: "multiply", label: "Multiply", symbol: "×" },
  { value: "divide", label: "Divide", symbol: "÷" },
];
const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
export function parseOperand(text: string): number | null {
  const value = text.trim();
  if (!DECIMAL.test(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
