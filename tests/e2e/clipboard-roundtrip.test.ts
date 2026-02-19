import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";

describe.runIf(isMac())("e2e: clipboard roundtrip", () => {
  it("copies text and reads it back", () => {
    const payload = `e2e_test_${Date.now()}`;

    // Step 1: copy
    const copy = mctrl(`clipboard copy "${payload}"`);
    expect(copy.code).toBe(0);

    // Step 2: view
    const view = mctrl("clipboard view");
    expect(view.code).toBe(0);
    expect(view.stdout).toBe(payload);
  });

  it("overwrites clipboard with new content", () => {
    const first = `first_${Date.now()}`;
    const second = `second_${Date.now()}`;

    mctrl(`clipboard copy "${first}"`);
    expect(mctrl("clipboard view").stdout).toBe(first);

    mctrl(`clipboard copy "${second}"`);
    expect(mctrl("clipboard view").stdout).toBe(second);
  });
});
