# NotebookLM Clone — Production Guide

This guide covers how to deploy the newly refactored NotebookLM Clone for production, along with architectural details.

## 1. Environment Configuration

### Backend (`.env`)
The backend now uses strict environment validation via Zod (`env.ts`). All these variables MUST be present or the app will not start (fail-fast design).

```env
PORT=8000
NODE_ENV=production

# Database
DB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/notebooklm?retryWrites=true&w=majority

# App & CORS
FRONTEND_URL=https://your-domain.com

# Authentication Secrets
JWT_SECRET=your_super_secure_access_token_secret_min_32_chars
REFRESH_TOKEN_SECRET=your_super_secure_refresh_token_secret_min_32_chars
SESSION_SECRET=your_super_secure_session_secret_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://api.your-domain.com/api/v1/auth/google/callback

# Third-Party APIs
FIREWORKS_API_KEY=your_fireworks_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Frontend (`.env`)
The frontend `.env` config is simple. It uses `VITE_` prefix and validated via `get-env.ts`.

```env
VITE_APP_URL=https://api.your-domain.com
```

## 2. Infrastructure Requirements

To run this application at production scale, you need:
- **Node.js**: v18+
- **Database**: MongoDB (Atlas recommended)
- **Background Jobs**: MongoDB handles Agenda jobs, but for huge scale, consider migrating Agenda to Redis/BullMQ.
- **File Storage**: Currently uses local storage (`/uploads`). For production, migrate this to AWS S3 or Google Cloud Storage.

## 3. Deployment Steps (Docker / VPS)

### Backend Build
1. Navigate to `backend`
2. Run `npm install`
3. Run `npm run build` (Compiles TS to `dist/`)
4. Start via PM2 or Docker: `NODE_ENV=production pm2 start dist/index.js --name notebook-api`

### Frontend Build
1. Navigate to `frontend`
2. Run `npm install`
3. Run `npm run build` (Generates optimized static bundle in `dist/`)
4. Serve the `dist/` folder via Nginx or deploy to Vercel/Netlify.

## 4. Key Architectural Improvements Made

### Backend
- **Strict Validated Config**: Replaced raw `process.env` with a singleton `env.ts` validated via Zod.
- **Robust Error Handling**: Added `AppError` hierarchy, global error middleware, and Zod validation middleware.
- **Rate Limiting**: Added in-memory rate limiting middleware to prevent brute force/DDoS.
- **Security**: Upgraded CORS to strictly allow `FRONTEND_URL`, enforced `httpOnly` + `sameSite` cookies for sessions, and fixed JWT lifetimes (Access: 2h, Refresh: 7d).
- **Code Organization**: Removed dead/commented code, fixed typos in repository names, extracted Passport config.

### Frontend
- **Premium UI Redesign**: Implemented a dark theme SaaS design system with glassmorphism, fluid layouts, smooth animations (Framer Motion / Tailwind Animate).
- **State Management**: Refactored Redux slices to use proper TypeScript definitions, removed redundant states, unified error handling.
- **Routing**: Implemented lazy loading for React Router routes for significantly smaller initial JS bundles.
- **API Layer**: Centralized API calls using a typed wrapper (`makeHttpReq`) that prevents silent error swallowing and handles standard JSON responses natively.

## 5. Next Steps for Enterprise
- Add S3 upload provider for file attachments (PDFs, Images).
- Move `Agenda` to Redis for better horizontal scaling.
- Set up monitoring (Datadog/Sentry) using the structured `winston` logger implemented in the core.
