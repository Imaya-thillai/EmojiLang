from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
import re

load_dotenv()

app = Flask(__name__)
CORS(app)

# Lazy initialize Groq client to avoid startup errors
groq_client = None

def get_groq_client():
    global groq_client
    if groq_client is None:
        try:
            from groq import Groq
            groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        except Exception as e:
            print(f"Warning: Could not initialize Groq client: {e}")
            groq_client = False
    return groq_client if groq_client is not False else None

# Built-in EmojiLang examples
EXAMPLES = [
    {
        "title": "Hello World",
        "description": "Print a simple greeting message",
        "emoji_code": "📢 📝\"Hello, World! 🌍\""
    },
    {
        "title": "Loop and Print Numbers",
        "description": "Loop from 1 to 5 and print each number",
        "emoji_code": "🔁 📦i ➡️ 1️⃣ 5️⃣\n  📢 i"
    },
    {
        "title": "FizzBuzz",
        "description": "Classic FizzBuzz algorithm with emojis",
        "emoji_code": "🔁 📦i ➡️ 1️⃣ 2️⃣0️⃣\n  ❓ i ➗ 1️⃣5️⃣ ⚖️ 0️⃣\n    📢 📝\"FizzBuzz\"\n  ❗ ❓ i ➗ 3️⃣ ⚖️ 0️⃣\n    📢 📝\"Fizz\"\n  ❗ ❓ i ➗ 5️⃣ ⚖️ 0️⃣\n    📢 📝\"Buzz\"\n  ❗\n    📢 i"
    },
    {
        "title": "Function Definition",
        "description": "Define and call a greeting function",
        "emoji_code": "🏁 greet 📝name\n  📢 📝\"Hello \" 🔗 name\n  ↩️ ✅\n\ngreet 📝\"EmojiLang\""
    }
]

SYSTEM_PROMPT = """You are EmojiLang Transpiler, an expert compiler that converts EmojiLang (an emoji-based programming language) into real code. EmojiLang uses these emoji keywords:
📦=variable, 🔢=integer, 📝=string, ✅=true, ❌=false, 📢=print, 🔁=for loop, 🔄=while loop, ❓=if, ❗=else, 🏁=function, ↩️=return, 📋=list, ➕=add, ➖=subtract, ✖️=multiply, ➗=modulo or divide, ⚖️=equals, 📈=greater than, 📉=less than, ➡️=range, 🔗=concatenate, 💬=comment, 🛑=break, ⏭️=continue. Number emojis (1️⃣2️⃣3️⃣etc) = their digit values. Indentation in EmojiLang uses spaces/newlines like Python. Transpile the given EmojiLang code to the target language. Return ONLY valid JSON with no markdown, no code fences:
{
  "transpiled_code": "string (clean executable code)",
  "explanation": "array of strings (one per line explaining what that emoji line does)",
  "detected_constructs": "array of strings",
  "language": "string",
  "success": true,
  "error": null
}"""

def strip_markdown_fences(response_text):
    """Remove markdown code fences from response"""
    # Remove ```json and ```
    response_text = re.sub(r'^```(?:json)?\s*', '', response_text, flags=re.MULTILINE)
    response_text = re.sub(r'```\s*$', '', response_text, flags=re.MULTILINE)
    return response_text.strip()

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"}), 200

@app.route("/api/examples", methods=["GET"])
def examples():
    """Return built-in EmojiLang examples"""
    return jsonify(EXAMPLES), 200

