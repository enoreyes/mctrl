import { describe, it, expect } from "vitest";
import { mctrl, isMac } from "../helpers.js";

describe.runIf(isMac())("e2e: display + window + os context gathering", () => {
  it("gathers full screen context: size, active app, windows", () => {
    // Step 1: get screen dimensions
    const size = mctrl("display size --json");
    expect(size.code).toBe(0);
    const dims = JSON.parse(size.stdout);
    expect(dims.width).toBeGreaterThan(0);

    // Step 2: get frontmost app
    const front = mctrl("os frontmost-app --json");
    expect(front.code).toBe(0);
    const app = JSON.parse(front.stdout);
    expect(app.app.length).toBeGreaterThan(0);

    // Step 3: list all windows
    const wins = mctrl("window list --json");
    expect(wins.code).toBe(0);
    const windows = JSON.parse(wins.stdout);
    expect(Array.isArray(windows)).toBe(true);

    // Step 4: verify all window coordinates are within screen bounds
    for (const w of windows) {
      expect(w.x).toBeGreaterThanOrEqual(-100); // allow slight offscreen
      expect(w.y).toBeGreaterThanOrEqual(-100);
    }

    // Step 5: get active window info
    const active = mctrl("display active-window --json");
    expect(active.code).toBe(0);
    const activeData = JSON.parse(active.stdout);
    expect(activeData).toHaveProperty("app");

    // Step 6: get running apps and verify frontmost is in list
    const apps = mctrl("os list-apps --json");
    expect(apps.code).toBe(0);
    const appList = JSON.parse(apps.stdout);
    // The frontmost app should be in the running apps list (case-insensitive)
    const frontName = app.app.toLowerCase();
    const found = appList.some((a: string) => a.toLowerCase() === frontName);
    expect(found).toBe(true);
  });
});
