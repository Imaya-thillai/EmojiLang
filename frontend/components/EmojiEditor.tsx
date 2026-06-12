"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface EmojiEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  onTranspile: () => void;
}

export function EmojiEditor({ value, onChange, isLoading, onTranspile }: EmojiEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const updateLineCount = () => {
      const lines = textarea.value.split("\n").length;
      setLineCount(lines);
    };

    updateLineCount();
    textarea.addEventListener("input", updateLineCount);
    return () => textarea.removeEventListener("input", updateLineCount);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue =
        value.substring(0, start) + "\t" + value.substring(end);
      onChange(newValue);

      // Move cursor after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#F0EFFF]">Emoji Editor</h2>
        <div className="text-sm text-[#8B8AA0] font-mono">
          Lines: {lineCount} | Chars: {value.length}
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-[#1F1F30] bg-[#14141F]">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bg-[#090910] border-r border-[#1F1F30] text-right py-4 px-3 select-none">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="text-[#8B8AA0] text-sm font-mono h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type emojis here... or use the keyboard below"
          className="w-full pl-16 p-4 bg-[#14141F] text-[#F0EFFF] font-mono text-base resize-none outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-opacity-50 min-h-80 overflow-y-auto"
          spellCheck="false"
        />
      </div>

      {/* Character and line info */}
      <div className="flex gap-2 text-xs text-[#8B8AA0] font-mono">
        <span>📝 {lineCount} line{lineCount !== 1 ? "s" : ""}</span>
        <span>•</span>
        <span>🔤 {value.length} character{value.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Transpile button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onTranspile}
        disabled={isLoading || !value.trim()}
        className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#FF6B9D] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Transpiling...
          </>
        ) : (
          <>
            Transpile →
          </>
        )}
      </motion.button>
    </div>
  );
}
