import { describe, expect, it } from "vitest";
import { parseOperand } from "./calculator";

describe("parseOperand", () => {
  it.each([
    ["0", 0],
    ["-2.5", -2.5],
    [".5", 0.5],
    ["1.", 1],
    ["+2", 2],
    ["1e3", 1000],
    [" 2.25 ", 2.25],
  ])("accepts %s", (text, value) => expect(parseOperand(text)).toBe(value));
  it.each([
    "",
    "  ",
    "0x10",
    "Infinity",
    "NaN",
    "1,5",
    "1_000",
    "12abc",
    "1e309",
  ])("rejects %s", (text) => expect(parseOperand(text)).toBeNull());
});
