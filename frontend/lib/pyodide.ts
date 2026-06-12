import { ExecutionResult } from "@/types";

let pyodide: any = null;
let loadPromise: Promise<any> | null = null;

const PYODIDE_VERSION = "0.25.1";
const CDN_URLS = [
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`,
  `https://pyodide-cdn.iodide.io/pyodide.js`,
];

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
        indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
        fullStdLib: false,
      });
      return pyodide;
    }

    // Load Pyodide script from CDN with fallback
    console.log("Loading Pyodide script...");
    let lastError: Error | null = null;
    
    for (const cdnUrl of CDN_URLS) {
      try {
        console.log(`Attempting to load Pyodide from: ${cdnUrl}`);
        await loadScript(cdnUrl);
        console.log(`Successfully loaded Pyodide from: ${cdnUrl}`);
        break;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load from ${cdnUrl}, trying next CDN...`, error);
      }
    }

    if (lastError && !(globalThis as any).Pyodide) {
      throw new Error(
        `All CDN sources failed to load Pyodide. Last error: ${lastError.message}`
      );
    }

    // Wait for Pyodide global with extended timeout
    console.log("Waiting for Pyodide global...");
    let attempts = 0;
    const maxAttempts = 1200; // 60 seconds
    
    while (!(globalThis as any).Pyodide && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      attempts++;
      if (attempts % 40 === 0) {
        console.log(`Waiting for Pyodide... ${attempts * 50}ms elapsed`);
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
      indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
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
    // Check if script is already loaded
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
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
      console.log(`Script loaded: ${src}`);
      resolve();
    };
    
    script.onerror = (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      console.error(`Failed to load script: ${src}`, error);
      reject(new Error(`Failed to load Pyodide from ${src}: ${error}`));
    };

    // Add timeout for CDN loading
    timeoutId = setTimeout(() => {
      reject(new Error(`Script load timeout for ${src} (20s)`));
    }, 20000);

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
