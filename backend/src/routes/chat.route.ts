import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sarvamService } from '../services/sarvam.service';
import { firestoreRepository } from '../repositories/firestore.repository';
import { ChatMessageSchema } from '../validators/schemas';

const router = Router();

/**
 * POST /api/chat
 * Conversational AI nutritionist chat
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parsed = ChatMessageSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsed.error.errors,
      });
      return;
    }

    const { userId, message, context } = parsed.data;

    // Build rich context from user history if not provided
    let chatContext = context || {};

    if (!chatContext.recentMeals) {
      const recentMealLogs = await firestoreRepository.getRecentMeals(userId, 5);
      chatContext.recentMeals = recentMealLogs.flatMap(m => m.foodItems).slice(0, 10);
    }

    if (!chatContext.currentStreak) {
      const gamificationStatus = await firestoreRepository.getGamificationStatus(userId);
      chatContext.currentStreak = gamificationStatus?.currentStreak ?? 0;
    }

    const reply = await sarvamService.chat(message, chatContext);

    console.log(`[Chat] ${userId}: "${message.substring(0, 50)}..." -> "${reply.substring(0, 50)}..."`);

    res.status(200).json({
      status: 'success',
      data: {
        reply,
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  })
);

export default router;
