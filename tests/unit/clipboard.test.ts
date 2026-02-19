import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";

describe.runIf(isMac())("clipboard", () => {
  it("clipboard copy + view roundtrip", () => {
    const payload = `mctrl_test_${Date.now()}`;
    const { code: copyCode } = mctrl(`clipboard copy "${payload}"`);
    expect(copyCode).toBe(0);

    const { stdout, code } = mctrl("clipboard view");
    expect(code).toBe(0);
    expect(stdout).toContain(payload);
  });
});
