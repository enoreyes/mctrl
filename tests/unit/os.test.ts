import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";

describe.runIf(isMac())("os", () => {
  it("os frontmost-app returns a name", () => {
    const { stdout, code } = mctrl("os frontmost-app");
    expect(code).toBe(0);
    expect(stdout.length).toBeGreaterThan(0);
  });

  it("os frontmost-app --json returns app field", () => {
    const { stdout, code } = mctrl("os frontmost-app --json");
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(data).toHaveProperty("app");
  });

  it("os list-apps returns at least one app", () => {
    const { stdout, code } = mctrl("os list-apps");
    expect(code).toBe(0);
    expect(stdout.split("\n").length).toBeGreaterThan(0);
  });

  it("os list-apps --json returns array", () => {
    const { stdout, code } = mctrl("os list-apps --json");
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
