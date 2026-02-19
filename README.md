<div align="center">

<img src="assets/hero.jpg" alt="mctrl" width="700" />

# mctrl

**Fine-grained macOS control from the command line.**

Built for AI agents. Works for humans.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![macOS](https://img.shields.io/badge/platform-macOS-lightgrey)](https://www.apple.com/macos/)

</div>

---

`mctrl` gives you programmatic control over every layer of macOS through a single CLI. Keyboard, mouse, screen, windows, accessibility, browser, files, calendar, contacts, mail, messages — each exposed as a composable subcommand with structured output.

An agent runs `mctrl --help`, sees everything it can do. Runs `mctrl keyboard --help`, learns how to type. Every action is one command. Every response is parseable.

## Install

```bash
npm install -g mctrl
```

Requires Node.js >= 18 and macOS. Some commands need Python 3 (pre-installed on macOS) for CoreGraphics/Quartz bindings.

### Permissions

Grant **Accessibility** access to your terminal app and `/usr/bin/osascript` in:

> System Settings → Privacy & Security → Accessibility

This unlocks window management, UI inspection, and keyboard/mouse simulation.

## Primitives

```
mctrl <primitive> <action> [options]
```

| Primitive | What it controls | Key actions |
|-----------|-----------------|-------------|
| **keyboard** | Keystroke simulation | `type` `press` `hotkey` `down` `up` |
| **mouse** | Cursor and clicks | `move` `click` `double-click` `right-click` `scroll` `drag` `position` |
| **display** | Screen capture and info | `screenshot` `size` `center` `info` `active-window` |
| **clipboard** | System pasteboard | `view` `copy` `paste` |
| **screen** | OCR and recording | `ocr` `record` |
| **window** | Window management | `list` `focus` `resize` `move` `minimize` `fullscreen` |
| **a11y** | Accessibility tree | `tree` `focused` `children` |
| **browser** | Chrome/Safari control | `open` `tabs` `current-url` `current-title` `js` `page-source` |
| **files** | Filesystem operations | `search` `read` `write` `edit` `list` |
| **os** | System-level actions | `notify` `open-app` `quit-app` `frontmost-app` `list-apps` `open-url` `get-selected-text` |
| **calendar** | Calendar.app | `list` `create` `delete` |
| **contacts** | Contacts.app | `phone` `email` `search` |
| **mail** | Mail.app | `inbox` `send` `unread-count` |
| **sms** | Messages.app | `send` `get` |

## Usage

### See what's on screen

```bash
# Screenshot
mctrl display screenshot -o /tmp/screen.png

# Read all text from the screen (native macOS Vision OCR)
mctrl screen ocr

# Inspect the UI element tree (no vision needed)
mctrl a11y tree --app "Google Chrome" --depth 4

# What app is in front?
mctrl os frontmost-app
```

### Interact with the UI

```bash
# Click, type, hotkey
mctrl mouse click --x 500 --y 300
mctrl keyboard type "Hello, world!"
mctrl keyboard hotkey command c

# Scroll, drag
mctrl mouse scroll -- -5
mctrl mouse drag --from-x 100 --from-y 100 --to-x 500 --to-y 500
```

### Manage windows

```bash
mctrl window list --json
mctrl window focus "Google Chrome"
mctrl window resize --width 1200 --height 800
mctrl window move --x 0 --y 0
```

### Control the browser

```bash
mctrl browser open "https://example.com"
mctrl browser tabs --json
mctrl browser js "document.title"
mctrl browser page-source
```

### Work with macOS apps

```bash
# Calendar
mctrl calendar list --from 2025-03-01 --to 2025-03-07 --json
mctrl calendar create "Standup" --start 2025-03-01T09:00 --end 2025-03-01T09:30

# Mail
mctrl mail inbox --unread --limit 10 --json
mctrl mail send --to "you@example.com" --subject "Hi" --body "Hello from mctrl"

# Messages
mctrl sms get --contact "+15551234567" --json

# Contacts
mctrl contacts phone "John Doe"
```

## For Agents

mctrl is designed so an AI agent can discover and use it with zero prior knowledge:

1. **Run `mctrl --help`** — sees all 14 primitives with descriptions
2. **Run `mctrl <primitive> --help`** — sees all actions with examples  
3. **Run `mctrl <primitive> <action> --help`** — sees every option

Every command that returns data supports `--json` for structured output. The observe-act-verify loop looks like:

```bash
# 1. Observe
mctrl display screenshot -o /tmp/s.png
mctrl screen ocr --file /tmp/s.png

# 2. Act
mctrl mouse click --x 400 --y 300
mctrl keyboard type "search query"
mctrl keyboard press return

# 3. Verify
mctrl browser current-url
mctrl screen ocr
```

## Architecture

```
mctrl
├── keyboard     → AppleScript (System Events keystroke/key code)
├── mouse        → Python/Quartz (CGEventCreateMouseEvent)
├── display      → screencapture + Python/Quartz (CGDisplayBounds)
├── clipboard    → pbcopy/pbpaste
├── screen       → Swift (Vision framework VNRecognizeTextRequest)
├── window       → Python/Quartz (CGWindowListCopyWindowInfo) + AppleScript
├── a11y         → Swift (AXUIElement API)
├── browser      → AppleScript (Chrome/Safari scripting)
├── files        → Node.js fs + ripgrep
├── os           → AppleScript + open(1)
├── calendar     → AppleScript (Calendar.app)
├── contacts     → AppleScript (Contacts.app)
├── mail         → AppleScript (Mail.app)
└── sms          → AppleScript (Messages.app) + sqlite3 (chat.db)
```

Each primitive uses the most reliable macOS API for the job. No Electron. No heavyweight dependencies. Just the OS.

## Development

```bash
git clone https://github.com/enoreyes/mctrl.git
cd mctrl
npm install
npm run dev -- --help          # run from source
npm run build                  # build to dist/
npm run lint                   # typecheck
```

## License

[MIT](LICENSE)
