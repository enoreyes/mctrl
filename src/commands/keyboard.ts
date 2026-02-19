import { Command } from "commander";
import { execSync } from "node:child_process";
import { osascript, ensureMac } from "../util/run.js";

export const keyboard = new Command("keyboard")
  .description(
    `Type text, press keys, and trigger hotkeys.

Examples:
  mctrl keyboard type "Hello, world!"
  mctrl keyboard press return
  mctrl keyboard hotkey command c
  mctrl keyboard down shift`
  );

keyboard
  .command("type")
  .description("Type a string of text using simulated keystrokes.")
  .argument("<text>", "text to type")
  .option("--delay <ms>", "milliseconds between characters", "0")
  .action((text: string, opts: { delay: string }) => {
    ensureMac();
    const delay = parseInt(opts.delay);
    if (delay > 0) {
      for (const ch of text) {
        const escaped = ch.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        osascript(
          `tell application "System Events" to keystroke "${escaped}"`
        );
        if (delay > 0) {
          execSync(`sleep ${delay / 1000}`);
        }
      }
    } else {
      const escaped = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      osascript(
        `tell application "System Events" to keystroke "${escaped}"`
      );
    }
  });

keyboard
  .command("press")
  .description(
    `Press a key by name. Common keys: return, tab, space, delete, escape,
left arrow, right arrow, up arrow, down arrow, f1-f12.`
  )
  .argument("<key>", "key name to press")
  .option("--count <n>", "number of times to press", "1")
  .action((key: string, opts: { count: string }) => {
    ensureMac();
    const count = parseInt(opts.count);
    const keycode = mapKeyName(key);
    for (let i = 0; i < count; i++) {
      osascript(
        `tell application "System Events" to key code ${keycode}`
      );
    }
  });

keyboard
  .command("hotkey")
  .description(
    `Press a key combination. List modifiers then the key.

Examples:
  mctrl keyboard hotkey command c
  mctrl keyboard hotkey command shift z
  mctrl keyboard hotkey control option delete`
  )
  .argument("<keys...>", "modifier(s) followed by a key")
  .action((keys: string[]) => {
    ensureMac();
    if (keys.length < 2) {
      console.error("Error: hotkey needs at least a modifier and a key.");
      process.exit(1);
    }
    const key = keys[keys.length - 1];
    const mods = keys.slice(0, -1);

    const modFlags = mods
      .map((m) => {
        const flag = modifierToApplescript(m);
        if (!flag) {
          console.error(`Unknown modifier: ${m}`);
          process.exit(1);
        }
        return flag;
      })
      .join(", ");

    const keyExpr = resolveKeystroke(key);
    osascript(
      `tell application "System Events" to ${keyExpr} using {${modFlags}}`
    );
  });

keyboard
  .command("down")
  .description("Hold a key down until explicitly released.")
  .argument("<key>", "key to hold")
  .action((key: string) => {
    ensureMac();
    const code = mapKeyName(key);
    osascript(
      `tell application "System Events" to key down ${code}`
    );
  });

keyboard
  .command("up")
  .description("Release a previously held key.")
  .argument("<key>", "key to release")
  .action((key: string) => {
    ensureMac();
    const code = mapKeyName(key);
    osascript(
      `tell application "System Events" to key up ${code}`
    );
  });

function modifierToApplescript(mod: string): string | null {
  const table: Record<string, string> = {
    command: "command down",
    cmd: "command down",
    shift: "shift down",
    option: "option down",
    alt: "option down",
    control: "control down",
    ctrl: "control down",
    fn: "fn down",
  };
  return table[mod.toLowerCase()] ?? null;
}

function resolveKeystroke(key: string): string {
  const specials: Record<string, number> = {
    return: 36, enter: 76, tab: 48, space: 49, delete: 51, escape: 53,
    up: 126, down: 125, left: 123, right: 124,
    f1: 122, f2: 120, f3: 99, f4: 118, f5: 96, f6: 97,
    f7: 98, f8: 100, f9: 101, f10: 109, f11: 103, f12: 111,
    home: 115, end: 119, pageup: 116, pagedown: 121,
    forwarddelete: 117,
  };
  const code = specials[key.toLowerCase()];
  if (code !== undefined) {
    return `key code ${code}`;
  }
  const escaped = key.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `keystroke "${escaped}"`;
}

function mapKeyName(key: string): number {
  const table: Record<string, number> = {
    return: 36, enter: 76, tab: 48, space: 49, delete: 51, escape: 53,
    up: 126, down: 125, left: 123, right: 124,
    f1: 122, f2: 120, f3: 99, f4: 118, f5: 96, f6: 97,
    f7: 98, f8: 100, f9: 101, f10: 109, f11: 103, f12: 111,
    home: 115, end: 119, pageup: 116, pagedown: 121,
    forwarddelete: 117,
    a: 0, b: 11, c: 8, d: 2, e: 14, f: 3, g: 5, h: 4, i: 34, j: 38,
    k: 40, l: 37, m: 46, n: 45, o: 31, p: 35, q: 12, r: 15, s: 1,
    t: 17, u: 32, v: 9, w: 13, x: 7, y: 16, z: 6,
  };
  const code = table[key.toLowerCase()];
  if (code === undefined) {
    console.error(`Unknown key: ${key}`);
    process.exit(1);
  }
  return code;
}
