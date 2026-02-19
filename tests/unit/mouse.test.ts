import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";

describe.runIf(isMac())("mouse", () => {
  it("mouse position returns x,y", () => {
    const { stdout, code } = mctrl("mouse position");
    expect(code).toBe(0);
    expect(stdout).toMatch(/^\d+,\d+$/);
  });

  it("mouse position --json returns x and y", () => {
    const { stdout, code } = mctrl("mouse position --json");
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(typeof data.x).toBe("number");
    expect(typeof data.y).toBe("number");
  });
});
