# Deployment Guide - EmojiLang

## 🚀 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account & Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub account
3. Click "Import Project"
4. Select your `Imaya-thillai/EmojiLang` repository
5. Vercel will auto-detect it's a Next.js project

### Step 2: Configure Project Settings
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Install Command**: `npm install`

### Step 3: Environment Variables
Add these variables in Vercel project settings:
- `NEXT_PUBLIC_BACKEND_URL`: Your Render backend URL (e.g., `https://emojilang-backend.onrender.com`)

### Step 4: Deploy
- Click "Deploy"
- Vercel will automatically build and deploy
- Your frontend will be live at: `https://<your-project>.vercel.app`

---

## 🖥️ Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create New Service
1. Go to Dashboard → "New +" → "Web Service"
2. Select your GitHub repository `Imaya-thillai/EmojiLang`
3. Configure the following:

### Step 3: Service Configuration
- **Name**: `emojilang-backend`
- **Environment**: `Docker`
- **Region**: Choose closest to your users
- **Branch**: `main`

### Step 4: Environment Variables
Add in Render dashboard:
```
GROQ_API_KEY=your_groq_api_key_here
FLASK_ENV=production
```

### Step 5: Build & Deploy
1. Set **Root Directory**: `backend`
2. Render will auto-detect the Dockerfile
3. Click "Create Web Service"
4. Render will build and deploy automatically
5. Your backend URL will be: `https://emojilang-backend.onrender.com`

---

## 📋 Post-Deployment Checklist

### Frontend (Vercel)
- [ ] Deployment successful
- [ ] Environment variables set
- [ ] Backend URL is correctly configured
- [ ] Test homepage loads
- [ ] Test API calls work

### Backend (Render)
- [ ] Deployment successful
- [ ] Environment variables set (GROQ_API_KEY)
- [ ] Service is active
- [ ] Health check endpoint responds

### Connection Test
After both are deployed:
1. Open your Vercel frontend URL
2. Try to run some emoji code
3. Verify it connects to your Render backend

---

## 🔗 API Endpoints (After Deployment)

**Backend Base URL**: `https://emojilang-backend.onrender.com`

- `POST /compile` - Compile emoji code
- `POST /transpile` - Transpile to target language
- `GET /examples` - Get code examples
- `POST /execute` - Execute transpiled code

---

## 💡 Tips

- **Cold Starts**: Render free tier may have cold starts. Upgrade to paid for better performance
- **Backend Timeout**: Ensure GROQ_API_KEY is valid for API calls
- **CORS**: Backend already has CORS enabled for all origins
- **Auto-deploy**: Both services auto-deploy on `main` branch push

---

## ❌ Troubleshooting

### Frontend not connecting to backend:
- Check `NEXT_PUBLIC_BACKEND_URL` in Vercel settings
- Verify Render backend is running

### Backend compilation errors:
- Check Python version (ensure requirements.txt is compatible)
- Verify GROQ_API_KEY is set correctly

### GROQ API calls failing:
- Validate GROQ_API_KEY in Render environment variables
- Check Groq API quotas and billing

