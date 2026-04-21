import { MealLog, UserProfile, GamificationStatus } from '../validators/schemas';
import { config } from '../config/config';

/**
 * In-memory repository — works in demo mode without Firestore
 * In production, swap to FirestoreRepository
 */
class InMemoryStore {
  private users = new Map<string, UserProfile>();
  private meals = new Map<string, MealLog[]>();
  private gamification = new Map<string, GamificationStatus>();

  async upsertUserProfile(profile: UserProfile): Promise<void> {
    this.users.set(profile.userId, profile);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.users.get(userId) ?? null;
  }

  async logMeal(mealLog: MealLog): Promise<string> {
    const existing = this.meals.get(mealLog.userId) ?? [];
    existing.unshift(mealLog);
    this.meals.set(mealLog.userId, existing);
    return mealLog.mealId;
  }

  async getMealLogs(userId: string, startTime: string, endTime: string): Promise<MealLog[]> {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return (this.meals.get(userId) ?? []).filter(m => {
      const t = new Date(m.timestamp).getTime();
      return t >= start && t <= end;
    });
  }

  async getRecentMeals(userId: string, limit = 10): Promise<MealLog[]> {
    return (this.meals.get(userId) ?? []).slice(0, limit);
  }

  async updateGamificationStatus(userId: string, partial: Partial<GamificationStatus>): Promise<void> {
    const current = this.gamification.get(userId) ?? {
      userId,
      points: 0,
      currentStreak: 0,
      longestStreak: 0,
      badges: [],
    };
    this.gamification.set(userId, { ...current, ...partial, userId });
  }

  async getGamificationStatus(userId: string): Promise<GamificationStatus | null> {
    if (!this.gamification.has(userId)) {
      const defaultStatus: GamificationStatus = {
        userId,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
      };
      this.gamification.set(userId, defaultStatus);
      return defaultStatus;
    }
    return this.gamification.get(userId)!;
  }

  async calculateNutrientGaps(userId: string): Promise<{
    caloriesRemaining: number;
    proteinDeficit: number;
    fiberDeficit: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMeals = await this.getMealLogs(userId, today.toISOString(), tomorrow.toISOString());
    const userProfile = await this.getUserProfile(userId);

    const totalCalories = todayMeals.reduce((s, m) => s + m.totalCalories, 0);
    const totalProtein = todayMeals.reduce((s, m) => s + m.totalMacros.protein, 0);
    const totalFiber = todayMeals.reduce((s, m) => s + m.totalMacros.fiber, 0);

    return {
      caloriesRemaining: (userProfile?.dailyCalorieGoal ?? 2000) - totalCalories,
      proteinDeficit: (userProfile?.proteinGoal ?? config.nutrition.proteinGoal) - totalProtein,
      fiberDeficit: (userProfile?.fiberGoal ?? config.nutrition.fiberGoal) - totalFiber,
    };
  }
}

export const firestoreRepository = new InMemoryStore();
