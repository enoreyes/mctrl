#!/usr/bin/env node
import { Command } from "commander";
import { keyboard } from "./commands/keyboard.js";
import { mouse } from "./commands/mouse.js";
import { display } from "./commands/display.js";
import { clipboard } from "./commands/clipboard.js";
import { screen } from "./commands/screen.js";
import { window } from "./commands/window.js";
import { a11y } from "./commands/a11y.js";
import { browser } from "./commands/browser.js";
import { os } from "./commands/os.js";
import { calendar } from "./commands/calendar.js";
import { contacts } from "./commands/contacts.js";
import { mail } from "./commands/mail.js";
import { sms } from "./commands/sms.js";
import { files } from "./commands/files.js";

const program = new Command()
  .name("mctrl")
  .version("0.1.0")
  .description(
    `mctrl — fine-grained macOS control from the command line.

Built for AI agents and automation. Every subcommand has its own --help.

PRIMITIVES:
  keyboard    Type text, press keys, trigger hotkeys (Cmd+C, etc.)
  mouse       Move, click, scroll, drag the mouse cursor
  display     Screenshots, screen dimensions, monitor info
  clipboard   Copy/paste text, read clipboard contents
  screen      OCR (read text from screen), screen recording
  window      List/focus/resize/move/minimize application windows
  a11y        Read the accessibility tree, inspect UI elements
  browser     Open URLs, list tabs, execute JS, get page source
  files       Search, read, write, edit files on disk
  os          Notifications, app launch/quit, frontmost app
  calendar    List/create/delete calendar events (Calendar.app)
  contacts    Look up phone numbers and emails (Contacts.app)
  mail        Read inbox, send email, check unread (Mail.app)
  sms         Send/read iMessages (Messages.app)

USAGE:
  mctrl <command> --help           detailed usage for a primitive
  mctrl <command> <sub> --help     options and examples for an action
  Most commands support --json for structured output.`
  );

program.addCommand(keyboard);
program.addCommand(mouse);
program.addCommand(display);
program.addCommand(clipboard);
program.addCommand(screen);
program.addCommand(window);
program.addCommand(a11y);
program.addCommand(browser);
program.addCommand(os);
program.addCommand(calendar);
program.addCommand(contacts);
program.addCommand(mail);
program.addCommand(sms);
program.addCommand(files);

program.parse();
