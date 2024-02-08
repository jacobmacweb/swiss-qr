import { Address, AddressOptions } from "./address";
import { ALLOWED_CURRENCIES } from "./constants";
import { LABELS } from "./labels";
import { validate } from "node-iso11649";
import { isValid as isValidEsr } from "./esr";
import { Encodable } from ".";

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
      ...new Address().encode(), // Final Creditor, this is future proofing.
      this.amount ?? "",
      this.currency ?? "",
      this.debtor?.address?.encode() ?? new Address().encode(),
      this.referenceType ?? "",
      this.debtor?.additionalInformation?.replace(/\r?\n/g, " ") ?? "",
      "EPD",
      ...(this.alternativeProcedure ?? []),
    ].join("\r\n");
  }
}

export const validateAndFormatNumber = (input: number | string): string => {
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
