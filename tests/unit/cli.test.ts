import { describe, it, expect } from "vitest";
import { mctrl } from "../helpers.js";

describe("cli", () => {
  it("shows help with all primitives listed", () => {
    const { stdout, code } = mctrl("--help");
    expect(code).toBe(0);
    const primitives = [
      "keyboard", "mouse", "display", "clipboard", "screen",
      "window", "a11y", "browser", "files", "os",
      "calendar", "contacts", "mail", "sms",
    ];
    for (const p of primitives) {
      expect(stdout).toContain(p);
    }
  });

  it("shows version", () => {
    const { stdout, code } = mctrl("--version");
    expect(code).toBe(0);
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  it("exits with error for unknown command", () => {
    const { code } = mctrl("nonexistent");
    expect(code).not.toBe(0);
  });
});
