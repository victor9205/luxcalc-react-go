import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { calculate } from "./lib/api";

vi.mock("./lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./lib/api")>()),
  calculate: vi.fn(),
}));
const api = vi.mocked(calculate);
const first = () => screen.getByLabelText("First operand");
const second = () => screen.getByLabelText("Second operand");
const button = (name: string) => screen.getByRole("button", { name });
function mount() {
  return render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
function fill() {
  fireEvent.change(first(), { target: { value: "1" } });
  fireEvent.change(second(), { target: { value: "2" } });
}
function submit() {
  fireEvent.submit(first().closest("form")!);
}
function deferred() {
  let resolve!: (value: number) => void;
  const promise = new Promise<number>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
async function settle(request: ReturnType<typeof deferred>, value: number) {
  await act(async () => {
    request.resolve(value);
    await request.promise;
  });
}

beforeEach(() => {
  api.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("request ownership and recovery", () => {
  const edits = [
    [
      "first operand",
      () => fireEvent.change(first(), { target: { value: "4" } }),
    ],
    [
      "second operand",
      () => fireEvent.change(second(), { target: { value: "4" } }),
    ],
    ["operation", () => fireEvent.click(button("Multiply"))],
    ["clear", () => fireEvent.click(button("Clear"))],
  ] as const;

  it.each(edits)(
    "clears a successful result on %s changes",
    async (_name, edit) => {
      api.mockResolvedValue(3);
      mount();
      fill();
      submit();
      await screen.findByText("3");
      edit();
      expect(screen.queryByText("3")).not.toBeInTheDocument();
    },
  );

  it.each(edits)(
    "aborts on %s changes and ignores a noncooperative late response",
    async (_name, edit) => {
      const request = deferred();
      api.mockReturnValue(request.promise);
      mount();
      fill();
      submit();
      const signal = api.mock.calls[0][1];
      edit();
      expect(signal.aborted).toBe(true);
      await settle(request, 99);
      expect(screen.queryByText("99")).not.toBeInTheDocument();
      expect(button("Calculate")).toBeEnabled();
    },
  );

  it("keeps B locked when invalidated A settles and runs its finally branch", async () => {
    const a = deferred();
    const b = deferred();
    api.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    mount();
    fill();
    submit();
    fireEvent.change(first(), { target: { value: "3" } });
    submit();
    await settle(a, 99);
    expect(screen.queryByText("99")).not.toBeInTheDocument();
    expect(button("Calculating")).toBeDisabled();
    submit();
    expect(api).toHaveBeenCalledTimes(2);
    await settle(b, 5);
    expect(screen.getByText("5")).toBeVisible();
  });

  it("does not cancel B timeout when invalidated A settles late", async () => {
    vi.useFakeTimers();
    const a = deferred();
    const b = deferred();
    api.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    mount();
    fill();
    submit();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    fireEvent.change(first(), { target: { value: "3" } });
    submit();
    const signalB = api.mock.calls[1][1];
    await settle(a, 99);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(signalB.aborted).toBe(true);
    expect(screen.getByRole("alert")).toHaveTextContent("took too long");
    expect(button("Calculate")).toBeEnabled();
  });

  it("ignores a timed-out request that resolves after abort and permits retry", async () => {
    vi.useFakeTimers();
    const request = deferred();
    api.mockReturnValueOnce(request.promise).mockResolvedValueOnce(3);
    mount();
    fill();
    submit();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    await settle(request, 99);
    expect(screen.getByRole("alert")).toHaveTextContent("took too long");
    expect(screen.queryByText("99")).not.toBeInTheDocument();
    await act(async () => {
      submit();
    });
    expect(screen.getByText("3")).toBeVisible();
  });

  it("aborts and removes the timer on unmount", async () => {
    vi.useFakeTimers();
    const request = deferred();
    api.mockReturnValue(request.promise);
    const view = mount();
    fill();
    submit();
    const signal = api.mock.calls[0][1];
    view.unmount();
    expect(signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    await settle(request, 99);
  });

  it("maps network failures to actionable guidance and permits recovery", async () => {
    api
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(3);
    mount();
    fill();
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check your connection and try again.",
    );
    submit();
    expect(await screen.findByText("3")).toBeVisible();
  });
});
