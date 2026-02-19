import { Command } from "commander";
import { ensureMac, swift, osascript, jsonOut } from "../util/run.js";

export const a11y = new Command("a11y")
  .description(
    `Accessibility: inspect UI elements, read the AX tree, get focused element.

Examples:
  mctrl a11y tree
  mctrl a11y tree --app Finder --depth 4
  mctrl a11y focused
  mctrl a11y children --role AXButton`
  );

a11y
  .command("tree")
  .description("Print the accessibility element tree of an application.")
  .option("--depth <n>", "max depth to traverse", parseInt, 3)
  .option("--app <name>", "target app (default: frontmost)")
  .action((opts: { depth: number; app?: string }) => {
    ensureMac();
    const appArg = opts.app ? `"${opts.app}"` : "nil";
    const output = swift(`
import Cocoa
import ApplicationServices

func attr(_ e: AXUIElement, _ a: String) -> String? {
    var v: AnyObject?
    guard AXUIElementCopyAttributeValue(e, a as CFString, &v) == .success else { return nil }
    if let s = v as? String { return s }
    if let n = v as? NSNumber { return n.stringValue }
    return nil
}

func kids(_ e: AXUIElement) -> [AXUIElement] {
    var v: AnyObject?
    guard AXUIElementCopyAttributeValue(e, kAXChildrenAttribute as String as CFString, &v) == .success,
          let a = v as? [AXUIElement] else { return [] }
    return a
}

func dump(_ e: AXUIElement, _ pre: String, _ max: Int) {
    guard max > 0 else { return }
    let r = attr(e, kAXRoleAttribute as String) ?? "?"
    let t = attr(e, kAXTitleAttribute as String)
    let v = attr(e, kAXValueAttribute as String)
    let rd = attr(e, kAXRoleDescriptionAttribute as String)
    let d = attr(e, kAXDescriptionAttribute as String)
    var ln = pre + r
    if let t = t, !t.isEmpty { ln += " \\"\\(t)\\"" }
    if let rd = rd, !rd.isEmpty { ln += " [\\(rd)]" }
    if let v = v, !v.isEmpty, v.count < 80 { ln += " = \\(v)" }
    if let d = d, !d.isEmpty { ln += " (\\(d))" }
    print(ln)
    for c in kids(e) { dump(c, pre + "  ", max - 1) }
}

let target: String? = ${appArg}
let app: NSRunningApplication? = target != nil
    ? NSWorkspace.shared.runningApplications.first { $0.localizedName == target }
    : NSWorkspace.shared.frontmostApplication
guard let a = app else { fputs("App not found\\n", stderr); exit(1) }
let ax = AXUIElementCreateApplication(a.processIdentifier)
var ws: AnyObject?
AXUIElementCopyAttributeValue(ax, kAXWindowsAttribute as String as CFString, &ws)
if let wins = ws as? [AXUIElement] { for w in wins { dump(w, "", ${opts.depth}) } }
else { dump(ax, "", ${opts.depth}) }
`);
    if (output) console.log(output);
    else console.log("No accessibility elements found.");
  });

a11y
  .command("focused")
  .description("Get the currently focused UI element.")
  .option("--json", "output as JSON")
  .action((opts: { json?: boolean }) => {
    ensureMac();
    try {
      const raw = swift(`
import Cocoa
import ApplicationServices

func attr(_ e: AXUIElement, _ a: String) -> String? {
    var v: AnyObject?
    guard AXUIElementCopyAttributeValue(e, a as CFString, &v) == .success else { return nil }
    if let s = v as? String { return s }
    if let n = v as? NSNumber { return n.stringValue }
    return nil
}

guard let app = NSWorkspace.shared.frontmostApplication else { exit(1) }
let ax = AXUIElementCreateApplication(app.processIdentifier)
var focusedValue: AnyObject?
let err = AXUIElementCopyAttributeValue(ax, kAXFocusedUIElementAttribute as String as CFString, &focusedValue)
guard err == .success, let focused = focusedValue else {
    print("No focused element found.")
    exit(0)
}
let fe = focused as! AXUIElement
let role = attr(fe, kAXRoleAttribute as String) ?? ""
let title = attr(fe, kAXTitleAttribute as String) ?? ""
let value = attr(fe, kAXValueAttribute as String) ?? ""
let desc = attr(fe, kAXDescriptionAttribute as String) ?? ""
let rd = attr(fe, kAXRoleDescriptionAttribute as String) ?? ""
print("\\(role)|||\\(title)|||\\(value)|||\\(desc)|||\\(rd)")
`);
      if (raw.startsWith("No focused")) {
        console.log(raw);
        return;
      }
      const [role, title, value, desc, roleDesc] = raw.split("|||");
      const data = { role, title, value, description: desc, roleDescription: roleDesc };
      if (opts.json) jsonOut(data);
      else {
        for (const [k, v] of Object.entries(data)) {
          if (v) console.log(`${k}: ${v}`);
        }
      }
    } catch {
      console.log("No focused element found.");
    }
  });

a11y
  .command("children")
  .description("List top-level UI elements of the frontmost window.")
  .option("--role <role>", "filter by AX role (e.g. AXButton, AXTextField)")
  .option("--app <name>", "target app (default: frontmost)")
  .option("--json", "output as JSON")
  .action((opts: { role?: string; app?: string; json?: boolean }) => {
    ensureMac();
    const target = opts.app
      ? `application process "${opts.app}"`
      : `first application process whose frontmost is true`;
    const filter = opts.role ? ` whose role is "${opts.role}"` : "";
    const raw = osascript(`
set out to ""
tell application "System Events"
  set w to front window of ${target}
  repeat with e in (UI elements of w${filter})
    set r to role of e
    set t to ""
    try
      set t to title of e
    end try
    set d to ""
    try
      set d to description of e
    end try
    set out to out & r & "|||" & t & "|||" & d & linefeed
  end repeat
end tell
return out`);
    if (!raw) {
      if (opts.json) console.log("[]");
      else console.log("No elements found.");
      return;
    }
    const elems = raw.split("\n").filter(Boolean).map((line) => {
      const [role, title, desc] = line.split("|||");
      return { role, title, description: desc };
    });
    if (opts.json) jsonOut(elems);
    else {
      for (const e of elems) {
        let line = `  ${e.role}`;
        if (e.title) line += ` "${e.title}"`;
        if (e.description) line += ` (${e.description})`;
        console.log(line);
      }
    }
  });
