import { Command } from "commander";
import { execSync } from "node:child_process";
import { ensureMac, osascript } from "../util/run.js";

export const clipboard = new Command("clipboard")
  .description(
    `Copy, paste, and view clipboard contents.

Examples:
  mctrl clipboard view
  mctrl clipboard copy "Hello"
  mctrl clipboard paste`
  );

clipboard
  .command("view")
  .description("Print current clipboard contents to stdout.")
  .action(() => {
    ensureMac();
    const text = execSync("pbpaste", { encoding: "utf-8" });
    process.stdout.write(text);
    if (!text.endsWith("\n")) process.stdout.write("\n");
  });

clipboard
  .command("copy")
  .description("Copy text to the clipboard. If no text given, triggers Cmd+C.")
  .argument("[text]", "text to copy")
  .action((text?: string) => {
    ensureMac();
    if (text !== undefined) {
      execSync("pbcopy", { input: text, encoding: "utf-8" });
    } else {
      osascript(
        `tell application "System Events" to keystroke "c" using {command down}`
      );
    }
  });

clipboard
  .command("paste")
  .description("Trigger a paste action (Cmd+V).")
  .action(() => {
    ensureMac();
    osascript(
      `tell application "System Events" to keystroke "v" using {command down}`
    );
  });
