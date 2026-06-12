"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranspileResult } from "@/types";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-java";

interface CodeOutputProps {
  result: TranspileResult | null;
  emojiCode: string;
}

export function CodeOutput({ result, emojiCode }: CodeOutputProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    Prism.highlightAll();
  }, [result]);

  if (!result) {
    return (
      <div className="rounded-lg border border-[#1F1F30] bg-[#14141F] p-8 text-center text-[#8B8AA0]">
        <p className="text-lg">✨ Transpile your code to see the result here</p>
      </div>
    );
  }

  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border-2 border-red-500/50 bg-red-500/10 p-6"
      >
        <p className="text-red-400 font-mono mb-2">❌ Error</p>
        <p className="text-[#F0EFFF]">{result.error || "Unknown error"}</p>
      </motion.div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.transpiled_code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getLanguageClass = (): string => {
    switch (result.language) {
      case "python":
        return "language-python";
      case "javascript":
        return "language-javascript";
      case "java":
        return "language-java";
      default:
        return "language-python";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Code comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Emoji Code */}
        <div className="rounded-lg border border-[#1F1F30] bg-[#14141F] overflow-hidden">
          <div className="bg-[#1F1F30] px-4 py-3 border-b border-[#1F1F30]">
            <p className="text-sm font-bold text-[#F0EFFF]">EmojiLang Input</p>
          </div>
          <pre className="p-4 overflow-x-auto text-sm text-[#00D9A6] font-mono max-h-96">
            <code>{emojiCode}</code>
          </pre>
        </div>

        {/* Transpiled Code */}
        <div className="rounded-lg border border-[#1F1F30] bg-[#14141F] overflow-hidden flex flex-col">
          <div className="bg-[#1F1F30] px-4 py-3 border-b border-[#1F1F30] flex items-center justify-between">
            <p className="text-sm font-bold text-[#F0EFFF]">
              {result.language.toUpperCase()} Output
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="px-3 py-1 text-xs bg-[#6C63FF] hover:bg-[#7D73FF] text-white rounded transition-all"
            >
              {isCopied ? "✓ Copied!" : "Copy"}
            </motion.button>
          </div>
          <pre className="p-4 overflow-x-auto text-sm font-mono max-h-96 flex-1">
            <code className={getLanguageClass()}>
              {result.transpiled_code}
            </code>
          </pre>
        </div>
      </div>

      {/* Detected Constructs */}
      {result.detected_constructs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-[#1F1F30] bg-[#14141F] p-4"
        >
          <p className="text-sm font-bold text-[#F0EFFF] mb-3">🔍 Detected Constructs</p>
          <div className="flex flex-wrap gap-2">
            {result.detected_constructs.map((construct, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-3 py-1 rounded-full bg-[#1F1F30] border border-[#6C63FF]/50 text-[#00D9A6] text-xs font-mono"
              >
                {construct}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step-by-step explanation */}
      {result.explanation.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-[#1F1F30] bg-[#14141F] overflow-hidden"
        >
          <div
            className="bg-[#1F1F30] px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-[#252530] transition-colors"
            onClick={() =>
              setExpandedStep(expandedStep === null ? 0 : null)
            }
          >
            <p className="text-sm font-bold text-[#F0EFFF]">
              📋 Step-by-step Explanation
            </p>
            <span className="text-[#8B8AA0]">
              {expandedStep !== null ? "▼" : "▶"}
            </span>
          </div>

          <AnimatePresence>
            {expandedStep !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="divide-y divide-[#1F1F30]"
              >
                {result.explanation.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-4 py-3 bg-[#14141F]/50"
                  >
                    <p className="text-sm text-[#F0EFFF] font-mono">
                      <span className="text-[#FF6B9D] mr-2">Line {i + 1}:</span>
                      {step}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
