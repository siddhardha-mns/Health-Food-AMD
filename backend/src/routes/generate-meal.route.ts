import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sarvamService } from '../services/sarvam.service';
import { GenerateMealRequestSchema } from '../validators/schemas';

const router = Router();

/**
 * POST /api/generate-meal
 * Generate a recipe from provided ingredients
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parsed = GenerateMealRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsed.error.errors,
      });
      return;
    }

    const { userId, ingredients, preferences } = parsed.data;

    const recipe = await sarvamService.generateRecipe(ingredients, preferences);

    console.log(`[GenerateMeal] Generated recipe "${recipe.name}" for ${userId}`);

    res.status(200).json({
      status: 'success',
      data: {
        recipe,
        ingredientsUsed: ingredients,
        generatedAt: new Date().toISOString(),
      },
    });
  })
);

export default router;
