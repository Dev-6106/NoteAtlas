# ─── Stage 1: Build ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Increase Node heap for tsc (large dependency trees OOM at default 512MB)
ENV NODE_OPTIONS=--max-old-space-size=4096

# Install dependencies first (layer-cached)
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript → dist/
COPY . .
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy any static public assets
COPY public ./public

EXPOSE 8000

CMD ["npm", "run", "start"]
