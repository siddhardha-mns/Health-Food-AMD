import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment Configuration Schema
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('8080'),

  // Google Cloud
  GOOGLE_CLOUD_PROJECT: z.string().min(1).default('nutrisense-demo'),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  // Sarvam API
  SARVAM_API_KEY: z.string().min(1).default('demo-key'),
  SARVAM_API_URL: z.string().url().default('https://api.sarvam.ai/v1'),

  // Vision API
  VISION_API_ENABLED: z.string().transform(val => val === 'true').default('false'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000').transform(str => str.split(',')),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Image Processing
  MAX_IMAGE_SIZE_MB: z.string().transform(Number).default('10'),
  ALLOWED_IMAGE_TYPES: z.string().default('image/jpeg,image/png,image/webp').transform(str => str.split(',')),

  // Gamification
  POINTS_PER_SCAN: z.string().transform(Number).default('10'),
  POINTS_PER_HIGH_SCORE: z.string().transform(Number).default('20'),
  POINTS_PER_DAILY_LOG: z.string().transform(Number).default('15'),
  STREAK_RESET_HOURS: z.string().transform(Number).default('48'),

  // Nutritional
  HEALTHY_SCORE_THRESHOLD: z.string().transform(Number).default('80'),
  PROTEIN_GOAL_GRAMS: z.string().transform(Number).default('50'),
  FIBER_GOAL_GRAMS: z.string().transform(Number).default('25'),
});

const env = EnvSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,

  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',

  google: {
    projectId: env.GOOGLE_CLOUD_PROJECT,
    credentials: env.GOOGLE_APPLICATION_CREDENTIALS,
  },

  sarvam: {
    apiKey: env.SARVAM_API_KEY,
    baseUrl: env.SARVAM_API_URL,
  },

  vision: {
    enabled: env.VISION_API_ENABLED,
  },

  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  image: {
    maxSizeMB: env.MAX_IMAGE_SIZE_MB,
    allowedTypes: env.ALLOWED_IMAGE_TYPES,
  },

  gamification: {
    points: {
      scan: env.POINTS_PER_SCAN,
      highScore: env.POINTS_PER_HIGH_SCORE,
      dailyLog: env.POINTS_PER_DAILY_LOG,
    },
    streakResetHours: env.STREAK_RESET_HOURS,
  },

  nutrition: {
    healthyScoreThreshold: env.HEALTHY_SCORE_THRESHOLD,
    proteinGoal: env.PROTEIN_GOAL_GRAMS,
    fiberGoal: env.FIBER_GOAL_GRAMS,
  },
} as const;

export type Config = typeof config;
