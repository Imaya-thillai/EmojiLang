import { ExecutionResult } from "@/types";

let pyodide: any = null;
let loadPromise: Promise<any> | null = null;

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/";

export async function loadPyodide(): Promise<any> {
  // Return cached instance if already loaded
  if (pyodide) {
    return pyodide;
  }

  // Return existing load promise if already in progress
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = initPyodide();
  return loadPromise;
}

async function initPyodide(): Promise<any> {
  try {
    console.log("Starting Pyodide initialization...");

    // Wait for Pyodide global to be available (loaded via Next.js Script)
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds
    while (!(globalThis as any).Pyodide && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!(globalThis as any).Pyodide) {
      throw new Error("Pyodide global not found after 10 seconds");
    }

    console.log("Pyodide global detected, initializing...");
    const Pyodide = (globalThis as any).Pyodide;

    // Initialize Pyodide with timeout
    pyodide = await Promise.race([
      Pyodide.loadPyodide({
        indexURL: PYODIDE_CDN,
        fullStdLib: false,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Pyodide initialization timeout (30s)")),
          30000
        )
      ),
    ]);

    console.log("Pyodide initialized successfully");
    return pyodide;
  } catch (error) {
    console.error("Failed to initialize Pyodide:", error);
    loadPromise = null; // Reset so we can retry
    throw error;
  }
}

export async function runCode(code: string): Promise<ExecutionResult> {
  try {
    const py = await loadPyodide();

    // Create a string buffer to capture output
    const output: string[] = [];

    // Run code with output capture
    py.globals.set("output_list", output);

    const pythonCode = `
import sys
from io import StringIO

# Redirect stdout
old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    ${code
      .split("\n")
      .map((line) => (line ? "    " + line : ""))
      .join("\n")}
except Exception as e:
    sys.stdout.close()
    sys.stdout = old_stdout
    raise e

result = sys.stdout.getvalue()
sys.stdout.close()
sys.stdout = old_stdout
result
`;

    const result = await Promise.race([
      (async () => {
        try {
          const pyResult = await py.runPythonAsync(pythonCode);
          return {
            output: pyResult || "",
            error: null,
          };
        } catch (error) {
          return {
            output: "",
            error: String(error),
          };
        }
      })(),
      new Promise<ExecutionResult>((_, reject) =>
        setTimeout(() => reject(new Error("Execution timeout (10s)")), 10000)
      ),
    ]);

    return result;
  } catch (error) {
    return {
      output: "",
      error: String(error),
    };
  }
}
