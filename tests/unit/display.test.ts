import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";
import { existsSync, unlinkSync } from "node:fs";

describe.runIf(isMac())("display", () => {
  it("display size returns WxH format", () => {
    const { stdout, code } = mctrl("display size");
    expect(code).toBe(0);
    expect(stdout).toMatch(/^\d+x\d+$/);
  });

  it("display size --json returns width and height", () => {
    const { stdout, code } = mctrl("display size --json");
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(data).toHaveProperty("width");
    expect(data).toHaveProperty("height");
    expect(data.width).toBeGreaterThan(0);
    expect(data.height).toBeGreaterThan(0);
  });

  it("display center returns x,y", () => {
    const { stdout, code } = mctrl("display center");
    expect(code).toBe(0);
    expect(stdout).toMatch(/^\d+,\d+$/);
  });

  it("display center --json returns x and y", () => {
    const { stdout, code } = mctrl("display center --json");
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.x).toBeGreaterThan(0);
    expect(data.y).toBeGreaterThan(0);
  });

  it("display info lists at least one monitor", () => {
    const { stdout, code } = mctrl("display info");
    expect(code).toBe(0);
    expect(stdout).toContain("Display");
  });

  it("display info --json returns array with main display", () => {
    const { stdout, code } = mctrl("display info --json");
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("width");
    expect(data[0]).toHaveProperty("height");
  });

  it("display screenshot creates a file", () => {
    const out = `/tmp/mctrl_test_${Date.now()}.png`;
    const { stdout, code } = mctrl(`display screenshot -o ${out}`);
    expect(code).toBe(0);
    expect(stdout).toContain(out);
    expect(existsSync(out)).toBe(true);
    unlinkSync(out);
  });

  it("display active-window returns an app name", () => {
    const { stdout, code } = mctrl("display active-window --json");
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(data).toHaveProperty("app");
    expect(data.app.length).toBeGreaterThan(0);
  });
});
