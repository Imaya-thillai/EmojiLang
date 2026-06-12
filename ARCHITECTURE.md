# EmojiLang Architecture & Codebase Guide

Understanding how EmojiLang works under the hood.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend                       │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ Hero.tsx     │  │ EmojiEditor  │  │ CodeOutput   │   │   │
│  │  │ (Landing)    │  │ (Textarea)   │  │ (Display)    │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐                     │   │
│  │  │EmojiKeyboard │  │ExecutionPanel│                     │   │
│  │  │(Emoji Grid)  │  │(Terminal)    │                     │   │
│  │  └──────────────┘  └──────────────┘                     │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              Pyodide (Python WASM)               │   │   │
│  │  │       (Runs Python code in browser)              │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│                    POST /api/transpile                            │
│                    ↓↓↓ Emoji Code ↓↓↓                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Backend (Server)                         │
│                      Flask + Groq API                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Flask Application (app.py)                  │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ POST /api/transpile                              │   │   │
│  │  │  1. Receive emoji_code + target_language        │   │   │
│  │  │  2. Build Groq API request                       │   │   │
│  │  │  3. Call LLaMA 3.3 70B model                     │   │   │
│  │  │  4. Parse JSON response                          │   │   │
│  │  │  5. Return transpiled code                       │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ GET /api/health                                  │   │   │
│  │  │  Returns: {"status": "ok"}                       │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ GET /api/examples                                │   │   │
│  │  │  Returns: Array of 4 built-in examples           │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│                    Call Groq API                                  │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Groq Cloud (LLaMA 3.3 70B Model)                        │   │
│  │  - Fast inference                                         │   │
│  │  - Understands EmojiLang syntax                           │   │
│  │  - Returns JSON with transpiled code                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: How Code Transpiles

### Step 1: User Writes Emojis
```
User types: 📢 📝"Hello"
→ Input stored in React state: emojiCode
```

### Step 2: Transpile Button Clicked
```
Frontend sends:
POST /api/transpile
{
  "emoji_code": "📢 📝\"Hello\"",
  "target_language": "python"
}
```

### Step 3: Backend Receives Request
```python
# app.py - /api/transpile endpoint
emoji_code = request.json.get("emoji_code")
target_language = request.json.get("target_language")

# Build Groq prompt
user_prompt = f"Transpile to {target_language}:\n{emoji_code}"
```

### Step 4: Call Groq API
```python
message = groq_client.messages.create(
    model="llama-3.3-70b-versatile",
    temperature=0.1,  # Low = consistent output
    max_tokens=2000,
    system=SYSTEM_PROMPT,  # Tells model about EmojiLang
    messages=[{"role": "user", "content": user_prompt}]
)
```

### Step 5: Parse Response
```python
# Groq returns JSON:
{
  "transpiled_code": "print('Hello')",
  "explanation": ["Print a string"],
  "detected_constructs": ["print statement"],
  "success": true
}
```

### Step 6: Send Back to Frontend
```json
HTTP 200 OK
{
  "transpiled_code": "print('Hello')",
  ...
}
```

### Step 7: Display & Execute
```
Frontend receives response →
Show in CodeOutput component →
If Python: auto-run in Pyodide →
Show output in ExecutionPanel
```

---

## 📁 Backend Codebase

### `app.py` Structure

```python
# 1. Imports & Setup
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

# 2. Initialize
app = Flask(__name__)
CORS(app)
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 3. System Prompt
SYSTEM_PROMPT = "You are EmojiLang Transpiler..."
EXAMPLES = [...]

# 4. Helper Functions
def strip_markdown_fences(response_text):
    """Remove ```json``` from response"""
    
# 5. API Endpoints
@app.route("/api/health", methods=["GET"])
@app.route("/api/examples", methods=["GET"])
@app.route("/api/transpile", methods=["POST"])
```

### Key Points

- **Stateless:** No database, no user tracking
- **Simple:** <200 lines of code
- **CORS Enabled:** Works with frontend on different port
- **Error Handling:** Validates input, catches JSON parse errors
- **Markdown Stripping:** Groq sometimes wraps JSON in ```; we remove it

---

## 📁 Frontend Codebase

### Component Tree

```
app/page.tsx (Main Page)
├── Hero.tsx
│   └── Animated intro + snippets carousel
├── EmojiEditor.tsx
│   ├── Textarea with line numbers
│   ├── Transpile button
│   └── Character/line count
├── LanguageSelector.tsx
│   └── Python | JavaScript | Java (toggle)
├── EmojiKeyboard.tsx
│   ├── Tabs: Variables, Control Flow, I/O, Math, Logic, Functions
│   ├── Grid of emoji buttons
│   └── Quick digits (0️⃣-9️⃣)
├── CodeOutput.tsx
│   ├── Side-by-side: Emoji vs Transpiled code
│   ├── Copy button
│   ├── Detected constructs badges
│   └── Step-by-step explanation accordion
└── ExecutionPanel.tsx
    ├── Terminal-style output
    ├── Run Again button
    └── Shows stdout/stderr
```

### State Management (in page.tsx)

```typescript
const [emojiCode, setEmojiCode] = useState<string>("");
const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>("python");
const [result, setResult] = useState<TranspileResult | null>(null);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
const [examples, setExamples] = useState<EmojiExample[]>([]);
const [hasExecuted, setHasExecuted] = useState<boolean>(false);
```

---

## 🔗 Key Integrations

### 1. Pyodide (Python WASM)

**Where:** `frontend/lib/pyodide.ts`

```typescript
// Lazy load Pyodide from CDN
const py = await loadPyodide();

