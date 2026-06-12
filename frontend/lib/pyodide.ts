import { ExecutionResult } from "@/types";

let pyodide: any = null;
let isLoading = false;

export async function loadPyodide(): Promise<any> {
  if (pyodide) {
    return pyodide;
  }

  // Prevent multiple simultaneous load attempts
  if (isLoading) {
    let attempts = 0;
    while (isLoading && attempts < 100) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    if (pyodide) return pyodide;
  }

  try {
    isLoading = true;

    // Use the official Pyodide CDN with CORS support
    const PyodideModule = (globalThis as any).PyodideModule || (globalThis as any).Pyodide;
    
    // If not already loaded, load it from CDN
    if (!PyodideModule) {
      // Load from official CDN
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.pyodide.org/releases/latest/pyodide.js";
        script.async = true;
        script.onload = () => {
          // Small delay to ensure globals are set
          setTimeout(() => resolve(), 1000);
        };
        script.onerror = () => {
          console.error("Failed to load from official CDN, trying jsDelivr...");
          // Fallback to jsDelivr
          const fallback = document.createElement("script");
          fallback.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
          fallback.async = true;
          fallback.onload = () => setTimeout(() => resolve(), 1000);
          fallback.onerror = () => reject(new Error("Failed to load Pyodide from any CDN"));
          document.head.appendChild(fallback);
        };
        document.head.appendChild(script);
      });
    }

    // Wait for Pyodide global to be available
    let attempts = 0;
    const maxAttempts = 200;
    while (!(globalThis as any).Pyodide && !(globalThis as any).PyodideModule && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      attempts++;
    }

    const Pyodide = (globalThis as any).Pyodide || (globalThis as any).PyodideModule;
    
    if (!Pyodide) {
      throw new Error(`Pyodide global not available after ${attempts * 50}ms. Check browser console for loading errors.`);
    }

    // Initialize Pyodide
    pyodide = await Pyodide.loadPyodide({
      indexURL: "https://cdn.pyodide.org/releases/latest/",
    });
    
    isLoading = false;
    return pyodide;
  } catch (error) {
    isLoading = false;
    console.error("Failed to load Pyodide:", error);
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
