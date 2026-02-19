import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";

describe.runIf(isMac())("e2e: accessibility inspection", () => {
  it("inspects Finder UI: tree + children", () => {
    // Step 1: get Finder's AX tree
    const tree = mctrl("a11y tree --app Finder --depth 2");
    expect(tree.code).toBe(0);
    expect(tree.stdout).toContain("AX");

    // Step 2: get children of Finder's front window
    const children = mctrl("a11y children --app Finder");
    expect(children.code).toBe(0);
    // Finder windows have at least close/minimize/fullscreen buttons
    expect(children.stdout.length).toBeGreaterThan(0);
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