// Run code
const result = await py.runPythonAsync(code);

// Capture output via StringIO
```

**Why:** No backend needed to run Python code. Runs entirely in browser.

### 2. Groq API

**Where:** `backend/app.py`

**Model:** `llama-3.3-70b-versatile`
**Temperature:** 0.1 (consistent output)
**Max Tokens:** 2000

**System Prompt:** Tells LLM what EmojiLang syntax means

### 3. Next.js Features Used

- **App Router:** Server/client routing
- **Dynamic Imports:** Pyodide loaded on-demand
- **Environment Variables:** `NEXT_PUBLIC_API_URL`
- **TypeScript:** Full type safety
- **Image Optimization:** Built-in (if we added images)

### 4. TailwindCSS + Framer Motion

**Styling:** Tailwind for responsive grid/flexbox
**Animations:** Framer Motion for:
- Entrance animations (slideIn)
- Hover effects (scale, glow)
- Component transitions

---

## 🧪 Testing Ideas

### Backend Tests

```python
# test_app.py
def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_transpile_hello_world():
    response = client.post("/api/transpile", json={
        "emoji_code": "📢 📝\"Hello\"",
        "target_language": "python"
    })
    assert response.status_code == 200
    assert "print" in response.json()["transpiled_code"]
```

### Frontend Tests

```typescript
// __tests__/page.test.tsx
describe("EmojiLang UI", () => {
  it("should load examples", async () => {
    render(<Home />);
    const dropdown = await screen.findByText(/Load Example/);
    expect(dropdown).toBeInTheDocument();
  });
});
```

---

## 🚀 Performance Optimization

### Frontend
- ✅ Image optimization (Vercel)
- ✅ Code splitting (Next.js)
- ✅ CSS-in-JS minification (Tailwind)
- ✅ Lazy loading Pyodide
- ⏳ Could add: Route prefetching, image lazy loading

### Backend
- ✅ Temperature=0.1 keeps inference fast
- ✅ Max tokens=2000 limits API cost
- ✅ Groq API is very fast (50+ tokens/sec)
- ⏳ Could add: Caching, rate limiting, analytics

---

## 🔐 Security Considerations

### What We Have
- ✅ No authentication (intentional—demo app)
- ✅ CORS enabled for Vercel domain
- ✅ Input validation (emoji_code length, language enum)
- ✅ Groq API key in env (never in code)

### What's Missing (for production)
- ⚠️ Rate limiting (prevent abuse)
- ⚠️ API key authentication for backend
- ⚠️ Python code sandboxing (Pyodide runs untrusted code!)
- ⚠️ HTTPS-only (auto on Vercel/Render)
- ⚠️ CSP headers (partially added)

---

## 🎯 Extending EmojiLang

### Add a New Emoji

1. **Update System Prompt** (app.py)
   ```python
   SYSTEM_PROMPT = "... 🆕=new_keyword, ..."
   ```

2. **Add to Keyboard** (EmojiKeyboard.tsx)
   ```typescript
   { emoji: "🆕", meaning: "new keyword", category: "Variables" }
   ```

3. **Test**
   - Try transpiling code with 🆕
   - Groq should understand (if it's in prompt)

### Add New Language Support

1. **Update Backend** (app.py)
   ```python
   if target_language not in ["python", "javascript", "java", "rust"]:
       # Add "rust"
   ```

2. **Update Types** (types/index.ts)
   ```typescript
   export type TargetLanguage = "python" | "javascript" | "java" | "rust";
   ```

3. **Test**
   - Transpile to Rust
   - Should work!

---

## 📊 Project Statistics

- **Backend:** ~200 lines (Python/Flask)
- **Frontend:** ~1500 lines (React/TypeScript)
- **Total:** ~2000 lines of code
- **Components:** 7 (Hero, Editor, Keyboard, Language, Output, Execution, + main page)
- **API Endpoints:** 3 (health, examples, transpile)
- **Emojis:** 24+ keywords

---

## 🔍 Debugging Tips

### Backend Issues
```bash
# Check Flask logs
python app.py

# Test endpoint directly
curl -X POST http://localhost:5000/api/transpile \
  -H "Content-Type: application/json" \
  -d '{"emoji_code":"📢 📝\"hi\"","target_language":"python"}'
```

### Frontend Issues
```bash
# Browser DevTools
F12 → Console → Check errors
F12 → Network → See API calls

# Next.js logs
npm run dev → Check terminal for errors
```

### Pyodide Issues
```javascript
// In browser console
import("https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js")
  .then(m => m.loadPyodide())
  .then(py => console.log(py))
```

---

## 🎓 Learning Resources

- **Groq API:** [console.groq.com/docs](https://console.groq.com/docs)
- **Pyodide:** [pyodide.org](https://pyodide.org)
- **Next.js:** [nextjs.org/docs](https://nextjs.org/docs)
- **Flask:** [flask.palletsprojects.com](https://flask.palletsprojects.com)
- **Framer Motion:** [framer.com/motion](https://www.framer.com/motion/)

---

## ✨ Fun Facts

- Groq API processes **50+ tokens/second** (very fast!)
- Pyodide is **~30MB** (downloaded on first Python run)
- System prompt is **critical** for consistent transpilation
- Emojis are **UTF-8 encoded** (4+ bytes each)
- This entire app was **built with GitHub Copilot** 🤖

---

**Ready to contribute? Start small, add an emoji, test it, and submit a PR!** 🚀

