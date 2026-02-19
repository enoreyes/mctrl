import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";
import { existsSync, unlinkSync } from "node:fs";

describe.runIf(isMac())("screen", () => {
  it("screen ocr extracts text from a screenshot", () => {
    const img = `/tmp/mctrl_ocr_test_${Date.now()}.png`;
    const { code: ssCode } = mctrl(`display screenshot -o ${img}`);
    expect(ssCode).toBe(0);

    const { stdout, code } = mctrl(`screen ocr --file ${img}`);
    expect(code).toBe(0);
    // Should extract at least some text from the screen
    expect(stdout.length).toBeGreaterThan(0);
    unlinkSync(img);
  });

  it("screen ocr --json returns array with text and confidence", () => {
    const img = `/tmp/mctrl_ocr_json_test_${Date.now()}.png`;
    mctrl(`display screenshot -o ${img}`);

    const { stdout, code } = mctrl(`screen ocr --file ${img} --json`);
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty("text");
      expect(data[0]).toHaveProperty("confidence");
    }
    unlinkSync(img);
  });
});
