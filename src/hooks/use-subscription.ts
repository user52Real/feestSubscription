// src/hooks/use-subscription.ts
import { useState, useEffect } from 'react';
import { 
  SUBSCRIPTION_PLANS, 
  SubscriptionTier,
  SubscriptionStatus,
  type SubscriptionData
} from '@/types/subscription';

export interface UseSubscriptionReturn {
  subscription: SubscriptionData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const subscriptionData = await response.json();
      setData(subscriptionData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return {
    subscription: data,
    isLoading,
    error,
    refresh: fetchSubscription
  };
}