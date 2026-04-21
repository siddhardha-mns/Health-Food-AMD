import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface FoodItem {
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

export interface RecommendationResponse {
  data: {
    recommendations: string[];
    nutritionContext: {
      caloriesRemaining: number;
      proteinDeficit: number;
      fiberDeficit: number;
    };
  };
}

export function useNutrients(userId: string = 'demo-user') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiClient.post(`/analyze?userId=${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getRecommendations = useCallback(async (timeOfDay: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<RecommendationResponse>(`/recommend?userId=${userId}&timeOfDay=${timeOfDay}`);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    analyzeImage,
    getRecommendations,
    loading,
    error
  };
}