# Demo responses for testing without API key
DEMO_RESPONSES = {
    "📢 📝\"Hello, World! 🌍\"": {
        "python": {
            "transpiled_code": "print(\"Hello, World! 🌍\")",
            "explanation": [
                "📢 = print statement",
                "📝 = string literal",
                "\"Hello, World! 🌍\" = the text to print"
            ],
            "detected_constructs": ["print", "string_literal"]
        },
        "javascript": {
            "transpiled_code": "console.log(\"Hello, World! 🌍\");",
            "explanation": [
                "📢 = console.log statement",
                "📝 = string literal",
                "\"Hello, World! 🌍\" = the text to print"
            ],
            "detected_constructs": ["console.log", "string_literal"]
        },
        "java": {
            "transpiled_code": "System.out.println(\"Hello, World! 🌍\");",
            "explanation": [
                "📢 = System.out.println",
                "📝 = string literal",
                "\"Hello, World! 🌍\" = the text to print"
            ],
            "detected_constructs": ["println", "string_literal"]
        }
    },
    "🔁 📦i ➡️ 1️⃣ 5️⃣\n  📢 i": {
        "python": {
            "transpiled_code": "for i in range(1, 6):\n    print(i)",
            "explanation": [
                "🔁 = for loop",
                "📦i = declare loop variable i",
                "➡️ = range operator",
                "1️⃣ 5️⃣ = from 1 to 5",
                "📢 i = print the variable i",
                "Indentation determines loop body"
            ],
            "detected_constructs": ["for_loop", "range", "print", "variable"]
        },
        "javascript": {
            "transpiled_code": "for (let i = 1; i < 6; i++) {\n    console.log(i);\n}",
            "explanation": [
                "🔁 = for loop",
                "📦i = declare loop variable i",
                "➡️ = range operator",
                "1️⃣ 5️⃣ = from 1 to 5",
                "📢 i = print the variable i"
            ],
            "detected_constructs": ["for_loop", "range", "console.log", "variable"]
        },
        "java": {
            "transpiled_code": "for (int i = 1; i < 6; i++) {\n    System.out.println(i);\n}",
            "explanation": [
                "🔁 = for loop",
                "📦i = declare loop variable i",
                "➡️ = range operator",
                "1️⃣ 5️⃣ = from 1 to 5",
                "📢 i = print the variable i"
            ],
            "detected_constructs": ["for_loop", "range", "println", "variable"]
        }
    },
    "🔁 📦i ➡️ 1️⃣ 2️⃣0️⃣\n  ❓ i ➗ 1️⃣5️⃣ ⚖️ 0️⃣\n    📢 📝\"FizzBuzz\"\n  ❗ ❓ i ➗ 3️⃣ ⚖️ 0️⃣\n    📢 📝\"Fizz\"\n  ❗ ❓ i ➗ 5️⃣ ⚖️ 0️⃣\n    📢 📝\"Buzz\"\n  ❗\n    📢 i": {
        "python": {
            "transpiled_code": "for i in range(1, 21):\n    if i % 15 == 0:\n        print(\"FizzBuzz\")\n    elif i % 3 == 0:\n        print(\"Fizz\")\n    elif i % 5 == 0:\n        print(\"Buzz\")\n    else:\n        print(i)",
            "explanation": [
                "🔁 = for loop from 1 to 20",
                "❓ = if statement (modulo 15 check)",
                "🔀 ➗ = modulo operator",
                "⚖️ 0️⃣ = equals zero",
                "📢 = print statement",
                "❗ = else/elif branch",
                "Nested conditionals for FizzBuzz logic"
            ],
            "detected_constructs": ["for_loop", "if_statement", "elif", "else", "modulo", "print", "string_literal"]
        },
        "javascript": {
            "transpiled_code": "for (let i = 1; i < 21; i++) {\n    if (i % 15 === 0) {\n        console.log(\"FizzBuzz\");\n    } else if (i % 3 === 0) {\n        console.log(\"Fizz\");\n    } else if (i % 5 === 0) {\n        console.log(\"Buzz\");\n    } else {\n        console.log(i);\n    }\n}",
            "explanation": [
                "🔁 = for loop from 1 to 20",
                "❓ = if statement (modulo 15 check)",
                "❗ = else if branches",
                "Classic FizzBuzz implementation"
            ],
            "detected_constructs": ["for_loop", "if_statement", "else_if", "else", "modulo", "console.log"]
        },
        "java": {
            "transpiled_code": "for (int i = 1; i < 21; i++) {\n    if (i % 15 == 0) {\n        System.out.println(\"FizzBuzz\");\n    } else if (i % 3 == 0) {\n        System.out.println(\"Fizz\");\n    } else if (i % 5 == 0) {\n        System.out.println(\"Buzz\");\n    } else {\n        System.out.println(i);\n    }\n}",
            "explanation": [
                "🔁 = for loop from 1 to 20",
                "❓ = if statement (modulo 15 check)",
                "❗ = else if branches",
                "Classic FizzBuzz implementation in Java"
            ],
            "detected_constructs": ["for_loop", "if_statement", "else_if", "else", "modulo", "println"]
        }
    },
    "🏁 greet 📝name\n  📢 📝\"Hello \" 🔗 name\n  ↩️ ✅\n\ngreet 📝\"EmojiLang\"": {
        "python": {
            "transpiled_code": "def greet(name):\n    print(\"Hello \" + name)\n    return True\n\ngreet(\"EmojiLang\")",
            "explanation": [
                "🏁 = function definition",
                "greet = function name",
                "📝name = string parameter",
                "📢 = print inside function",
                "🔗 = string concatenation",
                "↩️ = return statement",
                "✅ = return True",
                "Function call with argument"
            ],
            "detected_constructs": ["function_def", "parameter", "print", "string_concat", "return", "function_call"]
        },
        "javascript": {
            "transpiled_code": "function greet(name) {\n    console.log(\"Hello \" + name);\n    return true;\n}\n\ngreet(\"EmojiLang\");",
            "explanation": [
                "🏁 = function definition",
                "greet = function name",
                "📝name = string parameter",
                "📢 = console.log inside function",
                "🔗 = string concatenation with +",
                "↩️ = return statement",
                "✅ = return true"
            ],
            "detected_constructs": ["function_def", "parameter", "console.log", "string_concat", "return", "function_call"]
        },
        "java": {
            "transpiled_code": "public static boolean greet(String name) {\n    System.out.println(\"Hello \" + name);\n    return true;\n}\n\ngreet(\"EmojiLang\");",
            "explanation": [
                "🏁 = function definition",
                "greet = function name",
                "📝name = String parameter",
                "📢 = System.out.println",
                "🔗 = string concatenation",
                "↩️ = return statement",
                "✅ = return true (boolean)"
            ],
            "detected_constructs": ["function_def", "parameter", "println", "string_concat", "return", "function_call"]
        }
    }
}

