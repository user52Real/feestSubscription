"use client";

import { ReactNode, createElement } from "react";
import { Feature } from "@/types/subscription";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeatureGateProps {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  loadingComponent 
}: FeatureGateProps): JSX.Element | null {
  const { checkFeature, isLoading } = useFeatureAccess();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  if (isLoading) {
    return loadingComponent ? 
      createElement('div', null, loadingComponent) : 
      null;
  }

  const hasAccess = checkFeature(feature);

  if (hasAccess) {
    return createElement('div', null, children);
  }

  if (fallback) {
    return createElement('div', null, fallback);
  }

  return createElement('div', null,
    <div className="space-y-2 p-4 border rounded-md bg-muted/5">
      <p className="text-sm text-muted-foreground">
        This feature requires an upgrade
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowUpgradeDialog(true)}
      >
        Upgrade Plan
      </Button>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              This feature is available in our Pro and Business plans.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button
              className="w-full"
              onClick={() => window.location.href = '/settings/subscription'}
            >
              View Plans
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}