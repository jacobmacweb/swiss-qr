import { describe, expect, test } from "vitest";
import { Document } from "../lib/document";
import fs from "fs/promises";
import os from "os";
import path from "path";

describe("document module - empty document", () => {
  test("creates an empty a4 file", async () => {
    const document = new Document();
    expect(document.htmlContent).toBe('<svg viewbox="0 0 210 297"></svg>');
  });

  test("saves an empty a4 file", async () => {
    // create a temp file name
    const tempdir = await fs.mkdtemp(path.join(os.tmpdir(), "test"));
    const testFile = path.join(tempdir, "output.svg");

    const document = new Document();
    await document.writeToFile(testFile);

    // check the file has the right content
    const content = await fs.readFile(testFile, "utf-8");
    expect(content).toBe('<svg viewbox="0 0 210 297"></svg>');
  });
});