@app.route("/api/transpile", methods=["POST"])
def transpile():
    """Transpile EmojiLang code to target language"""
    try:
        data = request.json
        emoji_code = data.get("emoji_code", "")
        target_language = data.get("target_language", "python")

        if not emoji_code:
            return jsonify({
                "transpiled_code": "",
                "explanation": [],
                "detected_constructs": [],
                "language": target_language,
                "success": False,
                "error": "No emoji code provided"
            }), 400

        if target_language not in ["python", "javascript", "java"]:
            return jsonify({
                "transpiled_code": "",
                "explanation": [],
                "detected_constructs": [],
                "language": target_language,
                "success": False,
                "error": f"Unsupported language: {target_language}"
            }), 400

        # Check if demo response is available
        if emoji_code in DEMO_RESPONSES and target_language in DEMO_RESPONSES[emoji_code]:
            demo_result = DEMO_RESPONSES[emoji_code][target_language]
            return jsonify({
                "transpiled_code": demo_result["transpiled_code"],
                "explanation": demo_result["explanation"],
                "detected_constructs": demo_result["detected_constructs"],
                "language": target_language,
                "success": True,
                "error": None
            }), 200

        # Check if Groq API key is valid
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key or api_key == "your_groq_api_key_here":
            return jsonify({
                "transpiled_code": "",
                "explanation": [],
                "detected_constructs": [],
                "language": target_language,
                "success": False,
                "error": "Groq API key not configured. Please set GROQ_API_KEY in .env file to use live transpilation."
            }), 500

        # Call Groq API
        user_prompt = f"Transpile this EmojiLang code to {target_language}:\n\n{emoji_code}"

        client = get_groq_client()
        if not client:
            return jsonify({
                "transpiled_code": "",
                "explanation": [],
                "detected_constructs": [],
                "language": target_language,
                "success": False,
                "error": "Groq API client failed to initialize. Check your GROQ_API_KEY."
            }), 500

        message = client.messages.create(
            model="llama-3.3-70b-versatile",
            max_tokens=2000,
            temperature=0.1,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )

        response_text = message.content[0].text
        
        # Strip markdown fences
        response_text = strip_markdown_fences(response_text)

        # Parse JSON response
        try:
            result = json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    result = json.loads(json_match.group(0))
                except json.JSONDecodeError:
                    return jsonify({
                        "transpiled_code": "",
                        "explanation": [],
                        "detected_constructs": [],
                        "language": target_language,
                        "success": False,
                        "error": "Failed to parse Groq response as JSON"
                    }), 500
            else:
                return jsonify({
                    "transpiled_code": "",
                    "explanation": [],
                    "detected_constructs": [],
                    "language": target_language,
                    "success": False,
                    "error": "No JSON found in Groq response"
                }), 500

        # Ensure result has all required fields
        result.setdefault("transpiled_code", "")
        result.setdefault("explanation", [])
        result.setdefault("detected_constructs", [])
        result.setdefault("language", target_language)
        result.setdefault("success", True)
        result.setdefault("error", None)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "transpiled_code": "",
            "explanation": [],
            "detected_constructs": [],
            "language": "python",
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
