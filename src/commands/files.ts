import { Command } from "commander";
import { execSync, execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { jsonOut } from "../util/run.js";

export const files = new Command("files")
  .description(
    `File system operations: search, read, write, edit, list.

Examples:
  mctrl files search "config" --dir ~/projects
  mctrl files read /path/to/file.txt
  mctrl files write /path/to/file.txt "contents"
  mctrl files edit /path/to/file.txt --old "foo" --new "bar"
  mctrl files list /tmp`
  );

files
  .command("search")
  .description("Search for files by name or content.")
  .argument("<query>", "search string")
  .option("--dir <path>", "directory to search in", ".")
  .option("--name-only", "only match file names, not content")
  .option("--json", "output as JSON")
  .action((query: string, opts: { dir: string; nameOnly?: boolean; json?: boolean }) => {
    const dir = resolve(opts.dir);
    let results: string[] = [];
    if (opts.nameOnly) {
      const walk = (d: string) => {
        for (const ent of readdirSync(d, { withFileTypes: true })) {
          const full = join(d, ent.name);
          if (ent.isDirectory()) walk(full);
          else if (ent.name.toLowerCase().includes(query.toLowerCase())) results.push(full);
        }
      };
      walk(dir);
    } else {
      try {
        const raw = execFileSync("rg", ["--files-with-matches", "--no-heading", query, dir], { encoding: "utf-8" });
        results = raw.trim().split("\n").filter(Boolean);
      } catch {
        results = [];
      }
    }
    if (opts.json) jsonOut(results);
    else if (results.length === 0) console.log("No matches found.");
    else results.forEach((r) => console.log(r));
  });

files
  .command("read")
  .description("Print a file's contents.")
  .argument("<path>", "file path")
  .option("--lines <range>", "line range (e.g. 10-20)")
  .action((path: string, opts: { lines?: string }) => {
    const resolved = resolve(path);
    if (!existsSync(resolved)) {
      console.error(`Error: ${resolved} not found.`);
      process.exit(1);
    }
    const content = readFileSync(resolved, "utf-8");
    if (opts.lines) {
      const [s, e] = opts.lines.split("-").map(Number);
      const lines = content.split("\n");
      console.log(lines.slice(s - 1, e).join("\n"));
    } else {
      process.stdout.write(content);
    }
  });

files
  .command("write")
  .description("Write content to a file.")
  .argument("<path>", "file path")
  .argument("<content>", "content to write")
  .option("--append", "append instead of overwrite")
  .action((path: string, content: string, opts: { append?: boolean }) => {
    const resolved = resolve(path);
    mkdirSync(dirname(resolved), { recursive: true });
    if (opts.append) {
      const { appendFileSync } = require("node:fs");
      appendFileSync(resolved, content.endsWith("\n") ? content : content + "\n");
    } else {
      writeFileSync(resolved, content.endsWith("\n") ? content : content + "\n");
    }
    console.log(`${opts.append ? "Appended to" : "Wrote"}: ${resolved}`);
  });

files
  .command("edit")
  .description("Replace text in a file.")
  .argument("<path>", "file path")
  .requiredOption("--old <text>", "text to find")
  .requiredOption("--new <text>", "replacement text")
  .action((path: string, opts: { old: string; new: string }) => {
    const resolved = resolve(path);
    if (!existsSync(resolved)) {
      console.error(`Error: ${resolved} not found.`);
      process.exit(1);
    }
    const content = readFileSync(resolved, "utf-8");
    if (!content.includes(opts.old)) {
      console.error(`Error: exact text not found in ${resolved}.`);
      process.exit(1);
    }
    writeFileSync(resolved, content.replace(opts.old, opts.new));
    console.log(`Replaced in: ${resolved}`);
  });

files
  .command("list")
  .description("List directory contents.")
  .argument("[path]", "directory path", ".")
  .option("--all", "include hidden files")
  .option("--json", "output as JSON")
  .action((path: string, opts: { all?: boolean; json?: boolean }) => {
    const resolved = resolve(path);
    if (!existsSync(resolved)) {
      console.error(`Error: ${resolved} not found.`);
      process.exit(1);
    }
    const entries = readdirSync(resolved)
      .filter((n) => opts.all || !n.startsWith("."))
      .sort()
      .map((name) => {
        const full = join(resolved, name);
        const s = statSync(full);
        return { name, type: s.isDirectory() ? "dir" : "file", size: s.isFile() ? s.size : undefined };
      });
    if (opts.json) jsonOut(entries);
    else {
      for (const e of entries) {
        const suffix = e.type === "dir" ? "/" : "";
        const sizeStr = e.size != null ? `  (${e.size} bytes)` : "";
        console.log(`  ${e.name}${suffix}${sizeStr}`);
      }
    }
  });
