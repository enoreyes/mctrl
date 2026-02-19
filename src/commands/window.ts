import { Command } from "commander";
import { ensureMac, osascript, jsonOut, py } from "../util/run.js";

export const window = new Command("window")
  .description(
    `Window management: list, focus, resize, move, minimize, fullscreen.

Examples:
  mctrl window list
  mctrl window focus "Google Chrome"
  mctrl window resize --width 1200 --height 800
  mctrl window move --x 0 --y 0`
  );

window
  .command("list")
  .description("List all visible application windows.")
  .option("--json", "output as JSON")
  .action((opts: { json?: boolean }) => {
    ensureMac();
    // Use Python + Quartz for reliable, fast window listing
    const raw = py(`
import Quartz, json
wl = Quartz.CGWindowListCopyWindowInfo(Quartz.kCGWindowListOptionOnScreenOnly | Quartz.kCGWindowListExcludeDesktopElements, Quartz.kCGNullWindowID)
out = []
for w in wl:
    name = w.get('kCGWindowOwnerName', '')
    title = w.get('kCGWindowName', '')
    b = w.get('kCGWindowBounds', {})
    layer = w.get('kCGWindowLayer', 0)
    if layer == 0 and name:
        out.append({'app': name, 'title': title or '', 'x': int(b.get('X', 0)), 'y': int(b.get('Y', 0)), 'width': int(b.get('Width', 0)), 'height': int(b.get('Height', 0))})
print(json.dumps(out))
`);
    const windows = JSON.parse(raw || "[]") as Array<{app: string; title: string; x: number; y: number; width: number; height: number}>;
    if (windows.length === 0) {
      if (opts.json) console.log("[]");
      else console.log("No windows found.");
      return;
    }
    if (opts.json) jsonOut(windows);
    else {
      for (const w of windows)
        console.log(`  [${w.app}] ${w.title}\n    Position: ${w.x},${w.y} Size: ${w.width}x${w.height}`);
    }
  });

window
  .command("focus")
  .description("Bring an application window to the front.")
  .argument("<app>", "application name")
  .action((app: string) => {
    ensureMac();
    osascript(`tell application "${app}" to activate`);
    console.log(`Focused: ${app}`);
  });

window
  .command("resize")
  .description("Resize the frontmost window.")
  .requiredOption("--width <n>", "width in pixels", parseInt)
  .requiredOption("--height <n>", "height in pixels", parseInt)
  .option("--app <name>", "target app (default: frontmost)")
  .action((opts: { width: number; height: number; app?: string }) => {
    ensureMac();
    const target = opts.app
      ? `application process "${opts.app}"`
      : `first application process whose frontmost is true`;
    osascript(
      `tell application "System Events" to set size of front window of ${target} to {${opts.width}, ${opts.height}}`
    );
    console.log(`Resized to ${opts.width}x${opts.height}`);
  });

window
  .command("move")
  .description("Move the frontmost window to a position.")
  .requiredOption("--x <n>", "X position", parseInt)
  .requiredOption("--y <n>", "Y position", parseInt)
  .option("--app <name>", "target app (default: frontmost)")
  .action((opts: { x: number; y: number; app?: string }) => {
    ensureMac();
    const target = opts.app
      ? `application process "${opts.app}"`
      : `first application process whose frontmost is true`;
    osascript(
      `tell application "System Events" to set position of front window of ${target} to {${opts.x}, ${opts.y}}`
    );
    console.log(`Moved to (${opts.x}, ${opts.y})`);
  });

window
  .command("minimize")
  .description("Minimize the frontmost window.")
  .option("--app <name>", "target app")
  .action((opts: { app?: string }) => {
    ensureMac();
    const target = opts.app
      ? `application process "${opts.app}"`
      : `first application process whose frontmost is true`;
    osascript(
      `tell application "System Events" to click (first button of front window of ${target} whose subrole is "AXMinimizeButton")`
    );
    console.log("Minimized.");
  });

window
  .command("fullscreen")
  .description("Toggle fullscreen for the frontmost window.")
  .option("--app <name>", "target app")
  .action((opts: { app?: string }) => {
    ensureMac();
    const target = opts.app
      ? `application process "${opts.app}"`
      : `first application process whose frontmost is true`;
    osascript(
      `tell application "System Events" to click (first button of front window of ${target} whose subrole is "AXFullScreenButton")`
    );
    console.log("Toggled fullscreen.");
  });
