import { Router, Request, Response } from 'express';
import { processImage } from '../middleware/upload.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { visionService } from '../services/vision.service';
import { calculateMealHealthScore } from '../utils/health-score.util';
import { firestoreRepository } from '../repositories/firestore.repository';
import { gamificationService } from '../services/gamification.service';
import { MealLog } from '../validators/schemas';

const router = Router();

/**
 * POST /api/analyze
 * Analyze food image and return nutrition + health score
 */
router.post(
  '/',
  processImage,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req.query.userId as string) || 'demo-user';
    const mealType = (req.query.mealType as string) || 'snack';

    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'No image file provided' });
      return;
    }

    const validation = visionService.validateImage(req.file.buffer, req.file.mimetype);
    if (!validation.valid) {
      res.status(400).json({ status: 'error', message: validation.error });
      return;
    }

    const foodItems = await visionService.analyzeFoodImage(req.file.buffer);
    const healthScore = calculateMealHealthScore(foodItems);

    const totalCalories = foodItems.reduce((s, i) => s + i.calories, 0);
    const totalMacros = foodItems.reduce(
      (t, i) => ({
        protein: t.protein + i.macros.protein,
        carbs: t.carbs + i.macros.carbs,
        fats: t.fats + i.macros.fats,
        fiber: t.fiber + i.macros.fiber,
        sugar: t.sugar + i.macros.sugar,
        sodium: t.sodium + i.macros.sodium,
      }),
      { protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    const mealId = `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const mealLog: MealLog = {
      userId,
      mealId,
      foodItems,
      totalCalories,
      totalMacros,
      healthScore: healthScore.score,
      mealType: mealType as MealLog['mealType'],
      timestamp: new Date().toISOString(),
    };

    await firestoreRepository.logMeal(mealLog);
    await gamificationService.awardScanPoints(userId);
    await gamificationService.awardHighScorePoints(userId, healthScore.score);
    await gamificationService.updateStreak(userId, mealLog.timestamp);

    const context = await gamificationService.calculateContext(userId);
    await gamificationService.checkAndAwardBadges(userId, context);

    console.log(`[Analyze] Processed meal for ${userId}: ${foodItems.length} items, score ${healthScore.score}`);

    res.status(200).json({
      status: 'success',
      data: { mealId, foodItems, healthScore, totalCalories, totalMacros },
    });
  })
);

export default router;
