import { ExecutionResult } from "@/types";

import { ExecutionResult } from "@/types";

let pyodide: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

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

    // Check if Pyodide is already loaded
    if ((globalThis as any).Pyodide) {
      console.log("Pyodide already in global scope");
      const Pyodide = (globalThis as any).Pyodide;
      pyodide = await Pyodide.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
        fullStdLib: false,
      });
      return pyodide;
    }

    // Load Pyodide script from CDN
    console.log("Loading Pyodide script...");
    await loadScript("https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js");

    // Wait for Pyodide global with extended timeout
    console.log("Waiting for Pyodide global...");
    let attempts = 0;
    const maxAttempts = 600; // 30 seconds
    
    while (!(globalThis as any).Pyodide && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      attempts++;
      if (attempts % 40 === 0) {
        console.log(`Waiting for Pyodide... ${attempts * 50}ms`);
      }
    }

    if (!(globalThis as any).Pyodide) {
      throw new Error(
        `Pyodide failed to load after ${attempts * 50}ms. ` +
        `Check browser console and network tab for errors. ` +
        `CDN may be blocked or unreachable.`
      );
    }

    console.log("Pyodide global found, initializing...");
    const Pyodide = (globalThis as any).Pyodide;

    // Initialize Pyodide
    pyodide = await Pyodide.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
      fullStdLib: false,
    });

    console.log("Pyodide initialized successfully");
    return pyodide;
  } catch (error) {
    console.error("Failed to initialize Pyodide:", error);
    loadPromise = null; // Reset so we can retry
    throw error;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    script.async = true; // Set to true for non-blocking load
    
    script.onload = () => {
      console.log(`Script loaded: ${src}`);
      resolve();
    };
    
    script.onerror = (error) => {
      console.error(`Failed to load script: ${src}`, error);
      reject(new Error(`Failed to load Pyodide from ${src}`));
    };

    document.head.appendChild(script);
  });
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
