# ─── Stage 1: Build Frontend ────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ─── Stage 2: Build Backend ─────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# ─── Stage 3: Production Runner ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# 1. Install production deps for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev && npm cache clean --force

# 2. Copy backend build
COPY --from=backend-builder /app/backend/dist ./backend/dist

# 3. Copy frontend build to a public folder the backend can serve
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# 4. Set up non-root user and fix permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nutrisense -u 1001 -G nodejs && \
    chown -R nutrisense:nodejs /app
USER nutrisense

EXPOSE 8080

# Run from the backend directory
WORKDIR /app/backend
CMD ["node", "dist/server.js"]
