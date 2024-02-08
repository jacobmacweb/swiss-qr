import { describe, expect, test } from "vitest";
import { Address } from "../lib/address";

describe("address module", () => {
  test("encode empty address", () => {
    const address = new Address();
    // \r\n is the line separator, there are 7 lines in total
    expect(address.encode()).toBe("\r\n\r\n\r\n\r\n\r\n\r\n");
  });

  test("encode structured address", () => {
    const address = new Address({
      name: "Daniel Müller",
      street: "Chemin des Fins",
      houseNumber: "6",
      postalCode: "1218",
      city: "Geneva",
      country: "CH",
    });
    expect(address.encode()).toBe(
      "S\r\nDaniel Müller\r\nChemin des Fins\r\n6\r\n1218\r\nGeneva\r\nCH",
    );
  });

  test("encode combined address", () => {
    const address = new Address({
      name: "Daniel Müller",
      line1: "Chemin des Fins 6",
      line2: "1218 Geneva",
      country: "CH",
    });
    expect(address.encode()).toBe(
      "K\r\nDaniel Müller\r\nChemin des Fins 6\r\n1218 Geneva\r\n\r\n\r\nCH",
    );
  });
});
