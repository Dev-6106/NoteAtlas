# ─── Stage 1: Build ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Allow passing NODE_OPTIONS at build time (e.g. --max-old-space-size=4096)
ARG NODE_OPTIONS=--max-old-space-size=4096
ENV NODE_OPTIONS=${NODE_OPTIONS}

# Install ALL deps first (layer-cached — only re-runs if package*.json changes)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and compile TypeScript → dist/
COPY . .
RUN npm run build

# ─── Stage 2: Production runtime ─────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install production deps only (no devDependencies)
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist

# Copy public assets if they exist
COPY public ./public

EXPOSE 8000

CMD ["npm", "run", "start"]
