import { useState, useCallback, Fragment, ReactNode, JSX, createElement } from "react";
import { useSubscription } from "./use-subscription";
import { Feature, SubscriptionPlan, SubscriptionTier } from "@/types/subscription";


interface UseSubscriptionReturn {
  plan: SubscriptionPlan;
  isLoading: boolean;
  subscription: {
    planId: SubscriptionTier;
    status: string;
    currentPeriodEnd: Date;
    isCanceled: boolean;
    usage: {
      eventsCreated: number;
      totalGuests: number;
      lastReset: Date;
    };
    limits: {
      maxEvents: number;
      maxGuestsPerEvent: number;
      features: Feature[];
    };
  };
}

interface UseFeatureAccessReturn {
  checkFeature: (feature: Feature) => boolean;
  requireFeature: (feature: Feature, fallback?: ReactNode) => 
    (props: { children: ReactNode }) => JSX.Element | null;
  showUpgradeDialog: (feature: Feature) => void;
  isLoading: boolean;
}

interface FeatureGateProps {
  children: ReactNode;
}

export function useFeatureAccess(): UseFeatureAccessReturn {
  const { subscription, isLoading } = useSubscription() as unknown as UseSubscriptionReturn;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [requiredFeature, setRequiredFeature] = useState<Feature | null>(null);

  const checkFeature = useCallback((feature: Feature): boolean => {
    if (isLoading || !subscription || !subscription.limits || !subscription.limits.features) {
      return false;
    }

    return subscription.limits.features.includes(feature);
  }, [isLoading, subscription]);

  const showUpgradeDialog = useCallback((feature: Feature) => {
    setRequiredFeature(feature);
    setShowUpgrade(true);
  }, []);

  const requireFeature = useCallback((
    feature: Feature,
    fallback: ReactNode = null
  ) => {
    return function FeatureGate({ children }: FeatureGateProps): JSX.Element | null {
      const hasFeature = checkFeature(feature);
      
      if (!hasFeature) {
        if (fallback) return createElement(Fragment, null, fallback);
        showUpgradeDialog(feature);
        return null;
      }
      
      return createElement(Fragment, null, children);
    };
  }, [checkFeature, showUpgradeDialog]);

  return {
    checkFeature,
    requireFeature,
    showUpgradeDialog,
    isLoading
  };
}