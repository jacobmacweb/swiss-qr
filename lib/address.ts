import { Encodable } from ".";

export type AddressOptions =
  | {
      name: string;
      line1: string;
      line2: string;
      country: string;
    }
  | {
      name: string;
      street: string;
      houseNumber: string;
      postalCode: string;
      city: string;
      country: string;
    };

export class Address implements Encodable {
  private addressType: "STRUCTURED" | "COMBINED";
  constructor(private options?: AddressOptions) {}

  public static from(options: Address | AddressOptions) {
    if (options instanceof Address) {
      return options;
    }

    return new Address(options);
  }

  public encode() {
    if (!this.options) {
      return Array.from({ length: 7 }, () => "").join("\r\n");
    }

    if ("street" in this.options) {
      // Structured
      return [
        "S",
        this.options.name.replace(/\n/g, " "),
        this.options.street.replace(/\n/g, " "),
        this.options.houseNumber,
        this.options.postalCode,
        this.options.city,
        this.options.country,
      ].join("\r\n");
    } else {
      // Combined
      return [
        "K",
        this.options.name.replace(/\n/g, " "),
        this.options.line1.replace(/\n/g, " "),
        this.options.line2.replace(/\n/g, " "),
        ...Array.from({ length: 2 }, () => ""),
        this.options.country,
      ].join("\r\n");
    }
  }
}
