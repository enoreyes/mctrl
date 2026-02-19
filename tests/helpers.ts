import { execSync } from "node:child_process";

export function mctrl(args: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(`npx tsx src/cli.ts ${args}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 20_000,
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
    });
    return { stdout: stdout.trim(), stderr: "", code: 0 };
  } catch (e: any) {
    return {
      stdout: (e.stdout ?? "").trim(),
      stderr: (e.stderr ?? "").trim(),
      code: e.status ?? 1,
    };
  }
}

export function isMac(): boolean {
  return process.platform === "darwin";
}
