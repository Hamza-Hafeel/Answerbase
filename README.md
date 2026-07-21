# AnswerBase

**Live Demo:** [https://answerbase.nexusmod.works/](https://answerbase.nexusmod.works/)

AnswerBase is a full-stack, multi-tenant enterprise application that transforms help articles, product guides, and policies into an intelligent AI support agent. The system utilizes advanced Retrieval-Augmented Generation (RAG) to ensure the AI agent provides highly accurate answers based strictly on your uploaded documents. 

It provides an intuitive management dashboard for administrators and a lightweight, embeddable chat widget script for seamless integration into any external website.

### Key Features

| Feature | Description |
|---|---|
| Multi-Format Document Ingestion | Upload **PDF, TXT, MD, CSV, PNG, JPG** files. Images are processed with Gemini Vision OCR for handwritten note support. |
| RAG-Powered AI Chat | Responses are strictly grounded to uploaded documents using vector similarity search (pgvector + HNSW indexing). |
| Embeddable Widget | A single `<script>` tag drops a fully styled, animated chat widget onto any external website. |
| API Key Management | Tenants generate isolated API keys for building custom integrations (mobile apps, Slack bots, email responders). |
| Analytics Dashboard | 14-day message volume charts, top questions, document counts, and usage tracking against plan limits. |
| Conversation History | Full searchable log of every visitor conversation with timestamps and message-level detail. |
| Widget Customization | Tenants can rename their bot and customize the welcome message directly from the dashboard. |
| Stripe Billing | Three subscription tiers (Free / Pro / Business) with Stripe Checkout, webhook-driven plan upgrades, and usage metering. |
| Google OAuth | One-click sign-in with Google, alongside traditional email/password registration. |
| Superadmin Panel | Platform-wide admin dashboard showing all tenants, user counts, document counts, MRR, and daily message volume. |

---

## Preview

<div align="center">
  <img src="frontend/public/og-image-v3.jpg" alt="AnswerBase Platform Preview" width="100%" style="border-radius: 8px;" />
</div>

---

## System Architecture

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

## What makes AnswerBase different?

While tools like ChatGPT, Google Gems, and NotebookLM are built for general-purpose use or personal research, AnswerBase is a **B2B Enterprise SaaS product**.

1. **It Lives on the Customer's Website:** Unlike Custom GPTs where users must visit OpenAI's website, AnswerBase provides an `embed.js` script. Your customers (businesses) drop this script into their own HTML, instantly adding a customized AI widget to their e-commerce store or SaaS platform.
2. **Strict Hallucination Prevention:** Standard LLMs will answer off-topic questions or make up facts. AnswerBase utilizes a highly-tuned **RAG pipeline** (Retrieval-Augmented Generation). The AI is strictly grounded to the uploaded documents. If a customer asks a question not covered in the business's policies, the AI will politely decline rather than guessing.
3. **Automated Customer Support (Not Research):** While NotebookLM is a brilliant tool for private study, AnswerBase is designed to automate public-facing customer service. Businesses pay a monthly Stripe subscription to train the AI on their data and reduce their human support tickets 24/7.
4. **Multi-Format Ingestion with OCR:** The platform isn't limited to plain text. Businesses can upload **PDF, TXT, MD, CSV, PNG, and JPG** files. Utilizing state-of-the-art vision models, AnswerBase natively performs OCR to extract and index text from scanned documents and even messy handwritten notes.
5. **API-First Custom Integrations:** While the embeddable widget is the easiest way to launch, AnswerBase is built API-first. Tenants can generate secure, isolated **API Keys** from their dashboard to build entirely custom interfaces, integrate into mobile apps, or hook into automated email responders.

---

## Technology Stack

### Frontend Application
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS, Framer Motion (for widget animations)
- **Authentication:** Custom JWT authentication / Google OAuth
- **Language:** TypeScript

### Backend API
- **Framework:** FastAPI (Python 3.10+)
- **Database Driver:** asyncpg (async connection pooling)
- **AI Integration:** OpenAI-compatible API Gateway
- **Server:** Uvicorn

### Infrastructure & Services
- **Database:** PostgreSQL (with pgvector for embeddings)
- **Payments:** Stripe API (Subscriptions & Webhooks)

---

## Comprehensive Project Structure

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

## Environment Variables

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

## Local Development Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **PostgreSQL** database running locally or remotely
- **pnpm** package manager (recommended)

### 2. Clone the Repository
```bash
git clone https://github.com/Hamza-Hafeel/Answerbase.git
cd Answerbase
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

## Embedding the Widget

To integrate the AnswerBase AI agent into an external website, tenants simply copy their unique snippet from the dashboard and paste it into their website's HTML `<head>` or before the closing `</body>` tag:

```html
<script src="https://answerbase.nexusmod.works/embed.js" data-tenant-id="YOUR_TENANT_ID"></script>
```
The script is highly optimized, loads asynchronously, and mounts a responsive chat interface in the bottom right corner of the viewport.

---

## API Integrations (Custom UIs)

Tenants who want to build their own custom user interfaces (like native iOS/Android apps) can generate an **API Key** from their dashboard and query their isolated RAG pipeline directly via REST API.

**Example Request:**
```bash
curl -X POST "https://answerbase.nexusmod.works/api/chat/native" \
  -H "Authorization: Bearer ab_YourSecureApiKeyHere" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the refund policy?",
    "history": []
  }'
```

---

## Security Guidelines

This repository is configured with a strict `.gitignore` to prevent the accidental exposure of sensitive data. 
- **Never commit `.env` files.**
- Keep `STRIPE_SECRET_KEY` and `AI_GATEWAY_API_KEY` strictly confidential.
- The `/backend/security.py` module enforces strict JWT validation on all protected routes to ensure data isolation between tenants.

---

## 🗺️ Future Roadmap

- **Slack / Discord Integrations:** Allow businesses to deploy their agent directly into internal communication channels.
- **Multilingual Support:** Auto-translate documents and provide real-time translation for global customer bases.
- **Web Crawling:** Ingest documentation directly from live website URLs in addition to static file uploads.
- **Email Ticket Integration:** Auto-respond to customer support emails using the RAG pipeline.

---

## 📄 License

This project is built and maintained by [Hamza Hafeel](https://github.com/Hamza-Hafeel).
