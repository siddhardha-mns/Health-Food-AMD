import { FoodItem, HealthScore } from '../validators/schemas';

/**
 * NutriSense "Nutri-Algorithm" Health Score Calculator
 * Computes a 0-100 health score with detailed breakdown
 */
export function calculateMealHealthScore(foodItems: FoodItem[]): HealthScore {
  if (foodItems.length === 0) {
    return {
      score: 0,
      breakdown: { proteinBonus: 0, fiberBonus: 0, sugarPenalty: 0, sodiumPenalty: 0, processingPenalty: 0 },
      grade: 'F',
      insights: ['No food items detected'],
    };
  }

  // Aggregate totals
  const totals = foodItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.macros.protein,
      carbs: acc.carbs + item.macros.carbs,
      fats: acc.fats + item.macros.fats,
      fiber: acc.fiber + item.macros.fiber,
      sugar: acc.sugar + item.macros.sugar,
      sodium: acc.sodium + item.macros.sodium,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 }
  );

  // Processing level score (0-25 points)
  const processingMap: Record<string, number> = {
    whole: 25,
    minimally_processed: 18,
    processed: 8,
    ultra_processed: 0,
  };
  const processingScores = foodItems.map(f => processingMap[f.processingLevel] ?? 10);
  const avgProcessingScore = processingScores.reduce((a, b) => a + b, 0) / processingScores.length;
  const processingPenalty = 25 - avgProcessingScore;

  // Protein bonus (0-20 points)
  const proteinBonus = Math.min(20, (totals.protein / 30) * 20);

  // Fiber bonus (0-20 points)
  const fiberBonus = Math.min(20, (totals.fiber / 10) * 20);

  // Sugar penalty (0-20 points)
  const sugarPenalty = Math.min(20, (totals.sugar / 50) * 20);

  // Sodium penalty (0-15 points)
  const sodiumPenalty = Math.min(15, (totals.sodium / 1500) * 15);

  // Base score of 60, add bonuses, subtract penalties
  const rawScore = 60 + proteinBonus + fiberBonus - sugarPenalty - sodiumPenalty - processingPenalty;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Grade mapping
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  // Generate insights
  const insights: string[] = [];

  if (proteinBonus >= 15) insights.push('Great protein content! 💪');
  else if (proteinBonus < 8) insights.push('Consider adding more protein sources');

  if (fiberBonus >= 15) insights.push('Excellent fiber intake! 🌿');
  else if (fiberBonus < 8) insights.push('Add more vegetables or whole grains for fiber');

  if (sugarPenalty > 12) insights.push('High sugar content — consider reducing sweeteners');
  else if (sugarPenalty < 5) insights.push('Low sugar content — great choice! 🎉');

  if (sodiumPenalty > 10) insights.push('High sodium — watch out for processed or salty foods');

  if (processingPenalty < 5) insights.push('Mostly whole foods — excellent! 🥗');
  else if (processingPenalty > 18) insights.push('High processing level — opt for whole foods when possible');

  if (insights.length === 0) insights.push('Balanced meal! Keep up the good work.');

  return {
    score,
    breakdown: {
      proteinBonus: Math.round(proteinBonus),
      fiberBonus: Math.round(fiberBonus),
      sugarPenalty: Math.round(sugarPenalty),
      sodiumPenalty: Math.round(sodiumPenalty),
      processingPenalty: Math.round(processingPenalty),
    },
    grade,
    insights,
  };
}
