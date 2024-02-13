import { Address, AddressOptions } from "./address";
import { ALLOWED_CURRENCIES } from "./constants";
import { validate } from "node-iso11649";
import { isValid as isValidEsr } from "./esr";
import { Encodable } from "./index";
import QRCodeSvg from "qrcode-svg";
import * as d3 from "d3";
import * as jsdom from "jsdom";

interface QRCodeOptions {
  amount: string | number;
  currency: (typeof ALLOWED_CURRENCIES)[number];
  creditor: {
    iban: string;
    address: Address | AddressOptions;
  };
  debtor?: {
    address?: Address | AddressOptions;
    additionalInformation?: string;
  };
  referenceNumber?: string;
  alternativeProcedure?: string[];
}

export const QR_TYPE = "SPC";
export const QR_VERSION = "0200";
export const QR_CODING = "1";

export class QRCode implements Encodable {
  private amount: string;
  private currency: (typeof ALLOWED_CURRENCIES)[number];
  private creditor: {
    iban: string;
    address: Address;
  };
  private debtor?: {
    address?: Address;
    additionalInformation?: string;
  };
  private referenceType?: "NON" | "SCOR" | "QRR";
  private referenceNumber?: string;
  private alternativeProcedure?: string[];

  constructor(options: QRCodeOptions) {
    this.validateOptions(options);
  }

  private validateOptions(options: QRCodeOptions) {
    this.amount = validateAndFormatNumber(options.amount);
    if (!ALLOWED_CURRENCIES.includes(options.currency)) {
      throw new Error(
        `Currency ${options.currency} not allowed. Must be one of ${ALLOWED_CURRENCIES.join(", ")}.`,
      );
    }
    this.currency = options.currency;
    if (!options.creditor) {
      throw new Error("Creditor information is required.");
    }
    if (!options.creditor.iban) {
      throw new Error("Creditor IBAN is required.");
    }
    if (!options.creditor.address) {
      throw new Error("Creditor address is required.");
    }
    this.creditor = {
      iban: options.creditor.iban,
      address: Address.from(options.creditor.address),
    };

    if (options.debtor?.address) {
      this.debtor = {
        address: Address.from(options.debtor.address),
        additionalInformation: options.debtor.additionalInformation,
      };
    }

    if (options.referenceNumber) {
      if (options.referenceNumber?.startsWith("RF")) {
        if (!validate(options.referenceNumber)) {
          throw new Error("Invalid reference number.");
        }
        this.referenceType = "SCOR";
        this.referenceNumber = options.referenceNumber;
      } else if (isValidEsr(options.referenceNumber)) {
        this.referenceType = "QRR";
        this.referenceNumber = options.referenceNumber;
      } else {
        throw new Error("Invalid reference number.");
      }
    } else {
      this.referenceType = "NON";
      this.referenceNumber = "";
    }

    if (options.alternativeProcedure) {
      if (options.alternativeProcedure.length > 2) {
        throw new Error(
          "Alternative procedure must be an array of at most 2 strings.",
        );
      }

      if (
        options.alternativeProcedure.some(
          (alternativeProcedure) => alternativeProcedure.length > 100,
        )
      ) {
        throw new Error(
          "Alternative procedure must be at most 100 characters long.",
        );
      }
      this.alternativeProcedure = options.alternativeProcedure;
    }
  }

  public encode() {
    // TODO: Implement the encoding of the QR code
    return [
      QR_TYPE,
      QR_VERSION,
      QR_CODING,
      this.creditor.iban,
      this.creditor.address.encode(),
      new Address().encode(), // Final Creditor, this is future proofing.
      this.amount ?? "",
      this.currency ?? "",
      this.debtor?.address?.encode() ?? new Address().encode(),
      this.referenceType ?? "",
      this.referenceNumber ?? "",
      this.debtor?.additionalInformation?.replace(/\r?\n/g, " ") ?? "",
      "EPD",
      ...(this.alternativeProcedure ?? []),
    ].join("\r\n");
  }

  public svgContent() {
    return new QRCodeSvg({
      content: this.encode(),
      padding: 0,
      ecl: "M",
    }).svg();
  }

  public insertSvgContent(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  ) {
    const dom = new jsdom.JSDOM();

    const qrSvg = d3
      .select(dom.window.document)
      .select("body")
      .html(this.svgContent());

    svg.insert("g").attr("id", "qr").html(qrSvg.select("svg").html());
  }

  public insertSwissCross(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  ) {
    const center = 128;
    const scale = 4.25;
    const centerOffset = (8.5 * scale) / 2;
    const group = svg
      .append("g")
      .attr(
        "transform",
        `translate(${center - centerOffset}, ${center - centerOffset}) scale(${scale})`,
      );

    group
      .append("rect")
      .attr("x", -0.5)
      .attr("y", -0.5)
      .attr("width", 8.5)
      .attr("height", 8.5)
      .attr("fill", "white");

    group
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 7.5)
      .attr("height", 7.5)
      .attr("fill", "black");

    const outside = 1.5;
    const inside = 1.5;
    group
      .append("polygon")
      .attr(
        "points",
        [
          [outside, outside + inside],
          [outside + inside, outside + inside],
          [outside + inside, outside],
          [outside + inside * 2, outside],
          [outside + inside * 2, outside + inside],
          [outside + inside * 3, outside + inside],
          [outside + inside * 3, outside + inside * 2],
          [outside + inside * 2, outside + inside * 2],
          [outside + inside * 2, outside + inside * 3],
          [outside + inside, outside + inside * 3],
          [outside + inside, outside + inside * 2],
          [outside, outside + inside * 2],
        ]
          .map((v) => v.join(","))
          .join(" "),
      )
      .attr("fill", "white");

    return group;
  }

  public svg() {
    const dom = new jsdom.JSDOM();
    // <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="256" height="256">
    const svg = d3
      .select(dom.window.document)
      .select("body")
      .append("svg")
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("version", "1.1")
      .attr("width", "256")
      .attr("height", "256");

    this.insertSvgContent(svg);
    this.insertSwissCross(svg);

    return svg;
  }
}

export const validateAndFormatNumber = (input: number | string): string => {
  if (input === undefined || input === null) {
    throw new Error("Number is required.");
  }

  // Convert input to string if it's a number
  const inputStr = input.toString();

  const validNumberRegex = /^\d{1,9}(?:\.\d{1,2})?$/;

  if (!validNumberRegex.test(inputStr)) {
    throw new Error(
      "Number must be positive, have 1 to 9 digits before the decimal point, and at most 2 decimal places.",
    );
  }

  // Parse the number to ensure it's a valid numeric value and format it
  const number = parseFloat(inputStr);
  if (isNaN(number)) {
    throw new Error("Invalid number.");
  }

  // Ensure the number is non-negative
  if (number < 0) {
    throw new Error("Negative numbers are not allowed.");
  }

  // Format the number to have at most two decimal points
  const formattedNumber = number.toFixed(2);

  // Additional check to ensure the number before the decimal point doesn't exceed 9 digits
  if (formattedNumber.split(".")[0].length > 9) {
    throw new Error(
      "Number must not exceed 9 digits before the decimal point.",
    );
  }

  return formattedNumber;
};
