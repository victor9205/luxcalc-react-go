import { describe, expect, it, vi, afterEach } from "vitest";
import { calculate } from "./api";
import type { CalculateInput } from "./calculator";

describe("calculate API client", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("posts the typed request and returns a finite numeric result", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ result: 0 }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    const input: CalculateInput = { operation: "add", a: 1, b: 0 };
    expect(await calculate(input, controller.signal)).toBe(0);
    expect(fetchMock).toHaveBeenCalledWith("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
  });
  it("maps error envelopes and rejects malformed success data", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              error: {
                code: "DIVISION_BY_ZERO",
                message: "Cannot divide by zero",
              },
            }),
            { status: 422 },
          ),
        )
        .mockResolvedValueOnce(
          new Response('{"result":null}', { status: 200 }),
        ),
    );
    const controller = new AbortController();
    await expect(
      calculate({ operation: "divide", a: 1, b: 0 }, controller.signal),
    ).rejects.toMatchObject({ code: "DIVISION_BY_ZERO", status: 422 });
    await expect(
      calculate({ operation: "add", a: 1, b: 1 }, controller.signal),
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });
  it.each([
    "{}",
    "null",
    "[]",
    '{"result":"3"}',
    '{"result":1e999}',
    "not JSON",
  ])("rejects invalid success response %s", async (body) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(body, { status: 200 })),
    );
    await expect(
      calculate({ operation: "add", a: 1, b: 2 }, new AbortController().signal),
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE", status: 200 });
  });
  it.each([
    "{}",
    '{"error":null}',
    '{"error":{"code":"","message":""}}',
    '{"error":{"code":1,"message":false}}',
    "not JSON",
  ])("rejects invalid error response %s", async (body) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(body, { status: 502 })),
    );
    await expect(
      calculate({ operation: "add", a: 1, b: 2 }, new AbortController().signal),
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE", status: 502 });
  });
  it("propagates fetch rejection so the UI can present connection guidance", async () => {
    const error = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
    await expect(
      calculate({ operation: "add", a: 1, b: 2 }, new AbortController().signal),
    ).rejects.toBe(error);
  });
});
