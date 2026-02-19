import { execSync, execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function osascript(script: string): string {
  try {
    return execFileSync("osascript", ["-e", script], {
      encoding: "utf-8",
      timeout: 15_000,
    }).trim();
  } catch (e: any) {
    const stderr = e?.stderr?.toString?.() ?? "";
    if (stderr.includes("Not authorized")) {
      console.error(`Error: macOS denied permission. Grant Automation access in System Settings > Privacy & Security > Automation.`);
      process.exit(1);
    }
    if (stderr.includes("not allowed assistive access")) {
      console.error(`Error: Accessibility access required. Grant it in System Settings > Privacy & Security > Accessibility.`);
      process.exit(1);
    }
    throw e;
  }
}

export function shell(cmd: string, args: string[] = []): string {
  return execFileSync(cmd, args, {
    encoding: "utf-8",
    timeout: 30_000,
  }).trim();
}

export function swift(code: string): string {
  const tmp = join(tmpdir(), `mctrl_${Date.now()}.swift`);
  writeFileSync(tmp, code);
  try {
    return execFileSync("swift", [tmp], {
      encoding: "utf-8",
      timeout: 20_000,
    }).trim();
  } finally {
    unlinkSync(tmp);
  }
}

export function py(code: string): string {
  if (code.includes("\n")) {
    const tmp = join(tmpdir(), `mctrl_${Date.now()}.py`);
    writeFileSync(tmp, code);
    try {
      return execFileSync("python3", [tmp], {
        encoding: "utf-8",
        timeout: 10_000,
      }).trim();
    } finally {
      unlinkSync(tmp);
    }
  }
  return execSync(`python3 -c ${JSON.stringify(code)}`, {
    encoding: "utf-8",
    timeout: 10_000,
  }).trim();
}

export function jsonOut(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function ensureMac(): void {
  if (process.platform !== "darwin") {
    console.error("Error: this command requires macOS.");
    process.exit(1);
  }
}
