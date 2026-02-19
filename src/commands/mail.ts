import { Command } from "commander";
import { ensureMac, osascript, jsonOut } from "../util/run.js";

export const mail = new Command("mail")
  .description(
    `Read and send email via macOS Mail.app.

Examples:
  mctrl mail inbox
  mctrl mail inbox --unread --limit 10
  mctrl mail send --to "user@example.com" --subject "Hi" --body "Hello"
  mctrl mail unread-count`
  );

mail
  .command("inbox")
  .description("List recent inbox messages.")
  .option("--limit <n>", "number of messages (max 50)", parseInt, 5)
  .option("--unread", "only show unread messages")
  .option("--json", "output as JSON")
  .action((opts: { limit: number; unread?: boolean; json?: boolean }) => {
    ensureMac();
    const cap = Math.min(opts.limit, 50);
    const filter = opts.unread ? " whose read status is false" : "";
    const raw = osascript(`
tell application "Mail"
  set msgs to (messages of inbox${filter})
  set n to count of msgs
  if n > ${cap} then set n to ${cap}
  set out to ""
  repeat with i from 1 to n
    set m to item i of msgs
    set out to out & (sender of m) & "|||" & (subject of m) & "|||" & (date received of m as string) & "|||" & (read status of m as string) & linefeed
  end repeat
  return out
end tell`);
    if (!raw) {
      if (opts.json) console.log("[]");
      else console.log("No messages found.");
      return;
    }
    const messages = raw.split("\n").filter(Boolean).map((line) => {
      const [from, subject, date, read] = line.split("|||");
      return { from, subject, date, read: read === "true" };
    });
    if (opts.json) jsonOut(messages);
    else {
      for (const m of messages) {
        const tag = m.read ? "" : " [UNREAD]";
        console.log(`  From: ${m.from}`);
        console.log(`  Subject: ${m.subject}${tag}`);
        console.log(`  Date: ${m.date}\n`);
      }
    }
  });

mail
  .command("send")
  .description("Send an email via Mail.app.")
  .requiredOption("--to <addr>", "recipient email")
  .requiredOption("--subject <text>", "email subject")
  .requiredOption("--body <text>", "email body")
  .option("--attachment <path...>", "file path(s) to attach")
  .action((opts: { to: string; subject: string; body: string; attachment?: string[] }) => {
    ensureMac();
    const attachLines = (opts.attachment ?? [])
      .map((p) => `tell content of msg\nmake new attachment with properties {file name:POSIX file "${p}"} at after last paragraph\nend tell\ndelay 2`)
      .join("\n");
    osascript(`
tell application "Mail"
  set msg to make new outgoing message with properties {subject:"${opts.subject}", content:"${opts.body}", visible:true}
  tell msg
    make new to recipient at end of to recipients with properties {address:"${opts.to}"}
  end tell
  ${attachLines}
  send msg
end tell`);
    console.log(`Sent to ${opts.to}: ${opts.subject}`);
  });

mail
  .command("unread-count")
  .description("Print the number of unread inbox messages.")
  .action(() => {
    ensureMac();
    const count = osascript(`
tell application "Mail"
  set n to count of (messages of inbox whose read status is false)
  if n > 50 then set n to 50
  return n
end tell`);
    console.log(count);
  });
