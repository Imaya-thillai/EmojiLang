# EmojiLang - Quick Start Guide

Get EmojiLang running locally in 5 minutes!

---

## ⚡ Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **Python** 3.9+ ([python.org](https://www.python.org))
- **Groq API Key** (free from [console.groq.com](https://console.groq.com))

---

## 🚀 Quick Setup (Option 1: Separate Terminals)

### Terminal 1: Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Groq API key
# GROQ_API_KEY=gsk_xxxxxxxx...

# Run the server
python app.py
```

The backend runs on **http://localhost:5000**

### Terminal 2: Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local
# Should already have: NEXT_PUBLIC_API_URL=http://localhost:5000

# Run dev server
npm run dev
```

The frontend runs on **http://localhost:3000**

### 🎉 Done!

Open **http://localhost:3000** in your browser and start coding with emojis!

---

## 🐳 Quick Setup (Option 2: Docker)

```bash
# Make sure Docker is running

# Build and run both services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

Press `Ctrl+C` to stop.

---

## 🧪 Test It Works

### Try the Hello World Example:

1. Go to http://localhost:3000
2. In the editor, paste:
```
📢 📝"Hello, World! 🌍"
```
3. Click **"Transpile →"**
4. See the Python code appear on the right
5. Python terminal shows the output

### Try a Loop:

```
🔁 📦i ➡️ 1️⃣ 3️⃣
  📢 i
```

---

## 🛠️ Development Commands

### Backend
```bash
cd backend

# Run tests (if added)
pytest

# Format code
black .

# Check types
mypy .
```

### Frontend
```bash
cd frontend

# Build for production
npm run build

# Run tests (if added)
npm test

# Check TypeScript errors
npm run type-check

# Format code
npm run lint
```

---

## 📝 Environment Variables

### Backend (`.env`)
```
GROQ_API_KEY=gsk_xxxxxxxx...  # Your Groq API key
FLASK_ENV=development          # development or production
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000  # Backend URL
```

---

## 🐛 Troubleshooting

### "Cannot find module 'flask'"
→ Activate virtual environment: `source venv/bin/activate`

### "npm: command not found"
→ Install Node.js from [nodejs.org](https://nodejs.org)

### "GROQ_API_KEY not found"
→ Make sure you created `.env` file and added your key

### "Cannot reach localhost:5000"
→ Check backend is running: `python app.py` shows no errors

### "404 on /api/transpile"
→ Backend not running or wrong URL in frontend `.env.local`

---

## 🎨 Make Changes

### Edit Backend (`app.py`)
- Flask auto-reloads changes
- Restart if needed: press `Ctrl+C` and run `python app.py` again

### Edit Frontend (components)
- Next.js hot-reloads changes automatically
- Just save and see changes in browser

---

## 📚 Next Steps

- ✅ Try all 4 built-in examples from the dropdown
- ✅ Create your own emoji programs
- ✅ Share programs using the **🔗 Share** button
- ✅ Try the easter egg: use 🥚 in your code
- ✅ Read the [README.md](./README.md) for full keyword reference

---

## 🚀 Deploy to Production

When ready to share with the world:

See [DEPLOYMENT.md](./DEPLOYMENT.md) for steps to deploy on Vercel + Render.

---

## 💬 Need Help?

1. Check error messages in browser console (F12)
2. Check backend logs in terminal
3. Read the [README.md](./README.md) documentation
4. Check [Groq API docs](https://console.groq.com/docs)

---

**Happy coding! 🌍💬✨**
