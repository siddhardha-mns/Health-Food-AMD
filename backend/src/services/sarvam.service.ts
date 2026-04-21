import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config';
import { MealLog, FoodItem } from '../validators/schemas';

export class SarvamService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.sarvam.baseUrl,
      headers: { 'Authorization': `Bearer ${config.sarvam.apiKey}`, 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  }

  async generateRecommendations(
    timeOfDay: string,
    recentMeals: MealLog[],
    nutritionGaps: { caloriesRemaining: number; proteinDeficit: number; fiberDeficit: number }
  ): Promise<string[]> {
    try {
      const prompt = this.buildRecommendationContext(timeOfDay, recentMeals, nutritionGaps);
      const response = await this.client.post('/chat/completions', {
        model: 'sarvam-1',
        messages: [
          { role: 'system', content: 'You are NutriSense AI, a friendly nutritionist. Provide 3-5 specific meal recommendations.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7, max_tokens: 500,
      });
      return this.parseRecommendations(response.data.choices[0].message.content);
    } catch {
      return this.getFallbackRecommendations(timeOfDay, nutritionGaps);
    }
  }

  async generateRecipe(
    ingredients: string[],
    preferences?: { cuisine?: string; dietaryRestrictions?: string[]; maxCalories?: number }
  ): Promise<{ name: string; description: string; instructions: string[]; estimatedNutrition: { calories: number; protein: number; carbs: number; fats: number } }> {
    try {
      const prompt = this.buildRecipePrompt(ingredients, preferences);
      const response = await this.client.post('/chat/completions', {
        model: 'sarvam-1',
        messages: [
          { role: 'system', content: 'You are a creative chef AI. Generate healthy recipes. Format: JSON with name, description, instructions (array), estimatedNutrition.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8, max_tokens: 800,
      });
      return this.parseRecipeResponse(response.data.choices[0].message.content);
    } catch {
      return this.getFallbackRecipe(ingredients, preferences);
    }
  }

  async chat(
    userMessage: string,
    context: { recentMeals?: FoodItem[]; healthGoals?: string[]; currentStreak?: number }
  ): Promise<string> {
    try {
      const systemPrompt = this.buildChatSystemPrompt(context);
      const response = await this.client.post('/chat/completions', {
        model: 'sarvam-1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7, max_tokens: 600,
      });
      return response.data.choices[0].message.content;
    } catch {
      return this.getFallbackChatResponse(userMessage);
    }
  }

  private buildRecommendationContext(timeOfDay: string, meals: MealLog[], gaps: { caloriesRemaining: number; proteinDeficit: number; fiberDeficit: number }): string {
    const summary = meals.slice(0, 3).map(m => `${m.mealType}: ${m.foodItems.map(f => f.name).join(', ')}`).join('\n');
    return `Time: ${timeOfDay}\nRecent meals:\n${summary || 'None'}\nCalories remaining: ${gaps.caloriesRemaining}\nProtein deficit: ${gaps.proteinDeficit}g\nFiber deficit: ${gaps.fiberDeficit}g\nRecommend 3-5 healthy meals for ${timeOfDay}.`;
  }

  private buildRecipePrompt(ingredients: string[], prefs?: { cuisine?: string; dietaryRestrictions?: string[]; maxCalories?: number }): string {
    let prompt = `Create a healthy recipe using: ${ingredients.join(', ')}\n`;
    if (prefs?.cuisine) prompt += `Cuisine: ${prefs.cuisine}\n`;
    if (prefs?.dietaryRestrictions?.length) prompt += `Restrictions: ${prefs.dietaryRestrictions.join(', ')}\n`;
    if (prefs?.maxCalories) prompt += `Max calories: ${prefs.maxCalories}\n`;
    return prompt + 'Include estimated nutrition values in JSON format.';
  }

  private buildChatSystemPrompt(context: { recentMeals?: FoodItem[]; healthGoals?: string[]; currentStreak?: number }): string {
    let prompt = 'You are NutriSense AI, a friendly nutrition coach. Be encouraging, knowledgeable and non-judgmental.\n';
    if (context.healthGoals?.length) prompt += `Goals: ${context.healthGoals.join(', ')}\n`;
    if (context.currentStreak) prompt += `Current streak: ${context.currentStreak} days\n`;
    if (context.recentMeals?.length) prompt += `Recent foods: ${context.recentMeals.map(m => m.name).join(', ')}\n`;
    return prompt;
  }

  private parseRecommendations(response: string): string[] {
    const lines = response.split('\n').filter(l => l.trim().length > 0);
    return lines
      .filter(l => /^\d+\./.test(l.trim()) || l.trim().startsWith('-'))
      .map(l => l.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
      .slice(0, 5);
  }

  private parseRecipeResponse(text: string) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { /* fall through */ }
    return this.getFallbackRecipe([], undefined);
  }

  private getFallbackRecommendations(timeOfDay: string, gaps: { proteinDeficit: number; fiberDeficit: number }): string[] {
    const recs: string[] = [];
    if (gaps.proteinDeficit > 20) recs.push('Grilled chicken salad with quinoa');
    if (gaps.fiberDeficit > 10) recs.push('Mixed berry smoothie bowl with chia seeds');
    const meals: Record<string, string[]> = {
      breakfast: ['Greek yogurt parfait with granola', 'Veggie omelet with whole grain toast'],
      lunch: ['Mediterranean chickpea bowl', 'Turkey & avocado wrap with side salad'],
      dinner: ['Baked salmon with roasted veggies & brown rice', 'Lentil curry with cauliflower rice'],
      snack: ['Apple slices with almond butter', 'Mixed nuts & dark chocolate'],
    };
    return [...recs, ...(meals[timeOfDay] || meals.snack)].slice(0, 5);
  }

  private getFallbackRecipe(
    ingredients: string[],
    _prefs?: { cuisine?: string; dietaryRestrictions?: string[]; maxCalories?: number }
  ) {
    return {
      name: ingredients.length > 0 ? `${ingredients[0]} Delight` : 'Healthy Bowl',
      description: `A nutritious meal featuring ${ingredients.slice(0, 3).join(', ') || 'fresh ingredients'}`,
      instructions: [
        'Wash and prepare all ingredients',
        `Combine ${ingredients.join(', ')} in a bowl or pan`,
        'Season to taste',
        'Cook until done and serve hot',
      ],
      estimatedNutrition: { calories: 380, protein: 28, carbs: 42, fats: 12 },
    };
  }

  private getFallbackChatResponse(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('calorie') || lower.includes('calories')) {
      return "Great question about calories! A balanced diet typically needs 1800-2500 calories per day depending on your activity level. Focus on nutrient-dense foods to stay within your goal! 🥗";
    }
    if (lower.includes('protein')) {
      return "Protein is essential for muscle repair and satiety! Aim for 0.8-1g per kg of bodyweight. Great sources: chicken, fish, eggs, lentils, and Greek yogurt. 💪";
    }
    if (lower.includes('streak') || lower.includes('motivation')) {
      return "You're doing amazing! Consistency is the key to lasting health. Every meal logged is a step toward your goals. Keep going! 🔥";
    }
    return "That's a great question! As your NutriSense AI coach, I recommend focusing on whole foods, staying hydrated, and maintaining consistent meal timing for optimal health results. 🌟";
  }
}

export const sarvamService = new SarvamService();
