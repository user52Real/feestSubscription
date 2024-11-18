"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS, SubscriptionTier } from "@/types/subscription";
import { Check } from "lucide-react";

interface PricingTableProps {
  currentPlan?: string;
  onSubscribe: (planId: SubscriptionTier) => Promise<void>;
  isLoading: boolean;
}

export function PricingTable({ 
  currentPlan, 
  onSubscribe, 
  isLoading 
}: PricingTableProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
        const isCurrentPlan = currentPlan === key;
        
        return (
          <Card key={key} className="p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>
            
            <div className="text-3xl font-bold">
              ${plan.price}
              <span className="text-sm font-normal text-muted-foreground">
                /month
              </span>
            </div>

            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              disabled={isLoading || isCurrentPlan}
              onClick={() => onSubscribe(key as SubscriptionTier)}
            >
              {isLoading
                ? "Loading..."
                : isCurrentPlan
                ? "Current Plan"
                : "Subscribe"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}