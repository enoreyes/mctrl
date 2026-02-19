import { describe, it, expect } from "vitest";
import { mctrl } from "../helpers.js";

describe("keyboard", () => {
  it("keyboard --help lists all subcommands", () => {
    const { stdout, code } = mctrl("keyboard --help");
    expect(code).toBe(0);
    expect(stdout).toContain("type");
    expect(stdout).toContain("press");
    expect(stdout).toContain("hotkey");
    expect(stdout).toContain("down");
    expect(stdout).toContain("up");
  });

  it("keyboard hotkey --help shows modifier examples", () => {
    const { stdout, code } = mctrl("keyboard hotkey --help");
    expect(code).toBe(0);
    expect(stdout).toContain("command");
  });
});
