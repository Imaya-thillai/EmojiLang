"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExecutionResult } from "@/types";
import { runCode } from "@/lib/pyodide";

interface ExecutionPanelProps {
  code: string;
  isVisible: boolean;
  onExecutionComplete?: (result: ExecutionResult) => void;
}

export function ExecutionPanel({
  code,
  isVisible,
  onExecutionComplete,
}: ExecutionPanelProps) {
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const handleExecute = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    setShowTyping(true);
    setResult(null);

    try {
      const executionResult = await runCode(code);
      setResult(executionResult);
      onExecutionComplete?.(executionResult);
    } catch (error) {
      setResult({
        output: "",
        error: String(error),
      });
    } finally {
      setIsExecuting(false);
      setShowTyping(false);
    }
  };

  useEffect(() => {
    if (isVisible && code.trim()) {
      handleExecute();
    }
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="rounded-lg border border-[#1F1F30] bg-[#090910] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#1F1F30] px-4 py-3 border-b border-[#1F1F30] flex items-center justify-between">
          <p className="text-sm font-bold text-[#F0EFFF] flex items-center gap-2">
            <span className="text-green-400">●</span> Pyodide Terminal
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExecute}
            disabled={isExecuting || !code.trim()}
            className="px-3 py-1 text-xs bg-[#00D9A6] hover:bg-[#00E8B8] text-[#090910] rounded font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? "Running..." : "Run Again"}
          </motion.button>
        </div>

        {/* Terminal output */}
        <div className="p-4 font-mono text-sm min-h-[200px] max-h-[400px] overflow-y-auto">
          {isExecuting && (
            <motion.div
              animate={{ opacity: [1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <span className="text-[#00FF88]">{"> Running in browser via Pyodide..."}</span>
            </motion.div>
          )}

          {result && !isExecuting && (
            <>
              {result.error ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400"
                >
                  <div className="mb-2 font-bold">❌ Error:</div>
                  <pre className="whitespace-pre-wrap text-xs">{result.error}</pre>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.02, delayChildren: 0 }}
                  className="text-[#00FF88]"
                >
                  <div className="mb-2">✓ Execution completed successfully</div>
                  {result.output && (
                    <motion.pre
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-pre-wrap text-xs bg-[#14141F]/50 p-3 rounded border border-[#1F1F30] mt-2"
                    >
                      {result.output}
                    </motion.pre>
                  )}
                  {!result.output && (
                    <div className="text-[#8B8AA0] text-xs">
                      (No output)
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}

          {!isExecuting && !result && (
            <span className="text-[#8B8AA0] text-xs">
              Press "Run Again" to execute...
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
