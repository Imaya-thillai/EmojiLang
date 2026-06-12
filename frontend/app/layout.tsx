import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmojiLang - AI-Powered Programming in Emojis",
  description:
    "Write real code using only emojis. EmojiLang is an AI-powered programming language where every keyword is an emoji. Built with GitHub Copilot.",
  keywords: [
    "emojis",
    "programming",
    "language",
    "AI",
    "copilot",
    "transpiler",
    "education",
  ],
  authors: [{ name: "EmojiLang Team" }],
  openGraph: {
    title: "EmojiLang - Code in Emojis",
    description: "An AI-powered programming language where every keyword is an emoji",
    type: "website",
    images: [
      {
        url: "https://emojilang.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "EmojiLang",
      },
    ],
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
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" />
      </head>
      <body
        className="bg-[#0D0D14] text-[#F0EFFF]"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {children}
      </body>
    </html>
  );
}
