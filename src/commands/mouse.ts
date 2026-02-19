import { Command } from "commander";
import { ensureMac, jsonOut, py } from "../util/run.js";
import { execSync } from "node:child_process";

export const mouse = new Command("mouse")
  .description(
    `Move, click, scroll, and drag the mouse cursor.

Examples:
  mctrl mouse move --x 500 --y 300
  mctrl mouse click --x 500 --y 300
  mctrl mouse scroll -- -3
  mctrl mouse drag --from-x 100 --from-y 100 --to-x 500 --to-y 500`
  );

function cursorPos(): { x: number; y: number } {
  const out = py(
    "import Quartz; loc = Quartz.NSEvent.mouseLocation(); h = Quartz.CGDisplayPixelsHigh(Quartz.CGMainDisplayID()); print(f'{int(loc.x)},{int(h - loc.y)}')"
  );
  const [x, y] = out.split(",").map(Number);
  return { x, y };
}

function moveTo(x: number, y: number): void {
  py(`import Quartz; Quartz.CGWarpMouseCursorPosition((${x}, ${y}))`);
}

function clickAt(x: number | null, y: number | null, opts: { button?: string; clicks?: number } = {}): void {
  const pos = x !== null && y !== null ? { x, y } : cursorPos();
  const btn = opts.button === "right" ? "Quartz.kCGMouseButtonRight" : "Quartz.kCGMouseButtonLeft";
  const downEvt = opts.button === "right" ? "Quartz.kCGEventRightMouseDown" : "Quartz.kCGEventLeftMouseDown";
  const upEvt = opts.button === "right" ? "Quartz.kCGEventRightMouseUp" : "Quartz.kCGEventLeftMouseUp";
  const clicks = opts.clicks ?? 1;
  py(`
import Quartz, time
pt = (${pos.x}, ${pos.y})
for i in range(${clicks}):
    down = Quartz.CGEventCreateMouseEvent(None, ${downEvt}, pt, ${btn})
    Quartz.CGEventSetIntegerValueField(down, Quartz.kCGMouseEventClickState, i + 1)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, down)
    time.sleep(0.02)
    up = Quartz.CGEventCreateMouseEvent(None, ${upEvt}, pt, ${btn})
    Quartz.CGEventSetIntegerValueField(up, Quartz.kCGMouseEventClickState, i + 1)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, up)
    time.sleep(0.05)
  `);
}

mouse
  .command("position")
  .description("Print the current mouse cursor position.")
  .option("--json", "output as JSON")
  .action((opts: { json?: boolean }) => {
    ensureMac();
    const pos = cursorPos();
    if (opts.json) jsonOut(pos);
    else console.log(`${pos.x},${pos.y}`);
  });

mouse
  .command("move")
  .description("Move the mouse cursor to screen coordinates.")
  .requiredOption("--x <n>", "X coordinate", parseInt)
  .requiredOption("--y <n>", "Y coordinate", parseInt)
  .action((opts: { x: number; y: number }) => {
    ensureMac();
    moveTo(opts.x, opts.y);
  });

mouse
  .command("click")
  .description("Click at coordinates (current position if omitted).")
  .option("--x <n>", "X coordinate", parseInt)
  .option("--y <n>", "Y coordinate", parseInt)
  .option("--button <btn>", "left, middle, or right", "left")
  .option("--clicks <n>", "number of clicks", parseInt, 1)
  .action((opts: { x?: number; y?: number; button: string; clicks: number }) => {
    ensureMac();
    clickAt(opts.x ?? null, opts.y ?? null, { button: opts.button, clicks: opts.clicks });
  });

mouse
  .command("double-click")
  .description("Double-click at coordinates.")
  .option("--x <n>", "X coordinate", parseInt)
  .option("--y <n>", "Y coordinate", parseInt)
  .action((opts: { x?: number; y?: number }) => {
    ensureMac();
    clickAt(opts.x ?? null, opts.y ?? null, { clicks: 2 });
  });

