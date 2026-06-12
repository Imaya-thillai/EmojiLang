import { ExecutionResult } from "@/types";

let pyodide: any = null;
let loadPromise: Promise<any> | null = null;

// Use unpkg as the primary source - more reliable than jsdelivr
const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/";
const PYODIDE_UNPKG = "https://unpkg.com/pyodide@0.25.1/";

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

    // Wait up to 5 seconds for Pyodide to be loaded via Next.js Script
    let attempts = 0;
    while (!(globalThis as any).Pyodide && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
      if (attempts % 10 === 0) {
        console.log(`Waiting for Pyodide... ${attempts * 100}ms`);
      }
    }

    if (!(globalThis as any).Pyodide) {
      console.warn("Pyodide not loaded via Next.js Script, attempting manual load");
      // Fallback: load manually from unpkg
      await loadPyodideManually();
    }

    if (!(globalThis as any).Pyodide) {
      throw new Error("Pyodide could not be loaded from any source");
    }

    console.log("Pyodide global detected, initializing runtime...");
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

    console.log("Pyodide runtime initialized successfully");
    return pyodide;
  } catch (error) {
    console.error("Failed to initialize Pyodide:", error);
    loadPromise = null; // Reset so we can retry
    throw error;
  }
}

async function loadPyodideManually(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PYODIDE_UNPKG}pyodide.js`;
    script.type = "text/javascript";
    script.async = true;
    script.crossOrigin = "anonymous";

    let timeoutId: NodeJS.Timeout | null = null;

    script.onload = async () => {
      if (timeoutId) clearTimeout(timeoutId);
      console.log("Pyodide script loaded successfully");
      
      // Wait for the global to be set
      let attempts = 0;
      while (!(globalThis as any).Pyodide && attempts < 30) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      
      if ((globalThis as any).Pyodide) {
        console.log("Pyodide global detected");
        resolve();
      } else {
        reject(new Error("Pyodide script loaded but global not set"));
      }
    };

    script.onerror = (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      console.error(`Script load error`, error);
      reject(new Error(`Failed to load Pyodide script`));
    };

    // 30 second timeout
    timeoutId = setTimeout(() => {
      console.error(`Script load timeout`);
      reject(new Error(`Script load timeout (30s)`));
    }, 30000);

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
