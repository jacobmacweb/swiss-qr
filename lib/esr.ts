/**
 * Validator for ESR, ISR, QR-reference. Translated from https://github.com/arthurdejong/python-stdnum/blob/master/stdnum/ch/esr.py.
 */
// Exceptions similar to Python's stdnum
class InvalidLengthError extends Error {}
class InvalidFormatError extends Error {}
class InvalidChecksumError extends Error {}

// Utility functions (basic implementations)
function clean(number: string, allowedChars: string = " "): string {
  return number.replace(new RegExp(`[^\\d${allowedChars}]`, "g"), "");
}

function isDigits(value: string): boolean {
  return /^\d+$/.test(value);
}

function compact(number: string): string {
  return clean(number, " ").replace(/^0+/, "");
}

function calcCheckDigit(number: string): string {
  const digits = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let c = 0;
  for (const n of compact(number)) {
    c = digits[(parseInt(n, 10) + c) % 10];
  }
  return String((10 - c) % 10);
}

export function validate(number: string): string {
  number = compact(number);
  if (number.length > 27) {
    throw new InvalidLengthError();
  }
  if (!isDigits(number)) {
    throw new InvalidFormatError();
  }
  if (number[number.length - 1] !== calcCheckDigit(number.slice(0, -1))) {
    throw new InvalidChecksumError();
  }
  return number;
}

export function isValid(number: string): boolean {
  try {
    validate(number);
    return true;
  } catch (error) {
    return false;
  }
}

export function format(number: string): string {
  number = compact(number).padStart(27, "0");
  return `${number.slice(0, 2)} ${[...Array(Math.ceil((number.length - 2) / 5))].map((_, i) => number.slice(2 + i * 5, 7 + i * 5)).join(" ")}`;
}
