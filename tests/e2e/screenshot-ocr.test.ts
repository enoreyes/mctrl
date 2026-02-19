import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";
import { existsSync, unlinkSync } from "node:fs";

describe.runIf(isMac())("e2e: screenshot + ocr pipeline", () => {
  it("takes a screenshot and extracts text from it", () => {
    const img = `/tmp/mctrl_e2e_ocr_${Date.now()}.png`;

    // Step 1: capture
    const ss = mctrl(`display screenshot -o ${img}`);
    expect(ss.code).toBe(0);
    expect(existsSync(img)).toBe(true);

    // Step 2: OCR
    const ocr = mctrl(`screen ocr --file ${img}`);
    expect(ocr.code).toBe(0);
    expect(ocr.stdout.length).toBeGreaterThan(0);

    // Step 3: OCR with JSON
    const ocrJson = mctrl(`screen ocr --file ${img} --json`);
    expect(ocrJson.code).toBe(0);
    const items = JSON.parse(ocrJson.stdout);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty("text");
    expect(items[0]).toHaveProperty("confidence");
    expect(items[0].confidence).toBeGreaterThan(0);

    unlinkSync(img);
  });
});
