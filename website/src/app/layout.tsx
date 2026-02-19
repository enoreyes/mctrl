import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mctrl - Machine Control for AI Agents",
  description:
    "Fine-grained macOS control for AI agents. Type, click, read screens, manage windows, automate browsers, and more.",
  openGraph: {
    title: "mctrl - Machine Control for AI Agents",
    description:
      "Fine-grained macOS control for AI agents. Type, click, read screens, manage windows, automate browsers, and more.",
    images: ["/images/hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
