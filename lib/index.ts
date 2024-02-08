import { Address } from "./address";
import { QRCode } from "./code";
import { Document } from "./document";

export interface Encodable {
  encode(): string;
}

export { Document, Address, QRCode };
