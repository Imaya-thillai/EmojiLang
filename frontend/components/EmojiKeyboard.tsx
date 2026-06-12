"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmojiKeywordGroup } from "@/types";

interface EmojiKeyboardProps {
  onEmojiClick: (emoji: string) => void;
}

const EMOJI_GROUPS: EmojiKeywordGroup[] = [
  {
    name: "Variables",
    emojis: [
      { emoji: "📦", meaning: "variable declaration", category: "Variables" },
      { emoji: "🔢", meaning: "integer type", category: "Variables" },
      { emoji: "📝", meaning: "string type", category: "Variables" },
      { emoji: "✅", meaning: "boolean true", category: "Variables" },
      { emoji: "❌", meaning: "boolean false", category: "Variables" },
      { emoji: "📋", meaning: "list/array", category: "Variables" },
    ],
  },
  {
    name: "Control Flow",
    emojis: [
      { emoji: "🔁", meaning: "for loop", category: "Control Flow" },
      { emoji: "🔄", meaning: "while loop", category: "Control Flow" },
      { emoji: "❓", meaning: "if statement", category: "Control Flow" },
      { emoji: "❗", meaning: "else", category: "Control Flow" },
      { emoji: "🛑", meaning: "break", category: "Control Flow" },
      { emoji: "⏭️", meaning: "continue", category: "Control Flow" },
    ],
  },
  {
    name: "I/O",
    emojis: [
      { emoji: "📢", meaning: "print/output", category: "I/O" },
      { emoji: "💬", meaning: "comment", category: "I/O" },
    ],
  },
  {
    name: "Math",
    emojis: [
      { emoji: "➕", meaning: "add", category: "Math" },
      { emoji: "➖", meaning: "subtract", category: "Math" },
      { emoji: "✖️", meaning: "multiply", category: "Math" },
      { emoji: "➗", meaning: "divide/modulo", category: "Math" },
    ],
  },
  {
    name: "Logic",
    emojis: [
      { emoji: "⚖️", meaning: "equals comparison", category: "Logic" },
      { emoji: "📈", meaning: "greater than", category: "Logic" },
      { emoji: "📉", meaning: "less than", category: "Logic" },
      { emoji: "🔗", meaning: "concatenate", category: "Logic" },
      { emoji: "➡️", meaning: "range", category: "Logic" },
    ],
  },
  {
    name: "Functions",
    emojis: [
      { emoji: "🏁", meaning: "function definition", category: "Functions" },
      { emoji: "↩️", meaning: "return", category: "Functions" },
    ],
  },
];

export function EmojiKeyboard({ onEmojiClick }: EmojiKeyboardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiClick(emoji);
  };

  return (
    <motion.div
      layout
      className="rounded-lg border border-[#1F1F30] bg-[#14141F] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#1F1F30] p-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#F0EFFF]">Emoji Keyboard</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#8B8AA0] hover:text-[#F0EFFF] text-xl"
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? "⬆️" : "⬇️"}
        </motion.button>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
          >
            {/* Tabs */}
            <div className="flex gap-1 p-3 border-b border-[#1F1F30] overflow-x-auto">
              {EMOJI_GROUPS.map((group, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(i)}
                  className={`px-3 py-1 rounded text-xs font-mono whitespace-nowrap transition-all ${
                    activeTab === i
                      ? "bg-[#6C63FF] text-white"
                      : "bg-[#1F1F30] text-[#8B8AA0] hover:text-[#F0EFFF]"
                  }`}
                >
                  {group.name}
                </motion.button>
              ))}
            </div>

            {/* Emoji Grid */}
            <div className="p-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
              {EMOJI_GROUPS[activeTab].emojis.map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.15, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEmojiClick(item.emoji)}
                  onMouseEnter={() => setHoveredEmoji(item.emoji)}
                  onMouseLeave={() => setHoveredEmoji(null)}
                  className="relative h-12 rounded-lg bg-[#1F1F30] hover:bg-[#2A2A3A] border border-[#2A2A3A] hover:border-[#6C63FF] flex items-center justify-center transition-all group"
                  aria-label={item.meaning}
                >
                  <span className="text-2xl">{item.emoji}</span>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredEmoji === item.emoji && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: -35 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute whitespace-nowrap bg-[#0D0D14] border border-[#6C63FF] text-[#00D9A6] text-xs px-2 py-1 rounded pointer-events-none font-mono z-50"
                      >
                        {item.meaning}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>

            {/* Quick digits */}
            <div className="px-4 pb-4 border-t border-[#1F1F30]">
              <p className="text-xs text-[#8B8AA0] mb-2 font-mono">Quick Numbers:</p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"].map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEmojiClick(num)}
                    className="h-8 rounded bg-[#1F1F30] hover:bg-[#2A2A3A] border border-[#2A2A3A] hover:border-[#00D9A6] text-lg flex items-center justify-center"
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
