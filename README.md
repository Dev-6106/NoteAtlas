<div align="center">

  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="52" alt="React" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NodeJS-Dark.svg" width="52" alt="NodeJS" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="52" alt="TypeScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="52" alt="TailwindCSS" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/MongoDB.svg" width="52" alt="MongoDB" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Firebase-Dark.svg" width="52" alt="Firebase" />

  <h1>🌟 NoteAtlas</h1>

  <p><strong>Your intelligent, AI-powered document workspace — inspired by Google NotebookLM.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/LangChain-enabled-1C3C3C?style=flat-square&logo=langchain&logoColor=white" alt="LangChain" />
    <img src="https://img.shields.io/badge/License-ISC-blue?style=flat-square" alt="License" />
  </p>

  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-environment-variables">Environment Variables</a> •
    <a href="#-contributing">Contributing</a>
  </p>

  <br/>

  > Upload documents. Ask questions. Visualize ideas. Listen anywhere.

</div>

---

## 📖 Overview

**NoteAtlas** is a full-stack, AI-driven document workspace that transforms how you interact with your notes and files. Upload PDFs and text documents, then use the power of Google Gemini and LangChain to chat with your content, auto-generate interactive mind maps, and even listen to audio summaries on the go.

Built with a React 19 frontend, a Node.js/Express/TypeScript backend, and a robust vector-search pipeline (Pinecone + MongoDB), NoteAtlas is designed for researchers, students, and knowledge workers who need more than a plain document viewer.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 📄 | **Document Processing** | Upload PDFs and plain text; content is parsed, chunked, and indexed for fast semantic retrieval. |
| 🧠 | **AI-Powered Chat** | Ask natural language questions and get grounded answers via Google Gemini + LangChain RAG. |
| 🗺️ | **Mind Map Generation** | Automatically build and explore interactive visual mind maps from your documents using Mind-Elixir. |
| 🎧 | **Audio Summaries** | Convert document insights to speech with Google TTS — perfect for commutes or passive review. |
| ⚡ | **Real-time Feedback** | WebSocket integration streams processing status so you're never left waiting in the dark. |
| 🔐 | **Secure Authentication** | Firebase Auth handles sign-up, login, and session management out of the box. |
| 💳 | **Flexible Payments** | Subscription and credit-pack billing via Stripe (global) and Razorpay (India). |

---

## 🛠️ Tech Stack

### Frontend
| Category | Technology |
|---|---|
| Framework | React 19, Vite |
| Styling | Tailwind CSS 4, Radix UI |
| State Management | Redux Toolkit |
| Routing | React Router 7 |
| Auth | Firebase |
| Payments | Stripe React, Razorpay |
| Visualization | Mind-Elixir |
| Rendering | React Markdown |

### Backend
| Category | Technology |
|---|---|
| Runtime | Node.js 18+, Express, TypeScript |
| AI & Orchestration | LangChain, LangGraph, Google GenAI (Gemini) |
| Databases | MongoDB (primary), Supabase (storage) |
| Vector Store | Pinecone |
| Auth | Firebase Admin SDK |
| Payments | Razorpay |
| Audio | Google TTS API, Fluent-FFmpeg |
| Real-time | WebSockets |
| Parsing | PDF-Parse |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed and accounts created before you begin:

- **Node.js** v18 or higher
- **npm** or **yarn**
- Active accounts for: [Firebase](https://firebase.google.com), [Pinecone](https://www.pinecone.io), [MongoDB Atlas](https://www.mongodb.com/atlas), [Google AI Studio (Gemini)](https://aistudio.google.com)

### 1. Clone the repository

```bash
git clone https://github.com/Dev-6106/NoteAtlas.git
cd NoteAtlas
```

### 2. Configure environment variables

Set up your `.env` files in both `frontend/` and `backend/` directories before starting the servers. See the [Environment Variables](#-environment-variables) section below for all required keys.

### 3. Start the backend

```bash
cd backend
npm install
npm run dev
```

The backend server will start on the port defined in your `.env` (default: `8000`).

### 4. Start the frontend

Open a **new terminal window**:

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start at `http://localhost:5173` by default.

> **Tip:** Run both servers simultaneously — the frontend proxies API requests to the backend via `VITE_API_URL`.

---

## 🔐 Environment Variables

Create `.env` files in each directory and populate them with the values from your service dashboards.

### `backend/.env`

```env
# Server
PORT=8000

# Database
DB_URL=your_mongodb_connection_string

# Vector Store
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index

# AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### `frontend/.env`

```env
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend
VITE_API_URL=http://localhost:8000

# Payments
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🗂️ Project Structure

```
NoteAtlas/
├── backend/
│   ├── src/
│   │   ├── app/           # Express routes and controllers
│   │   ├── config/        # Environment and DB config
│   │   ├── lib/           # Database setup and common libraries
│   │   ├── middleware/    # Express middlewares (auth, etc)
│   │   ├── pipelines/     # Data ingestion and chunking pipelines
│   │   ├── prompt/        # LLM system prompts
│   │   ├── services/      # Core business logic and AI integrations
│   │   ├── types/         # TypeScript definitions
│   │   └── util/          # Helper utilities
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/           # API fetch functions
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable UI components
│   │   ├── config/        # Environment configurations
│   │   ├── helper/        # Helper functions
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # UI layout wrappers
│   │   ├── lib/           # Third-party integrations
│   │   ├── pages/         # Route-level page components
│   │   ├── router/        # React Router configuration
│   │   ├── store/         # Redux state slices
│   │   ├── types/         # TypeScript definitions
│   │   └── util/          # Utility functions
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature-name`
5. Open a Pull Request

Please check the [issues page](https://github.com/Dev-6106/NoteAtlas/issues) for open tasks before starting something new.

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](./LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using React, Node.js, and LangChain.</p>
  <p>
    <a href="https://github.com/Dev-6106/NoteAtlas">⭐ Star this repo</a> if you find it useful!
  </p>
</div>
