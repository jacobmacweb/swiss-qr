import { describe, expect, test } from "vitest";
import { QRCode, validateAndFormatNumber } from "../lib/code";
import { Address } from "../lib/address";

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

describe("qr code - payment code", () => {
  // Presumably valid default options
  const defaultOptions = {
    amount: 100.0,
    currency: "CHF",
    creditor: {
      iban: "CH6089144687583746992",
      address: new Address({
        name: "Daniel Müller",
        street: "Chemin des Fins",
        houseNumber: "6",
        postalCode: "1218",
        city: "Genève",
        country: "CH",
      }),
    },
    debtor: {
      address: new Address({
        name: "Lilly Haas",
        street: "Route de l'Allondon",
        houseNumber: "30",
        postalCode: "1242",
        city: "Genève",
        country: "CH",
      }),
      additionalInformation: "Test message",
    },
  };
  test("encodes correct data", () => {
    const code = new QRCode(defaultOptions);

    expect(code.encode()).toBe(
      "SPC\r\n0200\r\n1\r\nCH6089144687583746992\r\nS\r\nDaniel Müller\r\nChemin des Fins\r\n6\r\n1218\r\nGenève\r\nCH\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n100.00\r\nCHF\r\nS\r\nLilly Haas\r\nRoute de l'Allondon\r\n30\r\n1242\r\nGenève\r\nCH\r\nNON\r\n\r\nTest message\r\nEPD",
    );
  });

  test("errors on incorrect data", () => {
    expect(
      () =>
        new QRCode({
          ...defaultOptions,
          amount: undefined,
        }),
    ).toThrowError("Number is required.");
  });
});
