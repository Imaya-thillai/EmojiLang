"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Hero } from "@/components/Hero";
import { EmojiEditor } from "@/components/EmojiEditor";
import { EmojiKeyboard } from "@/components/EmojiKeyboard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CodeOutput } from "@/components/CodeOutput";
import { ExecutionPanel } from "@/components/ExecutionPanel";
import { TranspileResult, TargetLanguage, EmojiExample, ExecutionResult } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Home() {
  const [emojiCode, setEmojiCode] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>("python");
  const [result, setResult] = useState<TranspileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examples, setExamples] = useState<EmojiExample[]>([]);
  const [hasExecuted, setHasExecuted] = useState(false);

  // Load examples on mount
  useEffect(() => {
    loadExamples();
  }, []);

  // Check for query params (share feature)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      try {
        // Use decodeURIComponent for proper UTF-8/Unicode decoding of emojis
        const decoded = decodeURIComponent(code);
        setEmojiCode(decoded);
      } catch (e) {
        console.error("Failed to decode shared code", e);
      }
    }

    // Easter egg: check for 🥚
    if (code?.includes("🥚") || emojiCode.includes("🥚")) {
      showEasterEgg();
    }
  }, []);

  const loadExamples = async () => {
    try {
      const res = await fetch(`${API_URL}/api/examples`);
      if (res.ok) {
        const data = await res.json();
        setExamples(data);
      }
    } catch (err) {
      console.error("Failed to load examples:", err);
    }
  };

  const handleTranspile = async () => {
    if (!emojiCode.trim()) {
      setError("Please enter some emoji code");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/transpile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emoji_code: emojiCode,
          target_language: targetLanguage,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: TranspileResult = await res.json();
      setResult(data);

      if (data.success && !hasExecuted) {
        setHasExecuted(true);
      }

      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(`Failed to transpile: ${String(err)}`);
      setResult({
        transpiled_code: "",
        explanation: [],
        detected_constructs: [],
        language: targetLanguage,
        success: false,
        error: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadExample = (example: EmojiExample) => {
    setEmojiCode(example.emoji_code);
    setError(null);
    setResult(null);
  };

  const handleEmojiClick = (emoji: string) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newCode = emojiCode.substring(0, start) + emoji + emojiCode.substring(end);
    setEmojiCode(newCode);

    // Move cursor after the inserted emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  const handleShare = () => {
    // Use encodeURIComponent for proper UTF-8/Unicode encoding of emojis
    const encoded = encodeURIComponent(emojiCode);
    const shareUrl = `${window.location.origin}?code=${encoded}`;
    navigator.clipboard.writeText(shareUrl);

    // Show toast
    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-4 right-4 bg-[#00D9A6] text-[#0D0D14] px-4 py-2 rounded-lg font-bold z-50 animate-bounce";
    toast.textContent = "✓ Share link copied!";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const showEasterEgg = () => {
    const egg = document.createElement("div");
    egg.className =
      "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#14141F] border-2 border-[#FF6B9D] rounded-lg p-8 z-50 max-w-md";
    egg.innerHTML = `
      <div class="text-center">
        <div class="text-6xl mb-4">🥚</div>
        <h2 class="text-2xl font-bold text-[#FF6B9D] mb-2">You found an egg!</h2>
        <p class="text-[#8B8AA0] mb-4">EmojiLang was built with GitHub Copilot for the Microsoft Agents League Hackathon 2026</p>
        <button onclick="this.parentElement.parentElement.remove()" class="px-4 py-2 bg-[#6C63FF] text-white rounded font-bold hover:bg-[#7D73FF]">
          Close
        </button>
      </div>
    `;
    document.body.appendChild(egg);

    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleExecutionComplete = (result: ExecutionResult) => {
    if (!result.error && !hasExecuted) {
      // Confetti on first successful execution
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0D14] text-[#F0EFFF] overflow-x-hidden">
      {/* Hero */}
      <Hero />

      {/* Main Editor Section */}
      <section id="editor-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0D0D14]">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap"
          >
            <h2 className="text-3xl font-bold">Create Your Program</h2>
            <div className="flex gap-4 items-center flex-wrap">
              <LanguageSelector
                selected={targetLanguage}
                onChange={setTargetLanguage}
              />
              {examples.length > 0 && (
                <select
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    if (idx >= 0) handleLoadExample(examples[idx]);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#14141F] border border-[#1F1F30] text-[#F0EFFF] text-sm font-mono cursor-pointer hover:border-[#6C63FF] transition-all"
                  defaultValue={-1}
                >
                  <option value={-1}>📋 Load Example...</option>
                  {examples.map((ex, i) => (
                    <option key={i} value={i}>
                      {ex.title}
                    </option>
                  ))}
                </select>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="px-4 py-2 rounded-lg bg-[#1F1F30] border border-[#2A2A3A] text-[#00D9A6] text-sm font-mono hover:border-[#00D9A6] transition-all"
                aria-label="Share code"
              >
                🔗 Share
              </motion.button>
            </div>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 font-mono text-sm"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Editor and Keyboard */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3">
              <EmojiEditor
                value={emojiCode}
                onChange={setEmojiCode}
                isLoading={loading}
                onTranspile={handleTranspile}
              />
            </div>
            <div className="lg:col-span-1">
              <EmojiKeyboard onEmojiClick={handleEmojiClick} />
            </div>
          </div>

          {/* Code Output */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <CodeOutput result={result} emojiCode={emojiCode} />
            </motion.div>
          )}

          {/* Execution Panel (Python only) */}
          {result?.success && targetLanguage === "python" && (
            <ExecutionPanel
              code={result.transpiled_code}
              isVisible={true}
              onExecutionComplete={handleExecutionComplete}
            />
          )}
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-8 px-4 sm:px-6 lg:px-8 border-t border-[#1F1F30] bg-[#14141F]/50 text-center text-[#8B8AA0] text-sm font-mono"
      >
        <p>
          Built with GitHub Copilot ⚡ for Microsoft Agents League Hackathon 2026 |
          <br />
          EmojiLang — because why not? 🚀
        </p>
      </motion.footer>
    </main>
  );
}
