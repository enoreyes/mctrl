import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";

describe.runIf(isMac())("e2e: accessibility inspection", () => {
  it("inspects Finder UI: tree (children skipped if no window)", () => {
    // Step 1: get Finder's AX tree (works even without open windows)
    const tree = mctrl("a11y tree --app Finder --depth 2");
    expect(tree.code).toBe(0);
    expect(tree.stdout).toContain("AX");

    // Step 2: try children - Finder may have no open window in CI
    const children = mctrl("a11y children --app Finder");
    if (children.code === 0) {
      expect(children.stdout.length).toBeGreaterThan(0);
    } else {
      // Graceful: Finder has no front window (expected in headless CI)
      expect(children.stderr + children.stdout).toMatch(/window|error|Invalid/i);
    }
  });

  it("combines a11y with display: get focused element + frontmost app", () => {
    // Step 1: get frontmost app from OS
    const front = mctrl("os frontmost-app --json");
    expect(front.code).toBe(0);
    const app = JSON.parse(front.stdout).app;
    expect(app.length).toBeGreaterThan(0);

    // Step 2: get focused element (doesn't require app name matching)
    const focused = mctrl("a11y focused");
    expect(focused.code).toBe(0);
    expect(focused.stdout.length).toBeGreaterThan(0);
  });
});
