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

# 1.5 Set up non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nutrisense -u 1001 -G nodejs

# 2. Copy backend build
COPY --chown=nutrisense:nodejs --from=backend-builder /app/backend/dist ./backend/dist

# 3. Copy frontend build to a public folder the backend can serve
COPY --chown=nutrisense:nodejs --from=frontend-builder /app/frontend/dist ./backend/public

# 4. Final adjustments
RUN chmod -R 755 /app/backend/public
USER nutrisense

EXPOSE 8080

# Run from the backend directory
WORKDIR /app/backend
CMD ["node", "dist/server.js"]
