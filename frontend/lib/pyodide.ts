import { ExecutionResult } from "@/types";

let pyodide: any = null;
let loadPromise: Promise<any> | null = null;

const PYODIDE_CDN =
  "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/";

const PYODIDE_UNPKG =
  "https://unpkg.com/pyodide@0.25.1/";

export async function loadPyodide(): Promise<any> {
  if (pyodide) {
    return pyodide;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = initializePyodide();
  return loadPromise;
}

async function initializePyodide(): Promise<any> {
  try {
    console.log("Initializing Pyodide...");

    // Check whether loadPyodide is already available
    if (!(globalThis as any).loadPyodide) {
      await loadPyodideScript();
    }

    const loadPyodideFn = (globalThis as any).loadPyodide;

    if (!loadPyodideFn) {
      throw new Error(
        "Pyodide script loaded but loadPyodide function not found"
      );
    }

    pyodide = await Promise.race([
      loadPyodideFn({
        indexURL: PYODIDE_CDN,
      }),

      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Pyodide initialization timeout (30s)"
              )
            ),
          30000
        )
      ),
    ]);

    console.log("Pyodide initialized successfully");

    return pyodide;
  } catch (error) {
    console.error("Failed to initialize Pyodide:", error);
    loadPromise = null;
    throw error;
  }
}

async function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Avoid duplicate script injection
    const existingScript = document.querySelector(
      'script[data-pyodide="true"]'
    );

    if (existingScript) {
      waitForLoadPyodide()
        .then(resolve)
        .catch(reject);
      return;
    }

    const script = document.createElement("script");

    script.src = `${PYODIDE_UNPKG}pyodide.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-pyodide", "true");

    const timeout = setTimeout(() => {
      reject(new Error("Pyodide script load timeout"));
    }, 30000);

    script.onload = async () => {
      try {
        await waitForLoadPyodide();
        clearTimeout(timeout);
        resolve();
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    script.onerror = () => {
      clearTimeout(timeout);
      reject(
        new Error("Failed to load Pyodide script")
      );
    };

    document.head.appendChild(script);
  });
}

async function waitForLoadPyodide(): Promise<void> {
  let attempts = 0;

  while (
    !(globalThis as any).loadPyodide &&
    attempts < 100
  ) {
    await new Promise((resolve) =>
      setTimeout(resolve, 100)
    );

    attempts++;
  }

  if (!(globalThis as any).loadPyodide) {
    throw new Error(
      "loadPyodide function not available"
    );
  }
}

export async function runCode(
  code: string
): Promise<ExecutionResult> {
  try {
    const py = await loadPyodide();

    const wrappedCode = `
import sys
from io import StringIO

_old_stdout = sys.stdout
_buffer = StringIO()
sys.stdout = _buffer

try:
${code
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n")}
finally:
    output = _buffer.getvalue()
    sys.stdout = _old_stdout

output
`;

    const result = await Promise.race([
      (async () => {
        try {
          const output =
            await py.runPythonAsync(wrappedCode);

          return {
            output: String(output ?? ""),
            error: null,
          };
        } catch (err) {
          return {
            output: "",
            error:
              err instanceof Error
                ? err.message
                : String(err),
          };
        }
      })(),

      new Promise<ExecutionResult>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Python execution timeout (10s)"
              )
            ),
          10000
        )
      ),
    ]);

    return result;
  } catch (err) {
    return {
      output: "",
      error:
        err instanceof Error
          ? err.message
          : String(err),
    };
  }
}