import { Command } from "commander";
import { execSync, execFileSync } from "node:child_process";
import { ensureMac, osascript, jsonOut, py } from "../util/run.js";

export const os = new Command("os")
  .description(
    `OS-level actions: launch/quit apps, notifications, frontmost app.

Examples:
  mctrl os notify "Build complete" --title "CI"
  mctrl os open-app Safari
  mctrl os quit-app Safari
  mctrl os frontmost-app
  mctrl os list-apps`
  );

os
  .command("notify")
  .description("Show a macOS system notification.")
  .argument("<text>", "notification body")
  .option("--title <title>", "notification title", "mctrl")
  .action((text: string, opts: { title: string }) => {
    ensureMac();
    const t = opts.title.replace(/"/g, '\\"');
    const b = text.replace(/"/g, '\\"');
    osascript(`display notification "${b}" with title "${t}"`);
  });

os
  .command("open-app")
  .description("Open a macOS application by name.")
  .argument("<app>", "application name")
  .action((app: string) => {
    ensureMac();
    execFileSync("open", ["-a", app]);
    console.log(`Opened: ${app}`);
  });

os
  .command("quit-app")
  .description("Quit a macOS application by name.")
  .argument("<app>", "application name")
  .action((app: string) => {
    ensureMac();
    osascript(`tell application "${app}" to quit`);
    console.log(`Quit: ${app}`);
  });

os
  .command("frontmost-app")
  .description("Print the name of the frontmost application.")
  .option("--json", "output as JSON")
  .action((opts: { json?: boolean }) => {
    ensureMac();
    const name = osascript(
      `tell application "System Events" to get name of first application process whose frontmost is true`
    );
    if (opts.json) jsonOut({ app: name });
    else console.log(name);
  });

os
  .command("open-url")
  .description("Open a URL in the default browser.")
  .argument("<url>", "URL to open")
  .action((url: string) => {
    ensureMac();
    execFileSync("open", [url]);
  });

os
  .command("list-apps")
  .description("List running (visible) applications.")
  .option("--json", "output as JSON")
  .action((opts: { json?: boolean }) => {
    ensureMac();
    const raw = osascript(
      `tell application "System Events" to get name of every application process whose background only is false`
    );
    const apps = raw.split(", ").map((s) => s.trim()).filter(Boolean);
    if (opts.json) jsonOut(apps);
    else apps.forEach((a) => console.log(a));
  });

os
  .command("get-selected-text")
  .description("Get the currently selected text (copies selection and reads clipboard).")
  .action(() => {
    ensureMac();
    const prev = execSync("pbpaste", { encoding: "utf-8" });
    osascript(
      `tell application "System Events" to keystroke "c" using {command down}`
    );
    execSync("sleep 0.2");
    const text = execSync("pbpaste", { encoding: "utf-8" });
    execSync("pbcopy", { input: prev, encoding: "utf-8" });
    console.log(text);
  });