mouse
  .command("triple-click")
  .description("Triple-click at coordinates.")
  .option("--x <n>", "X coordinate", parseInt)
  .option("--y <n>", "Y coordinate", parseInt)
  .action((opts: { x?: number; y?: number }) => {
    ensureMac();
    clickAt(opts.x ?? null, opts.y ?? null, { clicks: 3 });
  });

mouse
  .command("right-click")
  .description("Right-click (context menu) at coordinates.")
  .option("--x <n>", "X coordinate", parseInt)
  .option("--y <n>", "Y coordinate", parseInt)
  .action((opts: { x?: number; y?: number }) => {
    ensureMac();
    clickAt(opts.x ?? null, opts.y ?? null, { button: "right" });
  });

mouse
  .command("scroll")
  .description("Scroll the mouse wheel. Positive = up, negative = down.")
  .argument("<amount>", "scroll amount", parseInt)
  .action((amount: number) => {
    ensureMac();
    py(
      `import Quartz; evt = Quartz.CGEventCreateScrollWheelEvent(None, Quartz.kCGScrollEventUnitLine, 1, ${amount}); Quartz.CGEventPost(Quartz.kCGHIDEventTap, evt)`
    );
  });

mouse
  .command("down")
  .description("Press the mouse button down (for drag operations).")
  .option("--button <btn>", "left or right", "left")
  .action((opts: { button: string }) => {
    ensureMac();
    const pos = cursorPos();
    const evt = opts.button === "right" ? "Quartz.kCGEventRightMouseDown" : "Quartz.kCGEventLeftMouseDown";
    const btn = opts.button === "right" ? "Quartz.kCGMouseButtonRight" : "Quartz.kCGMouseButtonLeft";
    py(
      `import Quartz; e = Quartz.CGEventCreateMouseEvent(None, ${evt}, (${pos.x}, ${pos.y}), ${btn}); Quartz.CGEventPost(Quartz.kCGHIDEventTap, e)`
    );
  });

mouse
  .command("up")
  .description("Release the mouse button.")
  .option("--button <btn>", "left or right", "left")
  .action((opts: { button: string }) => {
    ensureMac();
    const pos = cursorPos();
    const evt = opts.button === "right" ? "Quartz.kCGEventRightMouseUp" : "Quartz.kCGEventLeftMouseUp";
    const btn = opts.button === "right" ? "Quartz.kCGMouseButtonRight" : "Quartz.kCGMouseButtonLeft";
    py(
      `import Quartz; e = Quartz.CGEventCreateMouseEvent(None, ${evt}, (${pos.x}, ${pos.y}), ${btn}); Quartz.CGEventPost(Quartz.kCGHIDEventTap, e)`
    );
  });

mouse
  .command("drag")
  .description("Drag from one point to another.")
  .requiredOption("--from-x <n>", "start X", parseInt)
  .requiredOption("--from-y <n>", "start Y", parseInt)
  .requiredOption("--to-x <n>", "end X", parseInt)
  .requiredOption("--to-y <n>", "end Y", parseInt)
  .option("--duration <ms>", "drag duration in milliseconds", parseInt, 500)
  .action((opts: { fromX: number; fromY: number; toX: number; toY: number; duration: number }) => {
    ensureMac();
    const steps = Math.max(10, Math.floor(opts.duration / 16));
    py(`
import Quartz, time
sx, sy, ex, ey, n = ${opts.fromX}, ${opts.fromY}, ${opts.toX}, ${opts.toY}, ${steps}
Quartz.CGWarpMouseCursorPosition((sx, sy))
time.sleep(0.05)
d = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDown, (sx, sy), Quartz.kCGMouseButtonLeft)
Quartz.CGEventPost(Quartz.kCGHIDEventTap, d)
for i in range(1, n + 1):
    t = i / n
    x = sx + (ex - sx) * t
    y = sy + (ey - sy) * t
    m = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDragged, (x, y), Quartz.kCGMouseButtonLeft)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, m)
    time.sleep(${opts.duration / 1000} / n)
u = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseUp, (ex, ey), Quartz.kCGMouseButtonLeft)
Quartz.CGEventPost(Quartz.kCGHIDEventTap, u)
    `);
  });
