import { Command } from "commander";
import { ensureMac, osascript, jsonOut } from "../util/run.js";

export const contacts = new Command("contacts")
  .description(
    `Look up contacts from macOS Contacts.app.

Examples:
  mctrl contacts phone "John Doe"
  mctrl contacts email "Jane Smith"
  mctrl contacts search "John"`
  );

contacts
  .command("phone")
  .description("Look up a contact's phone number by full name.")
  .argument("<name>", "full name of the contact")
  .action((name: string) => {
    ensureMac();
    const result = osascript(`
tell application "Contacts"
  set entry to first person whose name is "${name}"
  return value of first phone of entry
end tell`);
    console.log(result);
  });

contacts
  .command("email")
  .description("Look up a contact's email address by full name.")
  .argument("<name>", "full name of the contact")
  .action((name: string) => {
    ensureMac();
    const result = osascript(`
tell application "Contacts"
  set entry to first person whose name is "${name}"
  return value of first email of entry
end tell`);
    console.log(result);
  });

contacts
  .command("search")
  .description("Find contacts whose name contains a string.")
  .argument("<query>", "name to search for")
  .option("--json", "output as JSON")
  .action((query: string, opts: { json?: boolean }) => {
    ensureMac();
    const raw = osascript(`
tell application "Contacts"
  set results to every person whose name contains "${query}"
  set nameLines to {}
  repeat with entry in results
    set end of nameLines to name of entry
  end repeat
  set AppleScript's text item delimiters to linefeed
  return nameLines as text
end tell`);
    const names = raw.split("\n").filter(Boolean);
    if (opts.json) jsonOut(names);
    else names.forEach((n) => console.log(n));
  });
