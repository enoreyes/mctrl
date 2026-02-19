"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Install", href: "#install" },
  { label: "FAQ", href: "#faq" },
];

const PRIMITIVES: {
  icon: string;
  name: string;
  desc: string;
  cmds: string[];
}[] = [
  {
    icon: "⌨️",
    name: "Keyboard",
    desc: "Type text, press keys, trigger hotkeys.",
    cmds: ['mctrl keyboard type "Hello"', "mctrl keyboard hotkey cmd+c"],
  },
  {
    icon: "🖱️",
    name: "Mouse",
    desc: "Move, click, scroll, drag anywhere on screen.",
    cmds: ["mctrl mouse click 500 300", "mctrl mouse scroll -3"],
  },
  {
    icon: "🖥️",
    name: "Display",
    desc: "Screen dimensions, screenshots, active window.",
    cmds: ["mctrl display screenshot -o shot.png", "mctrl display size --json"],
  },
  {
    icon: "📋",
    name: "Clipboard",
    desc: "Read and write the system clipboard.",
    cmds: ['mctrl clipboard copy "data"', "mctrl clipboard view"],
  },
  {
    icon: "👁️",
    name: "Screen OCR",
    desc: "Extract text from the screen using Vision framework.",
    cmds: ["mctrl screen ocr", "mctrl screen ocr --json"],
  },
  {
    icon: "🪟",
    name: "Windows",
    desc: "List, focus, resize, move, minimize windows.",
    cmds: ["mctrl window list --json", 'mctrl window focus "Terminal"'],
  },
  {
    icon: "♿",
    name: "Accessibility",
    desc: "Inspect the AX tree, get focused elements.",
    cmds: ["mctrl a11y tree --app Finder", "mctrl a11y focused --json"],
  },
  {
    icon: "🌐",
    name: "Browser",
    desc: "Control Chrome and Safari. Open URLs, run JS, get page source.",
    cmds: ['mctrl browser open "https://example.com"', "mctrl browser tabs"],
  },
  {
    icon: "📁",
    name: "Files",
    desc: "Search, read, write, edit files on disk.",
    cmds: ['mctrl files search "TODO" --dir .', "mctrl files read config.json"],
  },
  {
    icon: "⚙️",
    name: "OS",
    desc: "Notifications, launch apps, get frontmost app.",
    cmds: ['mctrl os notify "Done!"', "mctrl os frontmost-app --json"],
  },
  {
    icon: "📅",
    name: "Calendar",
    desc: "List and create calendar events via Apple Calendar.",
    cmds: ["mctrl calendar list --days 7", 'mctrl calendar create "Meeting"'],
  },
  {
    icon: "💬",
    name: "Messages",
    desc: "Send and read iMessages via the Messages database.",
    cmds: ['mctrl sms send "+1234" "Hello"', "mctrl sms get --limit 5"],
  },
];

