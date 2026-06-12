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

    // First, try to check if Pyodide is already available globally
    if ((globalThis as any).Pyodide) {
      console.log("Pyodide already available in global scope");
      const Pyodide = (globalThis as any).Pyodide;
      pyodide = await Pyodide.loadPyodide({
        indexURL: PYODIDE_CDN,
        fullStdLib: false,
      });
      return pyodide;
    }

    // Load the Pyodide script
    console.log("Loading Pyodide script from CDN...");
    
    // Create script element and wait for it to load
    const scriptUrl = `${PYODIDE_CDN}pyodide.js`;
    await loadScript(scriptUrl);

    // Verify Pyodide is now available
    if (!(globalThis as any).Pyodide) {
      throw new Error("Pyodide script loaded but Pyodide global not found");
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

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      // If script exists, wait a bit and check if Pyodide is ready
      setTimeout(() => {
        if ((globalThis as any).Pyodide) {
          resolve();
        } else {
          resolve(); // Still resolve since the script was added
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    script.async = true;
    script.defer = false;

    let timeoutId: NodeJS.Timeout | null = null;

    script.onload = () => {
      if (timeoutId) clearTimeout(timeoutId);
      console.log(`Script loaded successfully: ${src}`);
      // Give it a moment for the global to be set
      setTimeout(() => resolve(), 100);
    };

    script.onerror = (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      console.error(`Script load error: ${src}`, error);
      reject(new Error(`Failed to load script from ${src}`));
    };

    // Add 30 second timeout
    timeoutId = setTimeout(() => {
      console.error(`Script load timeout: ${src}`);
      reject(new Error(`Script load timeout for ${src} (30s)`));
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
