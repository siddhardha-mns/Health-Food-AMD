import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sarvamService } from '../services/sarvam.service';
import { firestoreRepository } from '../repositories/firestore.repository';
import { RecommendationRequestSchema } from '../validators/schemas';

const router = Router();

/**
 * POST /api/recommend
 * Generate personalized meal recommendations based on user context
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parsed = RecommendationRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsed.error.errors,
      });
      return;
    }

    const { userId, timeOfDay, nutritionalContext } = parsed.data;

    // Get recent meals for context
    const recentMeals = await firestoreRepository.getRecentMeals(userId, 5);

    // Calculate nutrient gaps if not provided
    const gaps = nutritionalContext
      ? {
          caloriesRemaining: nutritionalContext.caloriesRemaining ?? 500,
          proteinDeficit: nutritionalContext.proteinDeficit ?? 20,
          fiberDeficit: nutritionalContext.fiberDeficit ?? 10,
        }
      : await firestoreRepository.calculateNutrientGaps(userId);

    const recommendations = await sarvamService.generateRecommendations(
      timeOfDay,
      recentMeals,
      gaps
    );

    console.log(`[Recommend] Generated ${recommendations.length} recommendations for ${userId}`);

    res.status(200).json({
      status: 'success',
      data: {
        recommendations,
        timeOfDay,
        nutritionContext: gaps,
        generatedAt: new Date().toISOString(),
      },
    });
  })
);

/**
 * GET /api/recommend?userId=&timeOfDay=
 * Quick recommendations via GET
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req.query.userId as string) || 'demo-user';
    const timeOfDay = (req.query.timeOfDay as string) || 'lunch';

    const recentMeals = await firestoreRepository.getRecentMeals(userId, 5);
    const gaps = await firestoreRepository.calculateNutrientGaps(userId);
    const recommendations = await sarvamService.generateRecommendations(timeOfDay, recentMeals, gaps);

    res.status(200).json({
      status: 'success',
      data: {
        recommendations,
        timeOfDay,
        nutritionContext: gaps,
        generatedAt: new Date().toISOString(),
      },
    });
  })
);

export default router;
