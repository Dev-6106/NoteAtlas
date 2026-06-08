# NoteAtlas — Complete Deployment Guide

> **Architecture**: Frontend → **Vercel** (free, global CDN) | Backend → **Railway** (Node.js server, Dockerfile-based)

---

## Prerequisites

- Git repo pushed to GitHub
- Node.js 20 installed locally
- Accounts needed: Google Cloud, MongoDB Atlas, Pinecone, Supabase, Stripe, Vercel, Railway

---

## Part 1 — Google OAuth Setup (Allow Any User to Log In)

> [!IMPORTANT]
> This is the most critical step. Without correct configuration, users will see "Access blocked" or "redirect_uri_mismatch" errors.

### Step 1.1 — Create / Configure a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown → **New Project** → name it `NoteAtlas`
3. Enable required APIs:
   - Go to **APIs & Services → Library**
   - Search and **Enable**: `Google Drive API`
   - Search and **Enable**: `Google Sheets API` (optional but safe)
   - Search and **Enable**: `People API`

### Step 1.2 — Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth Consent Screen**
2. Select **External** → Create
3. Fill in:
   - **App name**: `NoteAtlas`
   - **User support email**: your email
   - **App logo**: upload one (optional)
   - **Authorized domains**: add both `railway.app` and `vercel.app` *(and your custom domains if any)*
   - **Developer contact information**: your email
4. Click **Save and Continue** through scopes (leave default)
5. **Test users** section — **CRITICAL**:
   - While your app is in **Testing** mode, only email addresses listed here can log in
   - Add your own email and any testers
   - **To allow ANY user to log in**: click **Publish App** → Submit for verification OR just use "In Production" mode
   
> [!WARNING]
> If you publish without Google verification, users will see a scary "unverified app" warning. For personal/dev use, clicking "Continue anyway" still works. For public launch, submit the verification form on this page.

### Step 1.3 — Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `NoteAtlas Web`
5. **Authorized JavaScript origins** — add ALL of:
   ```
   http://localhost:5173
   http://localhost:8000
   https://your-app.vercel.app
   https://your-backend.railway.app
   ```
6. **Authorized redirect URIs** — add ALL of:
   ```
   http://localhost:8000/auth/google/callback
   https://your-backend.railway.app/auth/google/callback
   ```
7. Click **Create** → copy the **Client ID** and **Client Secret**

> [!NOTE]
> Replace `your-app.vercel.app` and `your-backend.railway.app` with your actual deployment URLs. You must update these again after first deploy when you know the exact URLs.

### Step 1.4 — Google API Key (for Drive Picker)

1. Go to **APIs & Services → Credentials → + Create Credentials → API Key**
2. Copy the key → this is your `VITE_DEVELOPER_KEY`
3. Optionally restrict it to HTTP referrers: `*.vercel.app/*`, `localhost:5173/*`

---

## Part 2 — External Services Setup

### MongoDB Atlas (Database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → **Free tier (M0)**
2. Create a cluster → choose **AWS / Mumbai (ap-south-1)** for India
3. **Database Access**: Create user with username + password
4. **Network Access**: Add IP `0.0.0.0/0` (allow all — required for Railway)
5. Click **Connect → Drivers** → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/notebooklm
   ```

### Pinecone (Vector Database for RAG)

1. Go to [https://app.pinecone.io](https://app.pinecone.io) → Create account
2. Create an **Index**:
   - Name: `notebooklm`
   - Dimensions: `1024` (Cohere embed-english-v3.0)
   - Metric: `cosine`
   - Cloud: AWS, Region: us-east-1 (free tier)
3. Go to **API Keys** → copy your key

### Supabase (File Storage)

1. Go to [https://supabase.com](https://supabase.com) → Create project
2. Go to **Storage → New bucket**:
   - Name: `Documents`
   - Public: **No** (private)
3. Go to **Project Settings → API**:
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **service_role (secret)** key → `SUPABASE_SERVICE_ROLE_KEY`

### Stripe (Payments in INR)

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com) → Create account
2. **Account settings**: Set country to **India**
3. Go to **Developers → API Keys**:
   - Copy **Publishable key** → `VITE_STRIPE_PUB_KEY`
   - Copy **Secret key** → `STRIPE_SECRET_KEY`
4. Go to **Developers → Webhooks → Add endpoint**:
   - URL: `https://your-backend.railway.app/api/v1/payment/webhook`
   - Events to listen: `checkout.session.completed`
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

> [!NOTE]
> For INR payments, Stripe will automatically handle the currency if you pass `currency: 'inr'` in the checkout session. No extra configuration needed.

