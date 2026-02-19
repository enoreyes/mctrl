import { describe, it, expect } from "vitest";
import { mctrl } from "../helpers.js";
import { existsSync, unlinkSync } from "node:fs";

describe("files", () => {
  const tmpFile = `/tmp/mctrl_files_test_${Date.now()}.txt`;

  it("files write creates a file", () => {
    const { stdout, code } = mctrl(`files write ${tmpFile} "hello mctrl"`);
    expect(code).toBe(0);
    expect(stdout).toContain("Wrote");
    expect(existsSync(tmpFile)).toBe(true);
  });

  it("files read returns file contents", () => {
    mctrl(`files write ${tmpFile} "test content"`);
    const { stdout, code } = mctrl(`files read ${tmpFile}`);
    expect(code).toBe(0);
    expect(stdout).toContain("test content");
  });

  it("files edit replaces text in a file", () => {
    mctrl(`files write ${tmpFile} "hello world"`);
    const { code } = mctrl(`files edit ${tmpFile} --old "hello" --new "goodbye"`);
    expect(code).toBe(0);
    const { stdout } = mctrl(`files read ${tmpFile}`);
    expect(stdout).toContain("goodbye world");
  });

  it("files list returns directory entries", () => {
    const { stdout, code } = mctrl("files list /tmp");
    expect(code).toBe(0);
    expect(stdout.length).toBeGreaterThan(0);
  });

  it("files list --json returns valid array", () => {
    const { stdout, code } = mctrl("files list /tmp --json");
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("name");
    expect(data[0]).toHaveProperty("type");
  });

  it("files search finds files by name", () => {
    const name = `mctrl_search_test_${Date.now()}.txt`;
    const path = `/tmp/${name}`;
    mctrl(`files write ${path} "searchable"`);
    const { stdout, code } = mctrl(`files search "${name}" --dir /tmp --name-only`);
    expect(code).toBe(0);
    expect(stdout).toContain(name);
    unlinkSync(path);
  });

  it("files read --lines returns specific range", () => {
    const path = `/tmp/mctrl_lines_test_${Date.now()}.txt`;
    mctrl(`files write ${path} "line1\nline2\nline3\nline4\nline5"`);
    const { stdout, code } = mctrl(`files read ${path} --lines 2-4`);
    expect(code).toBe(0);
    expect(stdout).toContain("line2");
    unlinkSync(path);
  });

  // Cleanup
  it("cleanup temp files", () => {
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
  });
});
