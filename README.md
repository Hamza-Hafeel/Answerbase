# AnswerBase

**Live Demo:** [https://answerbase.nexusmod.works/](https://answerbase.nexusmod.works/)

AnswerBase is a full-stack, multi-tenant enterprise application that transforms help articles, product guides, and policies into an intelligent AI support agent. The system utilizes advanced Retrieval-Augmented Generation (RAG) to ensure the AI agent provides highly accurate answers based strictly on your uploaded documents. 

It provides an intuitive management dashboard for administrators and a lightweight, embeddable chat widget script for seamless integration into any external website.

---

## 📸 Preview

<div align="center">
  <img src="frontend/public/og-image-v3.jpg" alt="AnswerBase Platform Preview" width="100%" style="border-radius: 8px;" />
</div>

---

## 🏗️ System Architecture

The application is built on a decoupled architecture, separating the client-facing interfaces from the AI processing engine.

1. **Client Interfaces (Next.js):** 
   - **Management Dashboard:** A secure portal for uploading documents, generating API keys, viewing chat analytics, and managing billing.
   - **Embeddable Widget:** A pure JavaScript bundle (`embed.js`) that injects a responsive chat UI into client websites.
2. **API & AI Engine (FastAPI):**
   - Handles RESTful API requests, JWT authentication, and Stripe webhooks.
   - Orchestrates the RAG pipeline: converting uploaded documents into vector embeddings and querying the LLM contextually.
3. **Data Layer (PostgreSQL):**
   - Stores tenant data, conversation history, API keys, and billing records.

---

## 🛠️ Technology Stack

### Frontend Application
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS, Framer Motion (for widget animations)
- **Authentication:** Custom JWT authentication / Google OAuth
- **Language:** TypeScript

### Backend API
- **Framework:** FastAPI (Python 3.10+)
- **Database ORM:** SQLAlchemy (async)
- **AI Integration:** OpenAI-compatible API Gateway
- **Server:** Uvicorn

### Infrastructure & Services
- **Database:** PostgreSQL (with pgvector for embeddings)
- **Payments:** Stripe API (Subscriptions & Webhooks)

---

## 📂 Comprehensive Project Structure

```text
answerbase/
├── backend/                       # Python FastAPI Backend
│   ├── main.py                    # Application entry point and API route definitions
│   ├── ai.py                      # RAG implementation, vector embeddings, and LLM orchestration
│   ├── db.py                      # SQLAlchemy database connections and session management
│   ├── security.py                # JWT generation, validation, and route protection
│   ├── requirements.txt           # (or pyproject.toml) Python dependency lockfile
│   └── backend.egg-info/          # Python package metadata
│
├── frontend/                      # Next.js React Frontend
│   ├── app/                       # App Router architecture
│   │   ├── (auth)/                # Login, Register, and OAuth routes
│   │   ├── dashboard/             # Protected tenant dashboard (Documents, Analytics, Billing)
│   │   ├── api/                   # Next.js Serverless API routes (if applicable)
│   │   ├── globals.css            # Global Tailwind directives
│   │   ├── layout.tsx             # Root HTML layout and global providers
│   │   └── page.tsx               # Public marketing landing page
│   ├── components/                # Reusable React components (UI library, Chat bubbles)
│   ├── lib/                       # Utility functions, Auth contexts, and hooks
│   ├── public/                    # Static assets
│   │   ├── embed.js               # The compiled JavaScript widget for external sites
│   │   ├── og-image-v3.jpg        # Optimized Open Graph preview image
│   │   └── ...                    # Icons and static images
│   ├── tailwind.config.ts         # Tailwind CSS design system configuration
│   └── package.json               # Node.js dependency declarations
│
├── .env.example                   # Template for required environment variables
├── .gitignore                     # Version control exclusion rules
├── docker-compose.yml             # Docker orchestration for local development
└── package.json                   # Root workspace scripts for concurrent execution
```

---

## ⚙️ Environment Variables

Before starting the application, you must configure your environment variables. Duplicate the `.env.example` file to `.env` in the root directory and populate the following fields:

```ini
# --- Database Configuration ---
# Standard PostgreSQL connection string.
DATABASE_URL=postgresql://username:password@localhost:5432/answerbase

# --- AI & LLM Configuration ---
# Your OpenAI API key (or compatible gateway key) for embeddings and chat completions.
AI_GATEWAY_API_KEY=your-openai-api-key-here

# --- Authentication ---
# Used to sign JSON Web Tokens. If omitted, the system will derive a secret from the DATABASE_URL.
# JWT_SECRET=your-secure-random-string

# --- Billing (Stripe) ---
# Required if billing features are enabled.
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# --- Frontend Configuration ---
# The URL where the FastAPI backend is running (used by the Next.js client to make API requests).
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **PostgreSQL** database running locally or remotely
- **pnpm** package manager (recommended)

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/answerbase.git
cd answerbase
```

### 3. Install Dependencies

**Frontend:**
```bash
cd frontend
pnpm install
cd ..
```

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt # (or pip install -e .)
cd ..
```

### 4. Database Initialization
Ensure your PostgreSQL server is running and the database specified in your `DATABASE_URL` exists. The backend application will automatically handle schema creation and migrations on startup.

### 5. Start the Development Servers

The root directory contains a workspace `package.json` with helper scripts to run both environments simultaneously.

**Start the Next.js Frontend (runs on port 3000):**
```bash
npm run dev
```

**Start the FastAPI Backend (runs on port 8000):**
```bash
npm run backend
```

---

## 🌐 Embedding the Widget

To integrate the AnswerBase AI agent into an external website, tenants simply copy their unique snippet from the dashboard and paste it into their website's HTML `<head>` or before the closing `</body>` tag:

```html
<script src="https://answerbase.nexusmod.works/embed.js" data-tenant-id="YOUR_TENANT_ID"></script>
```
The script is highly optimized, loads asynchronously, and mounts a responsive chat interface in the bottom right corner of the viewport.

---

## 🔐 Security Guidelines

This repository is configured with a strict `.gitignore` to prevent the accidental exposure of sensitive data. 
- **Never commit `.env` files.**
- Keep `STRIPE_SECRET_KEY` and `AI_GATEWAY_API_KEY` strictly confidential.
- The `/backend/security.py` module enforces strict JWT validation on all protected routes to ensure data isolation between tenants.
