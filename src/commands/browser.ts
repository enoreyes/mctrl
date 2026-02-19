import { Command } from "commander";
import { execSync } from "node:child_process";
import { ensureMac, osascript, jsonOut } from "../util/run.js";

export const browser = new Command("browser")
  .description(
    `Control web browsers: open URLs, list tabs, execute JS, get page source.

Examples:
  mctrl browser open "https://example.com"
  mctrl browser tabs
  mctrl browser current-url
  mctrl browser js "document.title"`
  );

function chromeScript(body: string): string {
  return `tell application "Google Chrome"\n${body}\nend tell`;
}
function safariScript(body: string): string {
  return `tell application "Safari"\n${body}\nend tell`;
}
function forBrowser(app: string, chrome: string, safari: string): string {
  return app.toLowerCase().includes("chrome")
    ? chromeScript(chrome)
    : safariScript(safari);
}

browser
  .command("open")
  .description("Open a URL in a browser.")
  .argument("<url>", "URL to open")
  .option("--app <name>", "browser app name", "Google Chrome")
  .action((url: string, opts: { app: string }) => {
    ensureMac();
    if (opts.app.toLowerCase().includes("chrome")) {
      execSync(`open -a "Google Chrome" "${url}"`);
    } else if (opts.app.toLowerCase().includes("safari")) {
      execSync(`open -a Safari "${url}"`);
    } else {
      execSync(`open "${url}"`);
    }
    console.log(`Opened: ${url}`);
  });

browser
  .command("tabs")
  .description("List all open browser tabs.")
  .option("--app <name>", "browser app", "Google Chrome")
  .option("--json", "output as JSON")
  .action((opts: { app: string; json?: boolean }) => {
    ensureMac();
    const script = forBrowser(
      opts.app,
      `set out to ""
repeat with w in windows
  repeat with t in tabs of w
    set out to out & (title of t) & "|||" & (URL of t) & linefeed
  end repeat
end repeat
return out`,
      `set out to ""
repeat with w in windows
  repeat with t in tabs of w
    set out to out & (name of t) & "|||" & (URL of t) & linefeed
  end repeat
end repeat
return out`
    );
    const raw = osascript(script);
    if (!raw) {
      if (opts.json) console.log("[]");
      else console.log("No tabs found.");
      return;
    }
    const tabs = raw.split("\n").filter(Boolean).map((line, i) => {
      const [title, url] = line.split("|||");
      return { index: i, title, url };
    });
    if (opts.json) jsonOut(tabs);
    else {
      for (const t of tabs) console.log(`  [${t.index}] ${t.title}\n      ${t.url}`);
    }
  });

browser
  .command("current-url")
  .description("Get the URL of the active tab.")
  .option("--app <name>", "browser app", "Google Chrome")
  .action((opts: { app: string }) => {
    ensureMac();
    const script = forBrowser(
      opts.app,
      `return URL of active tab of front window`,
      `return URL of front document`
    );
    console.log(osascript(script));
  });

browser
  .command("current-title")
  .description("Get the title of the active tab.")
  .option("--app <name>", "browser app", "Google Chrome")
  .action((opts: { app: string }) => {
    ensureMac();
    const script = forBrowser(
      opts.app,
      `return title of active tab of front window`,
      `return name of front document`
    );
    console.log(osascript(script));
  });

browser
  .command("js")
  .description("Execute JavaScript in the active browser tab.")
  .argument("<code>", "JavaScript code to execute")
  .option("--app <name>", "browser app", "Google Chrome")
  .action((code: string, opts: { app: string }) => {
    ensureMac();
    const escaped = code.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const script = forBrowser(
      opts.app,
      `return execute active tab of front window javascript "${escaped}"`,
      `return do JavaScript "${escaped}" in front document`
    );
    console.log(osascript(script));
  });

browser
  .command("page-source")
  .description("Get the HTML source of the active tab.")
  .option("--app <name>", "browser app", "Google Chrome")
  .action((opts: { app: string }) => {
    ensureMac();
    const script = forBrowser(
      opts.app,
      `return execute active tab of front window javascript "document.documentElement.outerHTML"`,
      `return do JavaScript "document.documentElement.outerHTML" in front document`
    );
    console.log(osascript(script));
  });
