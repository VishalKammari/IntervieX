# PrepAI - AI-Powered Mock Interview Platform

PrepAI is a full-stack, AI-powered mock interview preparation platform built using the MERN stack (MongoDB, Express, React, Node.js). It offers a sleek, modern SaaS interface with real-time speech dialogue, voice-to-text transcription, automated question generation based on user resumes, and precise response evaluations.

---

## Key Features

- **Authentication System**: Secure register/login sessions managed via JWT tokens and bcrypt password encryption.
- **Resume File parsing**: Upload and parse PDF, DOCX, or TXT resumes (powered by `pdf-parse` and `mammoth` on memory storage).
- **AI Question Generation**: Creates 5-6 tailored technical, behavioral, and scenario questions using **Gemini API**.
- **Real-time Audio Conversation**: 
  - **Text-to-Speech**: AI speaks generated questions using **Sarvam TTS API** (`bulbul:v3`) with native browser synthesis fallback.
  - **Speech-to-Text**: Candidate speech recorded via HTML5 Audio is transcribed through **Sarvam STT API** (`saaras:v3`) with edit-ready transcript interfaces.
- **Interactive Audio Waveforms**: Custom HTML5 Canvas rendering of microphone audio frequencies.
- **AI Evaluation Dashboard**: Complete score evaluations (0-100), strength/weakness analysis, suggested roads, and sample answer comparisons.
- **PDF Report Downloads**: Native print layouts optimized for downloading complete interview summaries.
- **Sleek Minimal Design**: Glassmorphic panels, dark theme defaults, smooth interactive micro-animations.

---

## Tech Stack

### Backend
- **Node.js** & **Express.js** (REST API)
- **MongoDB** & **Mongoose** (Database schemas)
- **Multer** (File upload memory handling)
- **pdf-parse** & **mammoth** (Document text extraction)
- **JSONWebToken** & **Bcryptjs** (Security protocols)

### Frontend
- **React.js** & **Vite** (Build pipeline)
- **Tailwind CSS** (Styling rules)
- **Framer Motion** (Page animations)
- **Recharts** (Performance charts)
- **Axios** (Token-injected request helper)
- **React Hook Form** (Validated client inputs)

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed locally (v18+ recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally

### Local Environment Variables

#### 1. Backend (`backend/.env`)
Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/interview-mocker
JWT_SECRET=super_secret_interview_mocker_jwt_key
GEMINI_API_KEY=your_gemini_api_key
SARVAM_API_KEY=your_sarvam_api_key
```

*Note: If no Gemini or Sarvam API keys are provided, the platform automatically activates mock fallbacks for testing. Questions are generated locally, and speech synthesis falls back to native Web Speech API.*

### Running the Application

1. **Install Dependencies**:
   From the root folder, run:
   ```bash
   npm run install-all
   ```

2. **Launch Backend API**:
   From the root folder, run:
   ```bash
   npm run backend
   ```
   *The server starts on port `5000`.*

3. **Launch Frontend App**:
   From the root folder, run:
   ```bash
   npm run frontend
   ```
   *Vite serves the client interface on port `3000` with proxies routing `/api` to the backend.*

---

## Deployment Guide

### Database (MongoDB Atlas)
1. Register for a free tier database cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. whitelist public access IPs or define target server IPs.
3. Retrieve your connection string (`mongodb+srv://...`) and write it to `MONGO_URI` in production.

### Backend API (Render, Heroku, or VPS)
1. Upload your code repository to GitHub.
2. Create a Web Service instance (e.g. on [Render](https://render.com)).
3. Define the build script command: `npm install` inside the `backend` folder.
4. Define the start script command: `node backend/src/app.js` (or configure paths).
5. Add production variables to the environments settings:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `SARVAM_API_KEY`
   - `PORT=10000` (or automatic port allocation)

### Frontend Client (Vercel, Netlify, or Amplify)
1. Create a static website instance on Vercel or Netlify.
2. Select your repository, setting:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. If deployed separately from the backend, update `vite.config.js` rewrite configurations or use an environment variable `VITE_API_URL` pointing directly to your backend endpoint for API calls.
