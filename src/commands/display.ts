import { Command } from "commander";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureMac, osascript, jsonOut, py } from "../util/run.js";

export const display = new Command("display")
  .description(
    `Screenshots, screen dimensions, and monitor info.

Examples:
  mctrl display screenshot -o /tmp/screen.png
  mctrl display size
  mctrl display info`
  );

display
  .command("size")
  .description("Print screen dimensions (width x height).")
  .option("--json", "output as JSON")
  .action((opts: { json?: boolean }) => {
    ensureMac();
    const raw = py(
      "import Quartz; d = Quartz.CGDisplayBounds(Quartz.CGMainDisplayID()); print(f'{int(d.size.width)}x{int(d.size.height)}')"
    );
    const [w, h] = raw.split("x").map(Number);
    if (opts.json) jsonOut({ width: w, height: h });
    else console.log(raw);
  });

display
  .command("center")
  .description("Print center coordinates of the screen.")
  .option("--json", "output as JSON")
  .action((opts: { json?: boolean }) => {
    ensureMac();
    const raw = py(
      "import Quartz; d = Quartz.CGDisplayBounds(Quartz.CGMainDisplayID()); print(f'{int(d.size.width // 2)},{int(d.size.height // 2)}')"
    );
    const [x, y] = raw.split(",").map(Number);
    if (opts.json) jsonOut({ x, y });
    else console.log(raw);
  });

display
  .command("screenshot")
  .description("Capture the screen or a region to a PNG file.")
  .option("-o, --output <path>", "output file path")
  .option("--region <x,y,w,h>", "capture a specific region (x,y,width,height)")
  .action((opts: { output?: string; region?: string }) => {
    ensureMac();
    const out = opts.output ?? join(tmpdir(), `mctrl_${Date.now()}.png`);
    const args = ["-x"];
    if (opts.region) {
      args.push("-R", opts.region.replace(/,/g, ","));
    }
    args.push(out);
    execFileSync("screencapture", args);
    console.log(out);
  });

display
  .command("info")
  .description("List connected displays with resolution and position.")
  .option("--json", "output as JSON")
  .action((opts: { json?: boolean }) => {
    ensureMac();
    const raw = py(`
import Quartz, json
(err, ids, cnt) = Quartz.CGGetActiveDisplayList(16, None, None)
result = []
for d in ids:
    b = Quartz.CGDisplayBounds(d)
    result.append({'id': d, 'x': int(b.origin.x), 'y': int(b.origin.y), 'width': int(b.size.width), 'height': int(b.size.height), 'main': bool(Quartz.CGDisplayIsMain(d))})
print(json.dumps(result))
`);
    const displays = JSON.parse(raw);
    if (opts.json) jsonOut(displays);
    else {
      for (const d of displays) {
        const tag = d.main ? " (main)" : "";
        console.log(`Display ${d.id}: ${d.width}x${d.height} at (${d.x},${d.y})${tag}`);
      }
    }
  });

display
  .command("active-window")
  .description("Get the frontmost application name and window title.")
  .option("--json", "output as JSON")
  .action((opts: { json?: boolean }) => {
    ensureMac();
    const app = osascript(
      `tell application "System Events" to get name of first application process whose frontmost is true`
    );
    let title = "";
    try {
      title = osascript(
        `tell application "System Events"\ntry\nreturn name of front window of first application process whose frontmost is true\non error\nreturn ""\nend try\nend tell`
      );
    } catch {}
    const data = { app, title };
    if (opts.json) jsonOut(data);
    else {
      console.log(`app: ${data.app}`);
      if (data.title) console.log(`title: ${data.title}`);
    }
  });
