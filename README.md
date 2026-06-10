<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="60" alt="React" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NodeJS-Dark.svg" width="60" alt="NodeJS" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="60" alt="TypeScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="60" alt="TailwindCSS" />
  <br/>
  
  <h1>🌟 NoteAtlas (NotebookLM Clone)</h1>
  <p><strong>Your intelligent, AI-powered document workspace.</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#environment-variables">Environment Variables</a>
  </p>
</div>

---

## 📖 Overview

NoteAtlas is a powerful, AI-driven workspace inspired by Google's NotebookLM. It allows users to upload documents, extract meaningful insights, generate mind maps, and even listen to text-to-speech audio representations of their data. 

Powered by advanced Large Language Models, LangChain, and robust vector databases, NoteAtlas redefines how you interact with your notes and documents.

## ✨ Features

- **📄 Document Processing:** Upload PDFs and text, parse contents, and chunk data for efficient retrieval.
- **🧠 AI-Powered Insights:** Chat with your documents using Google GenAI and LangChain.
- **🗺️ Mind Mapping:** Automatically generate visual mind maps from your documents (powered by Mind-Elixir).
- **🎧 Audio Generation:** Convert text to speech for on-the-go listening.
- **🔐 Secure Authentication:** Seamless user login and management via Firebase Auth.
- **💳 Payments Integration:** Includes subscription/credit models using Stripe and Razorpay.
- **⚡ Real-time Updates:** WebSocket integration for real-time processing feedback.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19, Vite
- **Styling:** Tailwind CSS 4, Radix UI
- **State Management:** Redux Toolkit
- **Routing:** React Router 7
- **Authentication:** Firebase
- **Others:** React Markdown, Stripe React, Mind-Elixir

### Backend
- **Environment:** Node.js, Express, TypeScript
- **AI & Orchestration:** LangChain, Google GenAI, LangGraph
- **Database & Vector Store:** MongoDB, Pinecone, Supabase
- **Authentication:** Firebase Admin
- **Payments:** Razorpay
- **Utilities:** PDF-Parse, Google TTS API, Fluent-FFmpeg, WebSockets

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Accounts for Firebase, Pinecone, MongoDB, and Gemini API.

### 1. Clone the repository
```bash
git clone https://github.com/Dev-6106/NoteAtlas.git
cd NoteAtlas
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables

You will need to set up `.env` files in both the `frontend` and `backend` directories.

**Backend (`backend/.env`):**
- `PORT`
- `MONGO_URI`
- `PINECONE_API_KEY`
- `GOOGLE_API_KEY` / Gemini API Key
- Firebase Admin SDK credentials
- Razorpay keys
- Supabase credentials

**Frontend (`frontend/.env`):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_API_URL` (Backend URL)
- Stripe public keys

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is licensed under the ISC License.

---
<div align="center">
  <i>Built with ❤️ using React, Node, and LangChain.</i>
</div>
