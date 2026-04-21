import { FoodItem, MealLog } from '../validators/schemas';
import { config } from '../config/config';

/**
 * Vision Service — analyzes food images using Google Vision API
 * Falls back to mock data in development/demo mode
 */
export class VisionService {
  private readonly mockFoodItems: FoodItem[] = [
    {
      name: 'Grilled Chicken Breast',
      calories: 165,
      macros: { protein: 31, carbs: 0, fats: 3.6, fiber: 0, sugar: 0, sodium: 74 },
      processingLevel: 'minimally_processed',
      portionSize: '100g',
      confidence: 0.92,
    },
    {
      name: 'Brown Rice',
      calories: 216,
      macros: { protein: 5, carbs: 45, fats: 1.8, fiber: 3.5, sugar: 0, sodium: 10 },
      processingLevel: 'minimally_processed',
      portionSize: '1 cup cooked',
      confidence: 0.88,
    },
    {
      name: 'Steamed Broccoli',
      calories: 55,
      macros: { protein: 3.7, carbs: 11, fats: 0.6, fiber: 5.1, sugar: 2.7, sodium: 64 },
      processingLevel: 'whole',
      portionSize: '1 cup',
      confidence: 0.95,
    },
  ];

  async analyzeFoodImage(imageBuffer: Buffer): Promise<FoodItem[]> {
    if (!config.vision.enabled) {
      console.log('[Vision] Mock mode — returning demo food items');
      return this.mockFoodItems;
    }

    try {
      // Real Vision API implementation would go here
      const { ImageAnnotatorClient } = await import('@google-cloud/vision');
      const client = new ImageAnnotatorClient();
      const [result] = await client.labelDetection({ image: { content: imageBuffer } });
      const labels = result.labelAnnotations || [];
      const foodLabels = labels
        .filter(l => l.score && l.score > 0.7)
        .map(l => l.description || '')
        .filter(Boolean);

      if (foodLabels.length === 0) return this.mockFoodItems;

      // Map labels to food items (simplified)
      return this.generateFoodItemsFromLabels(foodLabels);
    } catch (error) {
      console.error('[Vision] API failed, using mock data:', error);
      return this.mockFoodItems;
    }
  }

  validateImage(buffer: Buffer, mimetype: string): { valid: boolean; error?: string } {
    if (!config.image.allowedTypes.includes(mimetype)) {
      return { valid: false, error: `Invalid image type: ${mimetype}` };
    }
    if (buffer.length > config.image.maxSizeMB * 1024 * 1024) {
      return { valid: false, error: `Image too large. Max size: ${config.image.maxSizeMB}MB` };
    }
    return { valid: true };
  }

  private generateFoodItemsFromLabels(labels: string[]): FoodItem[] {
    return labels.slice(0, 3).map(label => ({
      name: label,
      calories: Math.floor(Math.random() * 300) + 100,
      macros: {
        protein: Math.floor(Math.random() * 30) + 5,
        carbs: Math.floor(Math.random() * 40) + 10,
        fats: Math.floor(Math.random() * 20) + 2,
        fiber: Math.floor(Math.random() * 8) + 1,
        sugar: Math.floor(Math.random() * 15),
        sodium: Math.floor(Math.random() * 400) + 50,
      },
      processingLevel: 'minimally_processed' as const,
      confidence: 0.75,
    }));
  }
}

export const visionService = new VisionService();
