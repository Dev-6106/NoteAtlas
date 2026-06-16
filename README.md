<div align="center">

<br/>

<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="46" alt="React" />
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NodeJS-Dark.svg" width="46" alt="Node.js" />
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="46" alt="TypeScript" />
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/MongoDB.svg" width="46" alt="MongoDB" />
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Firebase-Dark.svg" width="46" alt="Firebase" />

<br/><br/>

# <img src="./frontend/public/logo_white.svg" height="36" alt="NoteAtlas Logo" style="vertical-align: middle;"/> NoteAtlas

### An open-source AI knowledge operating system.

<br/>

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-enabled-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://www.langchain.com/langgraph)
[![DeepSeek](https://img.shields.io/badge/DeepSeek_V4-Pro-4d4d4d?style=flat-square)](https://fireworks.ai)

<br/>

**Upload documents · Ask questions · Visualize ideas · Listen anywhere**

<br/>

**[🌍 Live Demo: note-atlas.vercel.app](https://note-atlas.vercel.app)**

</div>

![NoteAtlas UI](./images/homePage.png)

<div align="center">
<br/>

[Overview](#-overview) · [Why NoteAtlas](#-why-noteatlas) · [Philosophies](#-different-philosophies) · [Agent Studio](#-agent-studio) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started)

<br/>

</div>

---

## 📖 Overview

NoteAtlas turns static documents into a living knowledge system.

Upload PDFs, research papers, notes, transcripts, or audio recordings — and instantly unlock AI pipelines that go far beyond simple document chat. NoteAtlas is built as a collection of **specialized AI agents and retrieval architectures**, not a single LLM wrapper.

It combines **Adaptive RAG**, **LangGraph agents**, **semantic search**, **structured outputs**, and **long-document processing** into one integrated workspace — so your documents don't just answer questions, they become a foundation for research, learning, and structured knowledge.

---

## 👁️ Vision

Most AI document tools stop at answers.

Upload a document.  
Ask a question.  
Get a response.

NoteAtlas takes a different approach.

Documents become:
• Knowledge graphs
• Research workflows
• Specialized AI agents
• Verification pipelines
• Learning systems

Instead of treating documents as context, NoteAtlas treats them as a foundation for building knowledge systems.

The goal isn't better document chat.

**The goal is turning information into structured, reusable intelligence.**

---

## 🤔 Why NoteAtlas?

Most AI document tools are built around a single interaction:

**Document → Question → Answer**

NoteAtlas is built around a different loop:

**Document → Knowledge → Workflow → Insight**

Your documents don't just answer questions. They become:
• Searchable knowledge graphs
• Research assistants
• Verification engines
• Learning systems
• Automated workflows

This shift from document chat to knowledge operations is what defines NoteAtlas.

---

## 🎯 Different Philosophies

| | 🗺️ NoteAtlas | 📓 NotebookLM |
|---|---|---|
| **Core Idea** | Knowledge Operating System | AI Research Notebook |
| **Architecture** | Open-source, extensible, self-hostable | Managed Google service |
| **AI Models** | Multi-model orchestration | Gemini ecosystem |
| **Workflows** | Custom specialized agents & automation | Deep Research agent & conversational research |
| **Knowledge Representation** | Structured knowledge graphs & verifiable data | Rich media (Mind Maps, Slides, Audio, Video) |
| **Deployment** | Self-host or cloud | Google-hosted only |
| **Extensibility** | Build custom agents and workflows | Fixed product experience |
| **Ownership** | Full control of infrastructure and data | Managed platform |

---

## 🧠 Agent Studio

A workspace of specialized AI agents designed for tasks that require more than a single LLM response.

Each agent has its own reasoning pipeline, retrieval strategy, and output structure.

![Agent Studio](./images/agentStudio.png)

| Agent | What It Does |
|---|---|
| 📊 Research Agent | Produces structured, sourced research from your documents |
| 📚 Study Plan Agent | Builds personalized learning paths from source material |
| 🔍 Knowledge Gap Analyzer | Identifies what's missing or underdeveloped in your docs |
| ⚔️ Debate Agent | Generates multi-perspective arguments across sources |
| 🧑‍🔬 Research Assistant | Answers complex research questions with grounded citations |
| ✅ Verification Agent | Fact-checks claims with confidence scores & contradiction flags |
| 🗓️ Timeline Agent | Extracts and organizes chronological events |
| 🖼️ Presentation Agent | Builds slide-ready outlines directly from documents |

---

## 🕸️ Knowledge Graphs

Automatically extract:

• People
• Organizations
• Concepts
• Events
• Relationships

Explore how ideas connect across thousands of pages.

![Knowledge Graph](./images/knowledgeGraph.png)

Knowledge graphs are not visual summaries. They are structured representations of your information.

Ask questions. Traverse relationships. Discover hidden connections.

---

## ✨ Core Features

<table>
<tr>
<td valign="top" width="50%">

**📄 Document Intelligence**
- PDF & plain text ingestion
- Audio transcription (Whisper Large V3)
- Semantic search across your library
- Context-aware retrieval with citations

**🔬 Research Workflows**
- Adaptive RAG with query expansion
- Citation and fact verification
- Cross-document analysis
- Timeline extraction

</td>
<td valign="top" width="50%">

**🧠 Knowledge Management**
- Interactive knowledge graphs
- Entity and relationship extraction
- Structured document metadata
- Concept clustering

**⚙️ Open & Extensible**
- Open-source, self-hostable
- Multi-model orchestration
- Build custom agents
- Full infrastructure ownership

</td>
</tr>
</table>

---

## 🏗️ Technical Architecture

```mermaid
graph TD
    User(("User")) -->|"Uploads PDF / Text"| UI["Frontend UI React"]
    User -->|"Queries"| UI
    
    UI -->|"API Route"| Express["Express.js Backend"]
    
    Express -->|"Agenda.js Background Job"| Ingest["Document Ingestion Pipeline"]
    Ingest -->|"Extract & Chunk"| Chunking["Recursive Character Splitter"]
    Chunking -->|"Cohere Embeddings"| Pinecone[("Pinecone Vector Store")]
    Ingest -->|"Raw File"| Supabase[("Supabase Storage")]
    Ingest -->|"Metadata"| Mongo[("MongoDB Atlas")]
    
    Express -->|"Graph State"| LangGraph["LangGraph State Machine"]
    LangGraph -->|"ReAct Cycle"| DeepSeek["DeepSeek V4 Pro Reasoning"]
    
    LangGraph -->|"Adaptive RAG"| Router["Groq Llama 3.3 Router"]
    Router -->|"Query Expansion"| Retrieval["Multi-Query Retrieval"]
    Retrieval --> Pinecone
    Retrieval -->|"Reranking"| Cohere["Cohere Reranker"]
    
    LangGraph -->|"Agent Studio"| Special["Specialized Agents"]
    Special -->|"Structured Output JSON"| Mongo
    Special -->|"Generates"| UI
```

---

## 🗂️ Project Structure

```text
NoteAtlas/
├── backend/
│   ├── src/
│   │   ├── app/           # Express routes and controllers
│   │   ├── config/        # Environment and DB config
│   │   ├── lib/           # Common library logic
│   │   ├── middleware/    # Auth and error middleware
│   │   ├── pipelines/     # Data ingestion and map-reduce pipelines
│   │   ├── prompt/        # LLM system prompts and agent logic
│   │   ├── services/      # Core AI integrations (DeepSeek, Groq, Cohere)
│   │   ├── types/         # TypeScript definitions
│   │   └── util/          # Helper functions
│   ├── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # API fetch functions
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable React UI components
│   │   ├── config/        # Environment configs
│   │   ├── helper/        # Helpers and formatters
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # UI layout wrappers
│   │   ├── lib/           # Third-party integrations
│   │   ├── pages/         # Route-level page components
│   │   ├── router/        # React Router configs
│   │   ├── store/         # Redux state slices
│   │   ├── types/         # TypeScript definitions
│   │   └── util/          # Utility functions
│   ├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Primary Technologies |
|---|---|
| **Frontend UI** | React 19, Vite, TailwindCSS |
| **State Management**| Redux Toolkit |
| **Backend API** | Node.js, Express.js |
| **AI Orchestration**| LangChain, LangGraph |
| **Background Jobs** | Agenda.js |

### AI Models & APIs

| Model / API | Provider | Role |
|---|---|---|
| DeepSeek V4 Pro | Fireworks AI | Primary reasoning model |
| Llama 3.3 70B | Groq | Fast inference |
| Cohere | Cohere | Embeddings & reranking |
| Whisper Large V3 | — | Audio transcription |

### Infrastructure

| Service | Role |
|---|---|
| MongoDB Atlas | Metadata & knowledge graphs |
| Pinecone | Vector database |
| Supabase Storage | Raw file blobs |
| Firebase | Authentication |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- Active accounts for: [Firebase](https://firebase.google.com), [Pinecone](https://www.pinecone.io), [MongoDB Atlas](https://www.mongodb.com/atlas), [Cohere](https://cohere.com/), [Groq](https://groq.com/), [Fireworks AI](https://fireworks.ai/), [Supabase](https://supabase.com/)

---

### 1. Clone & Install

```bash
git clone https://github.com/Dev-6106/NoteAtlas.git
cd NoteAtlas
```

---

### 2. Configure Environment Variables

Create `.env` files in both the `frontend` and `backend` directories.

#### `backend/.env`

```env
# Application
NODE_ENV=production
PORT=8000
APP_URL=https://your-backend.railway.app
FRONTEND_URL=https://your-app.vercel.app

# Database
DB_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/notebooklm

# LLM Providers
GOOGLE_GEMINI_API_KEY=
GROQ_API_KEY=
FIREWORKS_API_KEY=

# AI Services & Search
TAVILY_API_KEY=
EXA_SEARCH_API_KEY=
HUGGINGFACE_API_KEY=
COHERE_API_KEY=

# Vector Store
PINECONE_API_KEY=
PINECONE_INDEX=notebooklm

# Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=Documents

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Payments
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

#### `frontend/.env`

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Firebase Auth Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=

# Razor Pay
VITE_RAZORPAY_KEY_ID=
```

---

### 3. Start the Servers

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend** (new terminal):
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

<div align="center">

<br/>

Built with ❤️ using React, Node.js, and LangGraph.

[⭐ Star this repo](https://github.com/Dev-6106/NoteAtlas) if you find it useful!

<br/>

</div>