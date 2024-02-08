import { Address, AddressOptions } from "./address";
import { ALLOWED_CURRENCIES } from "./constants";

interface QRCodeOptions {
  amount: string | number;
  currency: (typeof ALLOWED_CURRENCIES)[number];
  creditor: {
    iban: string;
    address: Address | AddressOptions;
  };
  debtor?: {
    address?: Address | AddressOptions;
  };
  referenceNumber?: string;
}

export const QR_TYPE = "SPC";
export const QR_VERSION = "0200";
export const QR_CODING = "1";

export class QRCode {
  constructor(options: QRCodeOptions) {}

  public createContent() {}
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
