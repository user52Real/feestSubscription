// src/hooks/use-subscription.ts
import { useState, useEffect } from 'react';
import { 
  SUBSCRIPTION_PLANS, 
  type SubscriptionPlan,
  type SubscriptionTier
} from '@/types/subscription';

interface SubscriptionData {
  planId: SubscriptionTier;
  plan: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd: Date;
  isCanceled?: boolean;
}

export interface UseSubscriptionReturn {
  plan: SubscriptionPlan;
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

  // Get the current plan based on subscription or default to FREE
  const currentPlan = data 
    ? SUBSCRIPTION_PLANS[data.planId] 
    : SUBSCRIPTION_PLANS.FREE;

  return {
    plan: {
      ...currentPlan,
      status: data?.status || 'active',
    },
    isLoading,
    error,
    refresh: fetchSubscription
  };
}