import { Command } from "commander";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { ensureMac, osascript, jsonOut } from "../util/run.js";

const MSG_DB = join(homedir(), "Library", "Messages", "chat.db");

export const sms = new Command("sms")
  .description(
    `Send and read iMessages (macOS Messages.app).

Examples:
  mctrl sms send "+15551234567" "Hello!"
  mctrl sms get --limit 10
  mctrl sms get --contact "+15551234567"`
  );

sms
  .command("send")
  .description("Send an iMessage.")
  .argument("<to>", "phone number or email")
  .argument("<message>", "message text")
  .action((to: string, message: string) => {
    ensureMac();
    const escaped = message.replace(/"/g, '\\"');
    osascript(`
tell application "Messages"
  send "${escaped}" to participant "${to}" of account 1
end tell`);
    console.log(`Sent to ${to}`);
  });

sms
  .command("get")
  .description("Read recent messages from the local iMessage database.")
  .option("--contact <id>", "filter by phone/email")
  .option("--limit <n>", "number of messages", parseInt, 10)
  .option("--search <text>", "filter by message text")
  .option("--json", "output as JSON")
  .action((opts: { contact?: string; limit: number; search?: string; json?: boolean }) => {
    ensureMac();
    if (!existsSync(MSG_DB)) {
      console.error("Error: iMessage database not found. Grant Full Disk Access to your terminal.");
      process.exit(1);
    }

    // Build query with parameterized-style filtering via sqlite3 CLI
    let where = "msg.text IS NOT NULL";
    if (opts.contact) where += ` AND hdl.id = '${opts.contact.replace(/'/g, "''")}'`;
    if (opts.search) where += ` AND msg.text LIKE '%${opts.search.replace(/'/g, "''")}%'`;

    const sql = `
SELECT msg.text, msg.date / 1000000000 + 978307200 AS unix_ts, msg.is_from_me, COALESCE(hdl.id, '') AS sender
FROM message msg
LEFT OUTER JOIN handle hdl ON msg.handle_id = hdl.rowid
WHERE ${where}
ORDER BY msg.date DESC
LIMIT ${opts.limit};`;

    let raw: string;
    try {
      raw = execSync(`sqlite3 -separator '|||' "${MSG_DB}" ${JSON.stringify(sql)}`, {
        encoding: "utf-8",
      }).trim();
    } catch (e) {
      console.error("Error: cannot read iMessage database. Ensure Full Disk Access is granted.");
      process.exit(1);
    }

    if (!raw) {
      if (opts.json) console.log("[]");
      else console.log("No messages found.");
      return;
    }

    const messages = raw.split("\n").filter(Boolean).map((line) => {
      const [text, tsStr, fromMe, sender] = line.split("|||");
      const ts = parseInt(tsStr);
      return {
        text,
        date: isNaN(ts) ? "" : new Date(ts * 1000).toISOString(),
        from_me: fromMe === "1",
        contact: sender,
      };
    });

    if (opts.json) jsonOut(messages);
    else {
      for (const m of messages) {
        const dir = m.from_me ? ">>>" : "<<<";
        console.log(`  ${dir} [${m.contact}] ${m.date}`);
        console.log(`      ${m.text}\n`);
      }
    }
  });
