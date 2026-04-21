import { z } from 'zod';

export const MacrosSchema = z.object({
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(1000),
  fats: z.number().min(0).max(500),
  fiber: z.number().min(0).max(100),
  sugar: z.number().min(0).max(500),
  sodium: z.number().min(0).max(10000),
});

export const FoodItemSchema = z.object({
  name: z.string().min(1).max(200),
  calories: z.number().min(0).max(5000),
  macros: MacrosSchema,
  processingLevel: z.enum(['whole', 'minimally_processed', 'processed', 'ultra_processed']),
  portionSize: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const RecommendationRequestSchema = z.object({
  userId: z.string().min(1),
  timeOfDay: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  nutritionalContext: z.object({
    caloriesRemaining: z.number().optional(),
    proteinDeficit: z.number().optional(),
    fiberDeficit: z.number().optional(),
  }).optional(),
});

export const GenerateMealRequestSchema = z.object({
  userId: z.string().min(1),
  ingredients: z.array(z.string().min(1).max(100)).min(1).max(20),
  preferences: z.object({
    cuisine: z.string().optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    maxCalories: z.number().min(0).max(5000).optional(),
  }).optional(),
});

export const GamificationStatusSchema = z.object({
  userId: z.string(),
  points: z.number().min(0),
  currentStreak: z.number().min(0),
  longestStreak: z.number().min(0),
  badges: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    earnedAt: z.string(),
    icon: z.string(),
  })),
  nextMilestone: z.object({
    name: z.string(),
    pointsRequired: z.number(),
    currentProgress: z.number(),
  }).optional(),
});

export const HealthScoreSchema = z.object({
  score: z.number().min(0).max(100),
  breakdown: z.object({
    proteinBonus: z.number(),
    fiberBonus: z.number(),
    sugarPenalty: z.number(),
    sodiumPenalty: z.number(),
    processingPenalty: z.number(),
  }),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  insights: z.array(z.string()),
});

export const ChatMessageSchema = z.object({
  userId: z.string().min(1),
  message: z.string().min(1).max(2000),
  context: z.object({
    recentMeals: z.array(FoodItemSchema).max(10).optional(),
    healthGoals: z.array(z.string()).optional(),
    currentStreak: z.number().optional(),
  }).optional(),
});

export const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  healthGoals: z.array(z.string()),
  dietaryPreferences: z.array(z.string()).optional(),
  dailyCalorieGoal: z.number().min(800).max(5000).optional(),
  proteinGoal: z.number().min(0).max(500).optional(),
  fiberGoal: z.number().min(0).max(100).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MealLogSchema = z.object({
  userId: z.string(),
  mealId: z.string(),
  foodItems: z.array(FoodItemSchema).min(1),
  totalCalories: z.number().min(0),
  totalMacros: MacrosSchema,
  healthScore: z.number().min(0).max(100),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  timestamp: z.string(),
  imageUrl: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

export type Macros = z.infer<typeof MacrosSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;
export type GenerateMealRequest = z.infer<typeof GenerateMealRequestSchema>;
export type GamificationStatus = z.infer<typeof GamificationStatusSchema>;
export type HealthScore = z.infer<typeof HealthScoreSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type MealLog = z.infer<typeof MealLogSchema>;
