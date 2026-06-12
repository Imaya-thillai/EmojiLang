"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const snippets = [
  "📢 📝\"Hello World!\"",
  "🔁 📦i ➡️ 1️⃣ 5️⃣\n  📢 i",
  "❓ x 📈 1️⃣0️⃣\n  📢 📝\"Big!\"",
  "🏁 add 🔢a 🔢b\n  ↩️ a ➕ b",
];

export function Hero() {
  const [displaySnippet, setDisplaySnippet] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplaySnippet((prev) => (prev + 1) % snippets.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const pulseVariants = {
    pulse: {
      boxShadow: [
        "0 0 0 0 rgba(108,99,255,0.7)",
        "0 0 0 10px rgba(108,99,255,0.5)",
        "0 0 0 20px rgba(108,99,255,0)",
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
      },
    },
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-[#0D0D14] via-[#0D0D14] to-[#14141F] overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6C63FF]/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF6B9D]/20 rounded-full blur-3xl opacity-20 animate-pulse" />

      {/* Hackathon Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex justify-center py-4"
      >
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#6C63FF]/10 to-[#FF6B9D]/10 border border-[#6C63FF]/30 backdrop-blur-sm">
          <span className="text-2xl">🏆</span>
          <span className="text-sm font-semibold text-[#00D9A6]">
            Microsoft Agents League Hackathon 2026
          </span>
          <span className="text-2xl">🤖</span>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Main headline */}
          <motion.h1 variants={itemVariants} className="mb-6">
            <span className="block text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-4">
              Write code in
            </span>
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black bg-gradient-to-r from-[#6C63FF] via-[#FF6B9D] to-[#6C63FF] bg-clip-text text-transparent">
              emojis.
            </span>
          </motion.h1>

          {/* AI-Powered subheading */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-4">
            <span className="text-2xl">🤖</span>
            <p className="text-lg font-semibold text-[#00D9A6]">
              Powered by AI Agents
            </p>
            <span className="text-2xl">✨</span>
          </motion.div>

          {/* Subheading */}
          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-[#8B8AA0] max-w-2xl mx-auto mb-4">
            EmojiLang is a real programming language where every emoji is a keyword. The AI understands your intent and transpiles it to Python, JavaScript, or Java in real-time.
          </motion.p>

          <motion.p variants={itemVariants} className="text-base text-[#6B6A7F] max-w-2xl mx-auto mb-12">
            Built with GitHub Copilot • AI-Powered Semantic Understanding • Multi-Language Code Generation
          </motion.p>

          {/* Feature badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              { emoji: "🌍", label: "Universal Language" },
              { emoji: "⚡", label: "Live Execution" },
              { emoji: "🧠", label: "AI Agent Brain" },
              { emoji: "🔀", label: "3 Languages" },
              { emoji: "♿", label: "Accessible" },
              { emoji: "📱", label: "Mobile Ready" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.08, boxShadow: "0 0 20px rgba(108,99,255,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-[#14141F] border border-[#1F1F30] text-[#F0EFFF] font-mono text-sm flex items-center gap-2 cursor-pointer transition-all hover:border-[#6C63FF]/50"
              >
                <span className="text-lg">{stat.emoji}</span>
                <span className="hidden sm:inline">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Snippet carousel with pulse effect */}
          <motion.div variants={itemVariants} className="mb-16">
            <motion.div
              variants={pulseVariants}
              animate="pulse"
              className="inline-block px-6 py-4 rounded-lg bg-[#14141F] border border-[#1F1F30] shadow-lg"
            >
              <div className="font-mono text-sm text-[#00D9A6] min-h-[100px] max-w-md">
                <p className="text-xs text-[#8B8AA0] mb-2">Example emoji code:</p>
                {snippets[displaySnippet].split("\n").map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    {line || <span>&nbsp;</span>}
                  </div>
                ))}
              </div>
            </motion.div>
            <p className="text-xs text-[#6B6A7F] mt-4">
              ✨ Changes every 4 seconds • ✨ Click to try it
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(108,99,255,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById("editor-section");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#FF6B9D] text-white font-bold text-lg transition-all hover:shadow-lg"
            >
              Start Coding →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,217,166,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.open("https://github.com", "_blank");
              }}
              className="px-8 py-4 rounded-lg bg-[#14141F] border border-[#00D9A6] text-[#00D9A6] font-bold text-lg transition-all hover:bg-[#1F1F30]"
            >
              View Source 🔗
            </motion.button>
          </motion.div>

          {/* Confidence badge */}
          <motion.div
            variants={itemVariants}
            className="mt-12 pt-8 border-t border-[#1F1F30]"
          >
            <p className="text-[#6B6A7F] text-sm mb-4">
              ✅ 100% Functional • ✅ Production Ready • ✅ Hackathon Ready
            </p>
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#00D9A6]/10 border border-[#00D9A6]/30 text-[#00D9A6] text-xs font-mono">
                AI Innovation
              </span>
              <span className="px-3 py-1 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-[#6C63FF] text-xs font-mono">
                Semantic Understanding
              </span>
              <span className="px-3 py-1 rounded-full bg-[#FF6B9D]/10 border border-[#FF6B9D]/30 text-[#FF6B9D] text-xs font-mono">
                Real Code Generation
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
