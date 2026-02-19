import { Command } from "commander";
import { ensureMac, osascript, jsonOut } from "../util/run.js";

export const calendar = new Command("calendar")
  .description(
    `Read and create calendar events (macOS Calendar.app).

Examples:
  mctrl calendar list
  mctrl calendar list --from 2025-03-01 --to 2025-03-07
  mctrl calendar create "Standup" --start 2025-03-01T09:00 --end 2025-03-01T09:30
  mctrl calendar delete "Standup" --date 2025-03-01`
  );

function dateSetScript(varName: string, iso: string): string {
  const d = new Date(iso);
  return `
set ${varName} to current date
set year of ${varName} to ${d.getFullYear()}
set month of ${varName} to ${d.getMonth() + 1}
set day of ${varName} to ${d.getDate()}
set hours of ${varName} to ${d.getHours()}
set minutes of ${varName} to ${d.getMinutes()}
set seconds of ${varName} to 0`;
}

calendar
  .command("list")
  .description("List calendar events for a date or range.")
  .option("--from <date>", "start date YYYY-MM-DD (default: today)")
  .option("--to <date>", "end date YYYY-MM-DD (default: same as --from)")
  .option("--json", "output as JSON")
  .action((opts: { from?: string; to?: string; json?: boolean }) => {
    ensureMac();
    const now = new Date();
    const fromStr = opts.from ?? now.toISOString().slice(0, 10);
    const toStr = opts.to ?? fromStr;
    const raw = osascript(`
${dateSetScript("sd", fromStr + "T00:00")}
${dateSetScript("ed", toStr + "T23:59")}
set out to ""
tell application "Calendar"
  repeat with c in calendars
    set evts to (every event of c whose start date >= sd and start date <= ed)
    repeat with ev in evts
      set out to out & (summary of ev) & "|||" & (start date of ev as string) & "|||" & (end date of ev as string) & "|||"
      try
        set out to out & (location of ev)
      end try
      set out to out & "|||" & (name of c) & linefeed
    end repeat
  end repeat
end tell
return out`);
    if (!raw) {
      if (opts.json) console.log("[]");
      else console.log("No events found.");
      return;
    }
    const events = raw.split("\n").filter(Boolean).map((line) => {
      const [title, start, end, location, cal] = line.split("|||");
      return { title, start, end, location: location || undefined, calendar: cal };
    });
    if (opts.json) jsonOut(events);
    else {
      for (const e of events) {
        console.log(`  ${e.title}`);
        console.log(`    ${e.start} - ${e.end}`);
        if (e.location) console.log(`    Location: ${e.location}`);
        console.log();
      }
    }
  });

calendar
  .command("create")
  .description("Create a new calendar event.")
  .argument("<title>", "event title")
  .requiredOption("--start <datetime>", "start (YYYY-MM-DDTHH:MM)")
  .requiredOption("--end <datetime>", "end (YYYY-MM-DDTHH:MM)")
  .option("--location <loc>", "location", "")
  .option("--notes <text>", "notes", "")
  .option("--calendar <name>", "calendar name (default: first)")
  .action((title: string, opts: { start: string; end: string; location: string; notes: string; calendar?: string }) => {
    ensureMac();
    const calRef = opts.calendar ? `calendar "${opts.calendar}"` : "first calendar";
    osascript(`
tell application "Calendar"
  ${dateSetScript("sd", opts.start)}
  ${dateSetScript("ed", opts.end)}
  tell ${calRef}
    make new event with properties {summary:"${title}", start date:sd, end date:ed, location:"${opts.location}", description:"${opts.notes}"}
  end tell
end tell`);
    console.log(`Created: ${title}`);
  });

calendar
  .command("delete")
  .description("Delete a calendar event by title and date.")
  .argument("<title>", "event title")
  .requiredOption("--date <date>", "date of the event (YYYY-MM-DD)")
  .option("--calendar <name>", "calendar name")
  .action((title: string, opts: { date: string; calendar?: string }) => {
    ensureMac();
    osascript(`
tell application "Calendar"
  ${dateSetScript("sd", opts.date + "T00:00")}
  ${dateSetScript("ed", opts.date + "T23:59")}
  repeat with c in calendars
    set evts to (every event of c whose summary is "${title}" and start date >= sd and start date <= ed)
    repeat with ev in evts
      delete ev
    end repeat
  end repeat
end tell`);
    console.log(`Deleted: ${title} on ${opts.date}`);
  });
