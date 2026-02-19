"use client";

import { useState } from "react";

const PRIMITIVES = [
  {
    name: "Keyboard",
    desc: "Type text, press keys, and trigger hotkeys.",
    cmds: ['mctrl keyboard type "Hello world"', "mctrl keyboard hotkey cmd+c"],
  },
  {
    name: "Mouse",
    desc: "Move, click, scroll, and drag anywhere on screen.",
    cmds: ["mctrl mouse click 500 300", "mctrl mouse scroll -3"],
  },
  {
    name: "Display",
    desc: "Screen dimensions, screenshots, and active window info.",
    cmds: ["mctrl display screenshot -o shot.png", "mctrl display size --json"],
  },
  {
    name: "Clipboard",
    desc: "Read and write the system clipboard.",
    cmds: ['mctrl clipboard copy "data"', "mctrl clipboard view"],
  },
  {
    name: "Screen OCR",
    desc: "Extract text from the screen using the Vision framework.",
    cmds: ["mctrl screen ocr", "mctrl screen ocr --json"],
  },
  {
    name: "Windows",
    desc: "List, focus, resize, move, and minimize windows.",
    cmds: ["mctrl window list --json", 'mctrl window focus "Terminal"'],
  },
  {
    name: "Accessibility",
    desc: "Inspect the accessibility tree and get focused elements.",
    cmds: ["mctrl a11y tree --app Finder", "mctrl a11y focused --json"],
  },
  {
    name: "Browser",
    desc: "Control Chrome and Safari. Open URLs, run JS, read page source.",
    cmds: ['mctrl browser open "https://example.com"', "mctrl browser tabs"],
  },
  {
    name: "Files",
    desc: "Search, read, write, and edit files on disk.",
    cmds: ['mctrl files search "TODO" --dir .', "mctrl files read config.json"],
  },
  {
    name: "OS",
    desc: "Send notifications, launch apps, and get the frontmost app.",
    cmds: ['mctrl os notify "Done!"', "mctrl os frontmost-app --json"],
  },
  {
    name: "Calendar",
    desc: "List and create calendar events via Apple Calendar.",
    cmds: ["mctrl calendar list --days 7", 'mctrl calendar create "Meeting"'],
  },
  {
    name: "Mail",
    desc: "Read inbox, send email, and check unread count via Mail.app.",
    cmds: ["mctrl mail inbox --unread --json", 'mctrl mail send --to "a@b.com" --subject "Hi" --body "Hello"'],
  },
  {
    name: "Contacts",
    desc: "Look up phone numbers, emails, and search contacts.",
    cmds: ['mctrl contacts phone "John Doe"', 'mctrl contacts search "Jane"'],
  },
  {
    name: "Messages",
    desc: "Send and read iMessages.",
    cmds: ['mctrl sms send "+1234" "Hello"', "mctrl sms get --limit 5"],
  },
];

