# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY backend/package*.json ./

# Install all dependencies (including devDeps for TypeScript build)
RUN npm ci

# Copy source
COPY backend/ .

# Compile TypeScript
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only production package files
COPY backend/package*.json ./

# Install production deps only
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nutrisense -u 1001 -G nodejs
USER nutrisense

EXPOSE 8080

CMD ["node", "dist/server.js"]
