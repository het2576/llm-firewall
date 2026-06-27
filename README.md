# LLM Security Firewall 🛡️

An AI-powered middleware gateway that intercepts and analyzes every LLM prompt for security threats. It acts as a protective shield between your users and your LLM endpoints (like OpenAI or Gemini) to prevent prompt injection, data leakage, and jailbreaks.

## Features

- **Heuristic Analysis**: Detects known attack patterns and restricted keywords.
- **Pattern Matching**: Uses regex to block standard injections and PII leakage.
- **AI Classification**: Uses an LLM to judge the intent of ambiguous or complex prompts.
- **Graceful Fallback**: Highly optimized for deployment; heavy ML dependencies are disabled in limited-memory cloud environments automatically.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: FastAPI, Python 3.12, Uvicorn
- **Database**: PostgreSQL (Neon) with asyncpg / SQLite for local dev
- **Deployment**: Vercel (Frontend) & Railway (Backend)

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vaishnavix4/llm-firewall.git
   cd llm-firewall
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Gemini API Key and Neon Database URL.

## Deployment

This repository is pre-configured for Serverless/PaaS deployments:
- **Backend**: Contains a `Procfile` and `.python-version` (Python 3.12) ready for **Railway**.
- **Frontend**: Standard Next.js application ready for **Vercel**. 
- Simply set `NEXT_PUBLIC_API_URL` on Vercel to point to your Railway backend!
