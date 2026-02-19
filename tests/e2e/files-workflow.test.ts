import { describe, it, expect } from "vitest";
import { mctrl } from "../helpers.js";
import { existsSync, unlinkSync } from "node:fs";
import { basename } from "node:path";

describe("e2e: files workflow (write, read, edit, search)", () => {
  const ts = Date.now();
  const file = `/tmp/mctrl_e2e_files_${ts}.txt`;
  const name = basename(file);

  it("complete file lifecycle", () => {
    // Step 1: write
    const write = mctrl(`files write ${file} "The quick brown fox"`);
    expect(write.code).toBe(0);
    expect(existsSync(file)).toBe(true);

    // Step 2: read
    const read = mctrl(`files read ${file}`);
    expect(read.code).toBe(0);
    expect(read.stdout).toContain("The quick brown fox");

    // Step 3: edit
    const edit = mctrl(`files edit ${file} --old "brown fox" --new "red panda"`);
    expect(edit.code).toBe(0);

    // Step 4: verify edit
    const readAfter = mctrl(`files read ${file}`);
    expect(readAfter.stdout).toContain("The quick red panda");
    expect(readAfter.stdout).not.toContain("brown fox");

    // Step 5: search by name
    const searchName = mctrl(`files search "${name}" --dir /tmp --name-only`);
    expect(searchName.code).toBe(0);
    expect(searchName.stdout).toContain(file);

    // Step 6: list
    const list = mctrl("files list /tmp --json");
    expect(list.code).toBe(0);
    const entries = JSON.parse(list.stdout);
    const found = entries.find((e: any) => file.endsWith(e.name));
    expect(found).toBeDefined();

    // Cleanup
    unlinkSync(file);
  });
});
