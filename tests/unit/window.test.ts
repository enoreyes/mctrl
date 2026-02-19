import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";

describe.runIf(isMac())("window", () => {
  it("window list returns output", () => {
    const { stdout, code } = mctrl("window list");
    expect(code).toBe(0);
    // CI may have no windows, but should not error
    expect(typeof stdout).toBe("string");
  });

  it("window list --json returns valid JSON array", () => {
    const { stdout, code } = mctrl("window list --json");
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty("app");
      expect(data[0]).toHaveProperty("width");
    }
  });
});