const FAQ_ITEMS = [
  {
    q: "What is mctrl?",
    a: "mctrl is a command-line tool that gives AI agents fine-grained control over macOS. It exposes 14 primitives for typing, clicking, reading screens, managing windows, controlling browsers, and more.",
  },
  {
    q: "How does it work with AI agents?",
    a: "Agents call mctrl commands as shell tools. Each command returns structured output (text or JSON) that agents can parse and act on. The CLI is designed to be agent-friendly with comprehensive help text and predictable output.",
  },
  {
    q: "Does it require special permissions?",
    a: "mctrl needs macOS Accessibility permission for keyboard and mouse control. Some features require additional permissions like screen recording or calendar access. You'll be prompted to grant these in System Settings.",
  },
  {
    q: "Is it open source?",
    a: "Yes. mctrl is fully open source under the MIT license. You can find the source code, contribute, or fork it on GitHub.",
  },
];

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
      <a href="#" className="flex items-center gap-2">
        <span className="text-white font-semibold text-base tracking-tight">
          mctrl
        </span>
      </a>
      <div className="hidden md:flex items-center gap-8">
        <a
          href="#features"
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Features
        </a>
        <a
          href="#install"
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Install
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url(/images/hero.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="relative z-10 px-8 pb-16 md:pb-20 max-w-xl">
        <h1 className="text-4xl md:text-[3.25rem] font-semibold text-white leading-[1.1] tracking-[-0.02em]">
          Give Your Agent
          <br />a Mac
        </h1>
        <p className="mt-5 text-[15px] md:text-base text-white/60 leading-relaxed max-w-md">
          mctrl lets your agents type, click, read screens, fill forms,
          control browsers, and more.
        </p>
        <div className="mt-8 flex items-center gap-5">
          <a
            href="#install"
            className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Install mctrl
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="opacity-50"
            >
              <path
                d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="https://github.com/enoreyes/mctrl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 text-sm font-medium hover:text-white transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <a
        href="#features"
        className="absolute bottom-6 right-8 z-10 w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white/40 hover:text-white hover:border-white/40 transition-colors"
        aria-label="Scroll down"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 2.5V11.5M7 11.5L3 7.5M7 11.5L11 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 md:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-8">
        <p className="text-sm font-medium text-neutral-400 tracking-wide uppercase">
          Primitives
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-0.02em]">
          14 commands. One CLI.
        </h2>
        <p className="mt-3 text-neutral-500 text-base max-w-lg">
          Everything an agent needs to see, interact with, and control a Mac.
        </p>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200">
          {PRIMITIVES.map((p) => (
            <div key={p.name} className="bg-white p-6">
              <h3 className="font-semibold text-sm">{p.name}</h3>
              <p className="text-neutral-500 text-[13px] mt-1.5 leading-relaxed">
                {p.desc}
              </p>
              <div className="mt-3 space-y-1">
                {p.cmds.map((cmd) => (
                  <code
                    key={cmd}
                    className="block text-[11px] font-mono text-neutral-400 truncate"
                  >
                    $ {cmd}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentDemo() {
  return (
    <section className="py-24 md:py-32 bg-neutral-950">
      <div className="max-w-3xl mx-auto px-8">
        <p className="text-sm font-medium text-neutral-500 tracking-wide uppercase">
          For Agents
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-white tracking-[-0.02em]">
          Structured output. Zero guessing.
        </h2>
        <p className="mt-3 text-neutral-500 text-base max-w-lg">
          Every command returns parseable text or JSON. Every flag has
          comprehensive help. Agents can discover and use capabilities
          without any extra setup.
        </p>
        <div className="mt-10 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-neutral-800">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          </div>
          <pre className="p-5 text-[13px] font-mono leading-[1.7] overflow-x-auto text-neutral-400">
            <code>{`$ mctrl display active-window --json
{ "app": "Chrome", "title": "GitHub", "x": 0, "y": 25 }

$ mctrl screen ocr --json
[{ "text": "Sign in", "confidence": 0.98, "x": 510, "y": 340 }]

$ mctrl mouse click 510 340
Clicked at (510, 340)

$ mctrl keyboard type "agent@example.com"
Typed 17 characters

$ mctrl keyboard press Tab
$ mctrl keyboard press Return`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function Install() {
  return (
    <section id="install" className="py-24 md:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-8">
        <p className="text-sm font-medium text-neutral-400 tracking-wide uppercase">
          Get Started
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-0.02em]">
          Install in 30 seconds.
        </h2>
        <p className="mt-3 text-neutral-500 text-base max-w-lg">
          Clone, build, and link. Requires Node.js 18+ and macOS.
        </p>
        <div className="mt-10 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-neutral-800">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          </div>
          <pre className="p-5 text-[13px] font-mono leading-[1.7] overflow-x-auto text-neutral-400">
            <code>{`git clone https://github.com/enoreyes/mctrl.git
cd mctrl && npm install && npm run build
npm link

mctrl --help`}</code>
          </pre>
        </div>
        <div className="mt-8 flex items-center gap-5">
          <a
            href="https://github.com/enoreyes/mctrl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            View on GitHub
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="opacity-50"
            >
              <path
                d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="https://github.com/enoreyes/mctrl/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 text-sm font-medium hover:text-neutral-900 transition-colors"
          >
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] font-medium">{q}</span>
        <span className="text-neutral-300 group-hover:text-neutral-500 ml-4 shrink-0 text-lg transition-colors">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p className="pb-5 text-neutral-500 leading-relaxed text-[14px]">
          {a}
        </p>
      )}
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-neutral-50">
      <div className="max-w-2xl mx-auto px-8">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">FAQ</h2>
        <div className="mt-8">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 bg-white border-t border-neutral-100">
      <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="font-semibold text-sm">mctrl</span>
          <p className="text-neutral-400 text-xs mt-1">
            Machine control for AI agents. MIT License.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-neutral-400">
          <a
            href="https://github.com/enoreyes/mctrl"
            className="hover:text-neutral-900 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/enoreyes/mctrl/blob/main/README.md"
            className="hover:text-neutral-900 transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com/enoreyes/mctrl/blob/main/LICENSE"
            className="hover:text-neutral-900 transition-colors"
          >
            License
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <AgentDemo />
      <Install />
      <Faq />
      <Footer />
    </>
  );
}
