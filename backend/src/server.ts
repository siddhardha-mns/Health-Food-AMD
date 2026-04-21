import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Routes
import analyzeRouter from './routes/analyze.route';
import recommendRouter from './routes/recommend.route';
import generateMealRouter from './routes/generate-meal.route';
import gamifyRouter from './routes/gamify.route';
import chatRouter from './routes/chat.route';

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { status: 'error', message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Image analysis gets a stricter limit
const analyzeLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,
  message: { status: 'error', message: 'Too many image analysis requests. Please wait a moment.' },
});
app.use('/api/analyze', analyzeLimit);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(compression() as express.RequestHandler);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logging ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Static Frontend Serving ──────────────────────────────────────────────────
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'NutriSense AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/analyze', analyzeRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/generate-meal', generateMealRouter);
app.use('/api/gamify', gamifyRouter);
app.use('/api/chat', chatRouter);

// ─── SPA Routing Fallback ─────────────────────────────────────────────────────
// Serve index.html for any route that doesn't match an API or static file
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  } else {
    res.status(404).json({ status: 'error', message: 'API endpoint not found' });
  }
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(config.port, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        🌿 NutriSense AI Backend 1.0.0        ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Environment : ${config.env.padEnd(28)}║`);
  console.log(`║  Port        : ${String(config.port).padEnd(28)}║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Endpoints:                                  ║');
  console.log('║   POST /api/analyze                          ║');
  console.log('║   POST /api/recommend                        ║');
  console.log('║   POST /api/generate-meal                    ║');
  console.log('║   GET  /api/gamify/status                    ║');
  console.log('║   POST /api/chat                             ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received. Shutting down...');
  server.close(() => process.exit(0));
});

export default app;
