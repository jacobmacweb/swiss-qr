import { describe, expect, test } from "vitest";
import { Document } from "../lib/bill";
import fs from "fs/promises";
import os from "os";
import path from "path";

describe("bill module - empty bill", () => {
  test("creates an empty a4 file", async () => {
    const bill = new Document();
    expect(bill.htmlContent).toBe('<svg viewbox="0 0 210 297"></svg>');
  });

  test("saves an empty a4 file", async () => {
    // create a temp file name
    const tempdir = await fs.mkdtemp(path.join(os.tmpdir(), "test"));
    const testFile = path.join(tempdir, "output.svg");

    const bill = new Document();
    await bill.writeToFile(testFile);

    // check the file has the right content
    const content = await fs.readFile(testFile, "utf-8");
    expect(content).toBe('<svg viewbox="0 0 210 297"></svg>');
  });
});
