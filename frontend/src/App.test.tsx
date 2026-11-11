import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StrictMode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { ApiError, calculate } from "./lib/api";
vi.mock("./lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./lib/api")>()),
  calculate: vi.fn(),
}));
const mockedCalculate = vi.mocked(calculate);
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  mockedCalculate.mockReset();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("LuxCalc form", () => {
  it("validates, submits to the API and displays the full returned result", async () => {
    const user = userEvent.setup();
    mockedCalculate.mockResolvedValue(0.30000000000000004);
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    expect(
      screen.getByRole("region", { name: "Calculation result" }),
    ).toBeInTheDocument();
    await user.type(
      screen.getByRole("textbox", { name: "First operand" }),
      ".1",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Second operand" }),
      ".2",
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(mockedCalculate).toHaveBeenCalledWith(
      { operation: "add", a: 0.1, b: 0.2 },
      expect.any(AbortSignal),
    );
    expect(await screen.findByText("0.30000000000000004")).toBeInTheDocument();
    expect(screen.getByText("0.1 + 0.2")).toBeInTheDocument();
  });
  it("does not submit invalid values and provides associated field errors", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(
      screen.getByRole("textbox", { name: "First operand" }),
      "1abc",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Second operand" }),
      "2",
    );
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(mockedCalculate).not.toHaveBeenCalled();
    expect(
      screen.getByRole("textbox", { name: "First operand" }),
    ).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/dot for decimals/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a finite number",
    );
  });
  it("locks duplicate submissions immediately and accepts Enter", async () => {
    const user = userEvent.setup();
    const pending = deferred<number>();
    mockedCalculate.mockReturnValue(pending.promise);
    render(<App />);
    const first = screen.getByRole("textbox", { name: "First operand" });
    await user.type(first, "1");
    await user.type(
      screen.getByRole("textbox", { name: "Second operand" }),
      "2",
    );
    fireEvent.submit(first.closest("form")!);
    fireEvent.submit(first.closest("form")!);
    expect(mockedCalculate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Calculating/ })).toBeDisabled();
    pending.resolve(3);
    expect(await screen.findByText("3")).toBeInTheDocument();
    mockedCalculate.mockReset();
    mockedCalculate.mockResolvedValue(4);
    await user.keyboard("{Enter}");
    await waitFor(() => expect(mockedCalculate).toHaveBeenCalledTimes(1));
  });
  it("shows failures and permits retry", async () => {
    const user = userEvent.setup();
    mockedCalculate
      .mockRejectedValueOnce(
        new ApiError("DIVISION_BY_ZERO", "Cannot divide by zero", 422),
      )
      .mockResolvedValueOnce(2);
    render(<App />);
    await user.type(
      screen.getByRole("textbox", { name: "First operand" }),
      "1",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Second operand" }),
      "0",
    );
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cannot divide by zero",
    );
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(await screen.findByText("2")).toBeInTheDocument();
  });
  it("aborts and ignores a late response after an edit", async () => {
    const user = userEvent.setup();
    const first = deferred<number>();
    const second = deferred<number>();
    mockedCalculate
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    render(<App />);
    await user.type(
      screen.getByRole("textbox", { name: "First operand" }),
      "1",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Second operand" }),
      "2",
    );
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    const signal = mockedCalculate.mock.calls[0][1];
    await user.type(
      screen.getByRole("textbox", { name: "First operand" }),
      "3",
    );
    expect(signal.aborted).toBe(true);
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    first.resolve(99);
    second.resolve(5);
    expect(await screen.findByText("5")).toBeInTheDocument();
    expect(screen.queryByText("99")).not.toBeInTheDocument();
  });
  it("aborts at ten seconds and enables retry", async () => {
    vi.useFakeTimers();
    mockedCalculate.mockImplementation(
      (_input, signal) =>
        new Promise((_resolve, reject) =>
          signal?.addEventListener("abort", () => reject(new Error("aborted"))),
        ),
    );
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "First operand" }), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Second operand" }), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    const signal = mockedCalculate.mock.calls[0][1];
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(signal.aborted).toBe(true);
    expect(screen.getByRole("alert")).toHaveTextContent("took too long");
    expect(screen.getByRole("button", { name: "Calculate" })).toBeEnabled();
  });
  it("clear resets values, operation and visible result", async () => {
    const user = userEvent.setup();
    mockedCalculate.mockResolvedValue(8);
    render(<App />);
    await user.type(
      screen.getByRole("textbox", { name: "First operand" }),
      "3",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Second operand" }),
      "5",
    );
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    await screen.findByText("8");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("textbox", { name: "First operand" })).toHaveValue(
      "",
    );
    expect(screen.getByRole("button", { name: "Add" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByText("8")).not.toBeInTheDocument();
  });
});
