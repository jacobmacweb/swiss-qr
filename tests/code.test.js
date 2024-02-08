import { describe, expect, test } from "vitest";
import { validateAndFormatNumber } from "../lib/code";

describe("qr code module - number validation", () => {
  test("allows valid numbers", () => {
    expect(validateAndFormatNumber(120)).toBe("120.00");
    expect(validateAndFormatNumber(120.5)).toBe("120.50");
    expect(validateAndFormatNumber(120.55)).toBe("120.55");
  });
  test("throws for invalid numbers", () => {
    expect(() => validateAndFormatNumber(120.555)).toThrowError(
      "Number must be positive, have 1 to 9 digits before the decimal point, and at most 2 decimal places.",
    );
    expect(() => validateAndFormatNumber(-1)).toThrowError(
      "Number must be positive, have 1 to 9 digits before the decimal point, and at most 2 decimal places.",
    );
  });

  test("allows valid strings", () => {
    expect(validateAndFormatNumber("120")).toBe("120.00");
    expect(validateAndFormatNumber("120.5")).toBe("120.50");
    expect(validateAndFormatNumber("120.55")).toBe("120.55");
  });

  test("throws for invalid strings", () => {
    expect(() => validateAndFormatNumber("120.555")).toThrowError(
      "Number must be positive, have 1 to 9 digits before the decimal point, and at most 2 decimal places.",
    );
    expect(() => validateAndFormatNumber("-1")).toThrowError(
      "Number must be positive, have 1 to 9 digits before the decimal point, and at most 2 decimal places.",
    );
  });
});