---

## Part 3 — Deploy Backend on Railway

### Step 3.1 — Create Railway Project

1. Go to [https://railway.app](https://railway.app) → Login with GitHub
2. **New Project → Deploy from GitHub repo**
3. Select your repo → Select branch `main`
4. Railway will auto-detect the Dockerfile in `/backend`

> [!IMPORTANT]
> Railway needs to know the root is `/backend`, not the repo root. Set this up:

5. In Railway project settings → **Source → Root Directory**: set to `backend`

### Step 3.2 — Add Environment Variables

In Railway → your service → **Variables** → Add all of these:

```env
NODE_ENV=production
PORT=8000
APP_URL=https://your-backend.railway.app
FRONTEND_URL=https://your-app.vercel.app

DB_URL=mongodb+srv://...

GOOGLE_GEMINI_API_KEY=...
TAVILY_API_KEY=...
EXA_SEARCH_API_KEY=...
HUGGINGFACE_API_KEY=...
COHERE_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX=notebooklm

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_BUCKET=Documents

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CALLBACK_URL=https://your-backend.railway.app/auth/google/callback
SUCESS_REDIRECT_URL=https://your-app.vercel.app/auth/callback

COOKIE_KEY=<generate: openssl rand -hex 32>
JWT_ACCESS_SECRET=<generate: openssl rand -hex 32>
JWT_REFRESH_SECRET=<generate: openssl rand -hex 32>

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

ELEVEN_LAB_API_KEY=...
GROQ_API_KEY=...
```

### Step 3.3 — Generate Railway Domain

1. In Railway → your service → **Settings → Networking**
2. Click **Generate Domain** → you get `your-backend.railway.app`
3. Copy this URL and update `APP_URL` and `CALLBACK_URL` variables

### Step 3.4 — Deploy

Railway auto-deploys on every push to `main`. First deploy:
1. Watch logs in Railway dashboard under **Deployments**
2. A successful deploy shows: `Server running at https://your-backend.railway.app [production]`
3. Test: `curl https://your-backend.railway.app/` → should return `{"status":"ok",...}`

---

## Part 4 — Deploy Frontend on Vercel

### Step 4.1 — Import Project

1. Go to [https://vercel.com](https://vercel.com) → Login with GitHub
2. **Add New → Project → Import Git Repository**
3. Select your repo
4. **Framework Preset**: Vite
5. **Root Directory**: click Edit → set to `frontend`
6. **Build Command**: `npm run build` (auto-detected)
7. **Output Directory**: `dist` (auto-detected)

### Step 4.2 — Add Environment Variables

In Vercel → your project → **Settings → Environment Variables**:

```env
VITE_API_URL=https://your-backend.railway.app
VITE_GOOGLE_CLIENT_ID=475445...apps.googleusercontent.com
VITE_DEVELOPER_KEY=AIzaSy...
VITE_STRIPE_PUB_KEY=pk_live_...
```

> [!WARNING]
> All frontend env vars **must** start with `VITE_` or Vite will not expose them to the browser.

### Step 4.3 — Deploy

1. Click **Deploy** → Vercel builds and deploys
2. You get a URL like `your-app.vercel.app`
3. **Copy this URL** and update Railway's `FRONTEND_URL` variable (triggers Railway redeploy)

### Step 4.4 — Custom Domain (Optional)

1. Vercel → your project → **Settings → Domains**
2. Add your domain → follow DNS instructions (usually add a CNAME record)

---

## Part 5 — Post-Deploy Configuration

### 5.1 — Update Google Console with Final URLs

Go back to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials):

1. Edit your OAuth 2.0 client
2. Add your **actual** Vercel and Railway URLs to:
   - Authorized JavaScript origins
   - Authorized redirect URIs
3. Click **Save** (takes ~5 minutes to propagate)

### 5.2 — Update Railway Variables with Final Vercel URL

Once you have both URLs:
```
APP_URL=https://your-backend.railway.app           ← Railway URL
FRONTEND_URL=https://your-app.vercel.app           ← Vercel URL
CALLBACK_URL=https://your-backend.railway.app/auth/google/callback
SUCESS_REDIRECT_URL=https://your-app.vercel.app/auth/callback
```

### 5.3 — Update Stripe Webhook URL

In Stripe Dashboard → Webhooks → update the endpoint URL to your final Railway URL:
```
https://your-backend.railway.app/api/v1/payment/webhook
```

### 5.4 — Verify Google OAuth Works

1. Visit your Vercel URL
2. Click **Sign in with Google**
3. You should be redirected to Google → choose account → redirected back
4. If you see "Access blocked: This app's request is invalid" — the redirect URI in Google Console doesn't match

---

## Part 6 — CI/CD Pipeline

The fixed `.github/workflows/ci.yml` now:
- ✅ Runs on every push to `main` and every PR
- ✅ Builds frontend (Vite) with mock env vars
- ✅ Type-checks frontend TypeScript
- ✅ Installs backend dependencies
- ✅ Type-checks backend TypeScript (no broken compile)

Vercel and Railway **auto-deploy** from `main` branch — no extra CD workflow needed.

```
Push to main
  ├── GitHub Actions: Type-check + build both apps
  ├── Vercel: Auto-deploy frontend
  └── Railway: Auto-deploy backend (Docker)
```

---

## Part 7 — Environment Variables Quick Reference

### Backend (Railway) — Complete List

| Variable | Where to Get |
|---|---|
| `NODE_ENV` | Set to `production` |
| `PORT` | Set to `8000` |
| `APP_URL` | Your Railway URL |
| `FRONTEND_URL` | Your Vercel URL |
| `DB_URL` | MongoDB Atlas → Connect → Drivers |
| `GOOGLE_GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) |
| `TAVILY_API_KEY` | [tavily.com](https://tavily.com) |
| `EXA_SEARCH_API_KEY` | [exa.ai](https://exa.ai) |
| `HUGGINGFACE_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `COHERE_API_KEY` | [cohere.com](https://dashboard.cohere.com/api-keys) |
| `PINECONE_API_KEY` | Pinecone Dashboard → API Keys |
| `PINECONE_INDEX` | `notebooklm` |
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `SUPABASE_BUCKET` | `Documents` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |
| `CALLBACK_URL` | `https://<railway-url>/auth/google/callback` |
| `SUCESS_REDIRECT_URL` | `https://<vercel-url>/auth/callback` |
| `COOKIE_KEY` | `openssl rand -hex 32` |
| `JWT_ACCESS_SECRET` | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks |
| `ELEVEN_LAB_API_KEY` | [elevenlabs.io](https://elevenlabs.io) |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |

### Frontend (Vercel) — Complete List

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | Same as backend `GOOGLE_CLIENT_ID` |
| `VITE_DEVELOPER_KEY` | Google Cloud → API Key |
| `VITE_STRIPE_PUB_KEY` | `pk_live_...` from Stripe |

---

## Part 8 — Troubleshooting

### "redirect_uri_mismatch" on Google Login
→ The `CALLBACK_URL` in Railway doesn't match the Authorized redirect URI in Google Console. They must be **byte-for-byte identical**.

### "Access blocked: This app's request is invalid"
→ Your app is in Testing mode and the user's email isn't in the Test users list. Either add the email, or click **Publish App** in OAuth Consent Screen.

### Frontend shows blank page on Vercel
→ SPA routing isn't configured. The `vercel.json` in `frontend/` handles this — make sure it's committed.

### CORS errors in browser console
→ `FRONTEND_URL` in Railway is wrong or has a trailing slash. Must exactly match Vercel URL.

### Railway build fails
→ Check Railway logs. Most common: missing env variable. Railway will log which one failed Zod validation.

### "Error: Cannot find module 'dist/index.js'"
→ TypeScript compile failed. Run `npm run build` locally to see the error. Check `backend/tsconfig.json`.

### Stripe webhook "400 Bad Request"
→ The raw body middleware must run before `express.json()`. The webhook route needs `express.raw()` middleware.

### Session not persisting (logged out on every refresh)
→ `COOKIE_KEY` must be set. `NODE_ENV=production` must be set. `sameSite: "none"` and `secure: true` cookies require HTTPS (both Railway and Vercel use HTTPS by default).

---

## Part 9 — Checklist Before Going Live

- [ ] Google OAuth Consent Screen published (not in Testing mode)
- [ ] All redirect URIs match in Google Console
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] Pinecone index created with correct dimensions (1024)
- [ ] Supabase bucket named exactly `Documents`
- [ ] `COOKIE_KEY`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` are random 32-byte hex strings
- [ ] `NODE_ENV=production` set on Railway
- [ ] `FRONTEND_URL` on Railway matches Vercel URL (no trailing slash)
- [ ] `VITE_API_URL` on Vercel matches Railway URL (no trailing slash)
- [ ] Stripe webhook secret updated with final Railway URL
- [ ] `vercel.json` committed to `frontend/` directory
- [ ] Backend Dockerfile committed (multi-stage build, not dev server)
