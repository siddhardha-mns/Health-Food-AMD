# 🌿 NutriSense AI — Health Food Tracker

> **AMD Ideathon Project** — AI-powered food analysis, nutrition tracking, and gamification platform.

---

## 🏗 Architecture

```
amd-ideathon/
├── backend/          # Node.js + Express + TypeScript API  
│   └── src/
│       ├── config/          # Zod-validated env config  
│       ├── middleware/       # Error handling, image upload  
│       ├── repositories/     # In-memory / Firestore data layer  
│       ├── routes/           # API route handlers  
│       ├── services/         # Vision AI, Sarvam AI, Gamification  
│       ├── utils/            # Health score calculator (Nutri-Algorithm)  
│       ├── validators/       # Zod schemas & TypeScript types  
│       └── server.ts         # Express entry point  
└── frontend/         # React + Vite + TypeScript + Tailwind CSS
    └── src/
        ├── api/              # Axios client  
        ├── components/ui/    # Card, Button, Navbar  
        ├── hooks/            # useNutrients, useGamification  
        ├── views/            # Dashboard, ScanView, Gamification, Chat  
        └── App.tsx  
```

---

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your API keys
npm run dev            # starts at http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # starts at http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Route                  | Description                        |
|--------|------------------------|------------------------------------|
| POST   | `/api/analyze`         | Analyze food image (Vision AI)     |
| POST   | `/api/recommend`       | Get personalized meal suggestions  |
| POST   | `/api/generate-meal`   | Generate recipe from ingredients   |
| GET    | `/api/gamify/status`   | Fetch points, streaks, badges      |
| GET    | `/api/gamify/leaderboard` | Top users leaderboard           |
| POST   | `/api/chat`            | Conversational AI coach (Sarvam)   |
| GET    | `/health`              | Server health check                |

---

## ⚙️ Environment Variables

Copy `backend/.env.example` → `backend/.env` and configure:

```env
NODE_ENV=development
PORT=8080
GOOGLE_CLOUD_PROJECT=your-project-id
SARVAM_API_KEY=your-sarvam-key
VISION_API_ENABLED=false        # set true to enable Vision API
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🛠 Tech Stack

**Backend** — Node.js · Express · TypeScript · Zod · Sharp · Multer  
**Frontend** — React · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide  
**AI Services** — Google Vision API · Sarvam AI  
**Database** — Google Cloud Firestore (in-memory fallback for dev)

---

## 🎮 Gamification System

- 🔥 **Streaks** — consecutive daily logging  
- ⭐ **Points** — earned per scan, high score meal, daily log  
- 🏅 **Badges** — unlocked by hitting milestones  
- 🏆 **Tiers** — Starter → Bronze → Silver → Gold → Platinum → Diamond → Legend