const FAQ_ITEMS = [
  {
    q: "What is mctrl?",
    a: "mctrl is a command-line tool that gives AI agents fine-grained control over macOS. It exposes 14 primitives for typing, clicking, reading screens, managing windows, controlling browsers, and more — all through simple CLI commands.",
  },
  {
    q: "How does it work with AI agents?",
    a: "AI agents call mctrl commands as shell tools. Each command returns structured output (text or JSON) that agents can parse and act on. The CLI is designed to be agent-friendly with comprehensive --help text and predictable output formats.",
  },
  {
    q: "Does it require root or special permissions?",
    a: "mctrl requires macOS Accessibility permission for keyboard/mouse control, and may need additional permissions for specific features like screen recording, calendar access, or Messages. You'll be prompted to grant these in System Settings.",
  },
  {
    q: "Is it open source?",
    a: "Yes, mctrl is fully open source under the MIT license. You can find the source code, contribute, or fork it on GitHub.",
  },
];

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/10">
      <a href="#" className="flex items-center gap-2">
        <span className="text-white font-mono font-bold text-xl tracking-tight">
          mctrl
        </span>
      </a>
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-neutral-400 hover:text-white text-sm transition-colors"
          >
            {link.label}
          </a>
        ))}
        <a
          href="https://github.com/enoreyes/mctrl"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/hero.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      <div className="relative z-10 max-w-4xl px-6 pb-20 md:pb-28 pt-32">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
          Machine Control
          <br />
          for AI Agents
        </h1>
        <p className="mt-6 text-lg md:text-xl text-neutral-300 max-w-2xl leading-relaxed">
          Give your agents hands. mctrl exposes 14 macOS primitives — keyboard,
          mouse, display, clipboard, OCR, windows, accessibility, browser,
          files, OS, calendar, contacts, mail, and messages — as simple CLI
          commands.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#install"
            className="bg-white text-black px-6 py-3 text-base font-semibold hover:bg-neutral-200 transition-colors"
          >
            Install mctrl
          </a>
          <a
            href="https://github.com/enoreyes/mctrl"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/30 text-white px-6 py-3 text-base font-medium hover:bg-white/10 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
      <a
        href="#features"
        className="absolute bottom-6 right-6 z-10 w-10 h-10 flex items-center justify-center border border-white/30 text-white hover:bg-white/10 transition-colors"
        aria-label="Scroll down"
      >
        ↓
      </a>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center tracking-tight">
          14 Primitives. One CLI.
        </h2>
        <p className="mt-4 text-center text-neutral-500 text-lg max-w-2xl mx-auto">
          Everything an agent needs to see, interact with, and control a Mac.
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRIMITIVES.map((p) => (
            <div
              key={p.name}
              className="group border border-neutral-200 p-6 hover:border-neutral-400 transition-colors"
            >
              <div className="text-2xl mb-3">{p.icon}</div>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-neutral-500 text-sm mt-1 leading-relaxed">
                {p.desc}
              </p>
              <div className="mt-4 space-y-1.5">
                {p.cmds.map((cmd) => (
                  <code
                    key={cmd}
                    className="block text-xs font-mono bg-neutral-100 text-neutral-700 px-3 py-1.5 overflow-x-auto"
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
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/features-bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center tracking-tight">
          Built for Agents
        </h2>
        <p className="mt-4 text-center text-neutral-400 text-lg max-w-2xl mx-auto">
          Every command returns structured output. Every flag has comprehensive
          help. Agents can discover capabilities and parse results without
          guessing.
        </p>
        <div className="mt-12 bg-neutral-900 border border-neutral-700 overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800 border-b border-neutral-700">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-neutral-500 text-xs font-mono">
              terminal
            </span>
          </div>
          <pre className="p-6 text-sm font-mono leading-relaxed overflow-x-auto text-neutral-300">
            <code>
              <span className="text-green-400">$</span> mctrl display
              active-window --json{"\n"}
              <span className="text-neutral-500">
                {`{ "app": "Chrome", "title": "GitHub", "x": 0, "y": 25, "w": 1440, "h": 875 }`}
              </span>
              {"\n\n"}
              <span className="text-green-400">$</span> mctrl screen ocr --json
              {"\n"}
              <span className="text-neutral-500">
                {`[{ "text": "Sign in to GitHub", "confidence": 0.98, "x": 510, "y": 340 }]`}
              </span>
              {"\n\n"}
              <span className="text-green-400">$</span> mctrl mouse click 510
              340{"\n"}
              <span className="text-neutral-500">Clicked at (510, 340)</span>
              {"\n\n"}
              <span className="text-green-400">$</span> mctrl keyboard type
              {'"agent@example.com"'}
              {"\n"}
              <span className="text-neutral-500">
                Typed 17 characters
              </span>
              {"\n\n"}
              <span className="text-green-400">$</span> mctrl keyboard press
              Tab{"\n"}
              <span className="text-green-400">$</span> mctrl keyboard type
              {'"••••••••"'}
              {"\n"}
              <span className="text-green-400">$</span> mctrl keyboard press
              Return
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function Install() {
  return (
    <section id="install" className="py-24 md:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Get Started
        </h2>
        <p className="mt-4 text-neutral-500 text-lg">
          Install mctrl globally with npm. Requires Node.js 18+ and macOS.
        </p>
        <div className="mt-10 bg-neutral-900 border border-neutral-200 text-left overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800 border-b border-neutral-700">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <pre className="p-6 text-sm md:text-base font-mono text-neutral-300 overflow-x-auto">
            <code>
              <span className="text-neutral-500"># Install from source</span>
              {"\n"}
              <span className="text-green-400">$</span> git clone
              https://github.com/enoreyes/mctrl.git{"\n"}
              <span className="text-green-400">$</span> cd mctrl && npm install
              && npm run build{"\n"}
              <span className="text-green-400">$</span> npm link{"\n\n"}
              <span className="text-neutral-500"># Verify installation</span>
              {"\n"}
              <span className="text-green-400">$</span> mctrl --help
            </code>
          </pre>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="https://github.com/enoreyes/mctrl"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-6 py-3 text-base font-semibold hover:bg-neutral-800 transition-colors"
          >
            View on GitHub
          </a>
          <a
            href="https://github.com/enoreyes/mctrl/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-neutral-300 text-neutral-700 px-6 py-3 text-base font-medium hover:bg-neutral-100 transition-colors"
          >
            Read the Docs
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
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-base font-medium">{q}</span>
        <span className="text-xl text-neutral-400 ml-4 shrink-0">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p className="pb-5 text-neutral-500 leading-relaxed text-sm">{a}</p>
      )}
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center tracking-tight">
          FAQ
        </h2>
        <div className="mt-12">
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
    <footer className="py-16 bg-white border-t border-neutral-200">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-semibold mb-3">Product</h4>
          <a
            href="https://github.com/enoreyes/mctrl"
            className="block text-neutral-500 hover:text-neutral-900 mb-1"
          >
            Open Source
          </a>
          <a
            href="https://github.com/enoreyes/mctrl/blob/main/README.md"
            className="block text-neutral-500 hover:text-neutral-900 mb-1"
          >
            Documentation
          </a>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Community</h4>
          <a
            href="https://github.com/enoreyes/mctrl"
            className="block text-neutral-500 hover:text-neutral-900 mb-1"
          >
            GitHub
          </a>
          <a
            href="https://github.com/enoreyes/mctrl/issues"
            className="block text-neutral-500 hover:text-neutral-900 mb-1"
          >
            Issues
          </a>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <a
            href="https://github.com/enoreyes/mctrl/blob/main/LICENSE"
            className="block text-neutral-500 hover:text-neutral-900 mb-1"
          >
            MIT License
          </a>
        </div>
        <div>
          <span className="font-mono font-bold text-lg">mctrl</span>
          <p className="text-neutral-500 mt-2 leading-relaxed">
            Machine control for AI agents.
          </p>
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
