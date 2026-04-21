import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { firestoreRepository } from '../repositories/firestore.repository';
import { gamificationService } from '../services/gamification.service';

const router = Router();

/**
 * GET /api/gamify/status?userId=
 * Get gamification status for a user
 */
router.get(
  '/status',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req.query.userId as string) || 'demo-user';

    const status = await firestoreRepository.getGamificationStatus(userId);

    if (!status) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    const nextMilestone = gamificationService.getNextMilestone(status);

    res.status(200).json({
      status: 'success',
      data: {
        ...status,
        nextMilestone,
        tier: getTier(status.points),
      },
    });
  })
);

/**
 * POST /api/gamify/award-points
 * Manually award points (admin/debug endpoint)
 */
router.post(
  '/award-points',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, action } = req.body;

    if (!userId || !action) {
      res.status(400).json({ status: 'error', message: 'userId and action are required' });
      return;
    }

    let pointsAwarded = 0;

    switch (action) {
      case 'scan':
        pointsAwarded = await gamificationService.awardScanPoints(userId);
        break;
      case 'daily_log':
        pointsAwarded = await gamificationService.awardDailyLogPoints(userId);
        break;
      default:
        res.status(400).json({ status: 'error', message: `Unknown action: ${action}` });
        return;
    }

    const status = await firestoreRepository.getGamificationStatus(userId);

    res.status(200).json({
      status: 'success',
      data: {
        pointsAwarded,
        totalPoints: status?.points ?? 0,
        action,
      },
    });
  })
);

/**
 * GET /api/gamify/leaderboard
 * Returns demo leaderboard (in production, query Firestore)
 */
router.get(
  '/leaderboard',
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const leaderboard = [
      { rank: 1, displayName: 'NutriChampion', points: 4250, tier: 'Platinum', streak: 42 },
      { rank: 2, displayName: 'HealthHero', points: 3800, tier: 'Platinum', streak: 38 },
      { rank: 3, displayName: 'FitFoodie', points: 2950, tier: 'Gold', streak: 21 },
      { rank: 4, displayName: 'WellnessWarrior', points: 1840, tier: 'Gold', streak: 15 },
      { rank: 5, displayName: 'GreenEater', points: 1200, tier: 'Silver', streak: 9 },
    ];

    res.status(200).json({ status: 'success', data: { leaderboard } });
  })
);

function getTier(points: number): string {
  if (points >= 5000) return 'Diamond';
  if (points >= 2500) return 'Platinum';
  if (points >= 1000) return 'Gold';
  if (points >= 500) return 'Silver';
  if (points >= 100) return 'Bronze';
  return 'Starter';
}

export default router;
