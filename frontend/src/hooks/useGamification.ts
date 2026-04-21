import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  icon: string;
}

export interface GamificationStatus {
  points: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  tier: string;
  nextMilestone?: {
    name: string;
    pointsRequired: number;
    currentProgress: number;
  };
}

export function useGamification(userId: string = 'demo-user') {
  const [status, setStatus] = useState<GamificationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/gamify/status?userId=${userId}`);
      setStatus(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch gamification status');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refreshStatus: fetchStatus
  };
}
