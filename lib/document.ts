import * as d3 from "d3";
import * as jsdom from "jsdom";
import { promises as fs } from "fs";
import { PAYMENT_AREA_HEIGHT_MM } from "./constants";

export const A4 = [210, 297] as const;
export const PAYMENT_AREA = [A4[0], PAYMENT_AREA_HEIGHT_MM] as const;

export interface DocumentOptions {
  pageSize: readonly [number, number];
}

const defaultOptions: DocumentOptions = {
  pageSize: A4,
};

export class Document {
  private body: d3.Selection<HTMLBodyElement, unknown, null, undefined>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  constructor(options: DocumentOptions = defaultOptions) {
    const dom = new jsdom.JSDOM();
    this.body = d3.select(dom.window.document).select("body");

    this.svg = this.body
      .append("svg")
      .attr("viewbox", `0 0 ${options.pageSize[0]} ${options.pageSize[1]}`);
  }

  public get htmlContent() {
    return this.body.node()?.innerHTML;
  }

  public async writeToFile(filename: string) {
    const innerHTML = this.htmlContent;
    if (!innerHTML) {
      throw new Error("No innerHTML to write to file");
    }
    await fs.writeFile(filename, innerHTML);
  }
}
