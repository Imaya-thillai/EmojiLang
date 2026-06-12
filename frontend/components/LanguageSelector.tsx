"use client";

import { motion } from "framer-motion";
import { TargetLanguage } from "@/types";

interface LanguageSelectorProps {
  selected: TargetLanguage;
  onChange: (language: TargetLanguage) => void;
}

const LANGUAGES: { lang: TargetLanguage; label: string; icon: string }[] = [
  { lang: "python", label: "Python", icon: "🐍" },
  { lang: "javascript", label: "JavaScript", icon: "⚡" },
  { lang: "java", label: "Java", icon: "☕" },
];

export function LanguageSelector({ selected, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-[#8B8AA0] font-mono">Target:</span>
      <div className="relative inline-flex gap-1 p-1 rounded-lg bg-[#1F1F30] border border-[#2A2A3A]">
        {/* Sliding pill background */}
        <motion.div
          layoutId="language-pill"
          className="absolute inset-1 rounded-md bg-[#6C63FF]/20 border border-[#6C63FF]"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            width: `calc(33.333% - 4px)`,
            left: `calc(${
              LANGUAGES.findIndex((l) => l.lang === selected) * 33.333
            }% + 4px)`,
          }}
        />

        {/* Language buttons */}
        {LANGUAGES.map((lang) => (
          <motion.button
            key={lang.lang}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(lang.lang)}
            className={`relative z-10 px-4 py-2 rounded-md font-mono text-sm font-bold transition-all ${
              selected === lang.lang
                ? "text-white"
                : "text-[#8B8AA0] hover:text-[#F0EFFF]"
            }`}
          >
            <span className="mr-1">{lang.icon}</span>
            {lang.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
