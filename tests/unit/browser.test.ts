import { describe, it, expect } from "vitest";
import { mctrl } from "../helpers.js";

describe("browser", () => {
  it("browser --help lists all subcommands", () => {
    const { stdout, code } = mctrl("browser --help");
    expect(code).toBe(0);
    expect(stdout).toContain("open");
    expect(stdout).toContain("tabs");
    expect(stdout).toContain("current-url");
    expect(stdout).toContain("current-title");
    expect(stdout).toContain("js");
    expect(stdout).toContain("page-source");
  });
});
