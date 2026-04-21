import { firestoreRepository } from '../repositories/firestore.repository';
import { GamificationStatus } from '../validators/schemas';
import { config } from '../config/config';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (status: GamificationStatus, context: GamificationContext) => boolean;
}

interface GamificationContext {
  totalMeals: number;
  consecutiveDaysWithProteinGoal: number;
  highScoreMeals: number;
  weeklyStreak: number;
}

export class GamificationService {
  private readonly badges: Badge[] = [
    { id: 'healthy_starter', name: 'Healthy Starter', description: 'Log your first 3 meals', icon: '🌱',
      requirement: (_, ctx) => ctx.totalMeals >= 3 },
    { id: 'protein_pro', name: 'Protein Pro', description: 'Meet your protein goal for 7 consecutive days', icon: '💪',
      requirement: (_, ctx) => ctx.consecutiveDaysWithProteinGoal >= 7 },
    { id: 'quality_champion', name: 'Quality Champion', description: 'Log 10 meals with health score above 80', icon: '🏆',
      requirement: (_, ctx) => ctx.highScoreMeals >= 10 },
    { id: 'week_warrior', name: 'Week Warrior', description: 'Maintain a 7-day logging streak', icon: '🔥',
      requirement: (status) => status.currentStreak >= 7 },
    { id: 'consistency_king', name: 'Consistency King', description: 'Maintain a 30-day logging streak', icon: '👑',
      requirement: (status) => status.currentStreak >= 30 },
    { id: 'point_collector', name: 'Point Collector', description: 'Earn 1000 total points', icon: '⭐',
      requirement: (status) => status.points >= 1000 },
    { id: 'nutrition_master', name: 'Nutrition Master', description: 'Earn 5000 total points', icon: '🎓',
      requirement: (status) => status.points >= 5000 },
  ];

  async awardScanPoints(userId: string): Promise<number> {
    return this.addPoints(userId, config.gamification.points.scan, 'meal_scan');
  }

  async awardHighScorePoints(userId: string, score: number): Promise<number> {
    if (score >= config.nutrition.healthyScoreThreshold) {
      return this.addPoints(userId, config.gamification.points.highScore, 'high_score_meal');
    }
    return 0;
  }

  async awardDailyLogPoints(userId: string): Promise<number> {
    return this.addPoints(userId, config.gamification.points.dailyLog, 'daily_log');
  }

  async updateStreak(userId: string, lastLogTimestamp: string): Promise<void> {
    const status = await firestoreRepository.getGamificationStatus(userId);
    if (!status) return;

    const now = new Date();
    const lastLog = new Date(lastLogTimestamp);
    const hoursSince = (now.getTime() - lastLog.getTime()) / (1000 * 60 * 60);

    let newStreak = status.currentStreak;

    if (hoursSince <= config.gamification.streakResetHours) {
      if (lastLog.toDateString() !== now.toDateString()) {
        newStreak = status.currentStreak + 1;
      }
    } else {
      newStreak = 1;
    }

    await firestoreRepository.updateGamificationStatus(userId, {
      currentStreak: newStreak,
      longestStreak: Math.max(status.longestStreak, newStreak),
    });
  }

  async checkAndAwardBadges(userId: string, context: GamificationContext): Promise<GamificationStatus> {
    const status = await firestoreRepository.getGamificationStatus(userId);
    if (!status) throw new Error('Gamification status not found');

    const earnedIds = new Set(status.badges.map(b => b.id));
    const newBadges = this.badges
      .filter(b => !earnedIds.has(b.id) && b.requirement(status, context))
      .map(b => ({ id: b.id, name: b.name, description: b.description, icon: b.icon, earnedAt: new Date().toISOString() }));

    if (newBadges.length > 0) {
      const updatedBadges = [...status.badges, ...newBadges];
      await firestoreRepository.updateGamificationStatus(userId, { badges: updatedBadges });
      return { ...status, badges: updatedBadges };
    }
    return status;
  }

  getNextMilestone(status: GamificationStatus): { name: string; pointsRequired: number; currentProgress: number } | undefined {
    const milestones = [
      { name: 'Bronze Tier', points: 100 },
      { name: 'Silver Tier', points: 500 },
      { name: 'Gold Tier', points: 1000 },
      { name: 'Platinum Tier', points: 2500 },
      { name: 'Diamond Tier', points: 5000 },
      { name: 'Legend Tier', points: 10000 },
    ];
    const next = milestones.find(m => m.points > status.points);
    if (!next) return undefined;
    return { name: next.name, pointsRequired: next.points, currentProgress: status.points };
  }

  private async addPoints(userId: string, points: number, reason: string): Promise<number> {
    const status = await firestoreRepository.getGamificationStatus(userId);
    if (!status) throw new Error('Gamification status not found');
    const newTotal = status.points + points;
    await firestoreRepository.updateGamificationStatus(userId, { points: newTotal });
    console.log(`[Gamification] ${userId} earned ${points} pts for ${reason}. Total: ${newTotal}`);
    return newTotal;
  }

  async calculateContext(userId: string) {
    const recentMeals = await firestoreRepository.getRecentMeals(userId, 100);
    const totalMeals = recentMeals.length;
    const highScoreMeals = recentMeals.filter(m => m.healthScore >= config.nutrition.healthyScoreThreshold).length;

    const daysMet = new Set<string>();
    for (const meal of recentMeals) {
      if (meal.totalMacros.protein >= config.nutrition.proteinGoal) {
        daysMet.add(new Date(meal.timestamp).toDateString());
      }
    }

    let consecutiveDaysWithProteinGoal = 0;
    const currentDate = new Date();
    for (const day of Array.from(daysMet).sort().reverse()) {
      if (new Date(day).toDateString() === currentDate.toDateString()) {
        consecutiveDaysWithProteinGoal++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else break;
    }

    const status = await firestoreRepository.getGamificationStatus(userId);
    return { totalMeals, consecutiveDaysWithProteinGoal, highScoreMeals, weeklyStreak: status?.currentStreak ?? 0 };
  }
}

export const gamificationService = new GamificationService();
