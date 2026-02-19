import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";

describe.runIf(isMac())("a11y", () => {
  it("a11y tree returns output without error", () => {
    const { stdout, code } = mctrl("a11y tree --depth 1");
    expect(code).toBe(0);
    // May be empty on CI but should not crash
    expect(typeof stdout).toBe("string");
  });

  it("a11y tree --app Finder returns AX elements", () => {
    const { stdout, code } = mctrl("a11y tree --app Finder --depth 1");
    expect(code).toBe(0);
    // Finder should always have a desktop scroll area at minimum
    expect(stdout.length).toBeGreaterThan(0);
  });

  it("a11y focused returns output or graceful message", () => {
    const { stdout, code } = mctrl("a11y focused");
    expect(code).toBe(0);
    // Either returns element info or "No focused element found."
    expect(stdout.length).toBeGreaterThan(0);
  });
});
