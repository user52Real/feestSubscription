"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { toast } from "@/hooks/use-toast";
import { SUBSCRIPTION_PLANS, Feature } from "@/types/subscription";

export function PricingTable() {
  const { plan: currentPlan } = useSubscription();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId,  // Make sure this is being passed
          status: 'active'
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update subscription');
      }
  
      const data = await response.json();
      // Handle successful subscription
    } catch (error) {
      console.error('Error:', error);
      // Handle error
    }
  };

  const formatFeatureName = (feature: Feature): string => {
    return feature.split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => (
        <Card key={id} className={currentPlan.id === id ? "border-primary" : undefined}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              {plan.price === 0 ? "Free" : `$${plan.price}/month`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                {plan.limits.eventsPerMonth === -1 
                  ? "Unlimited events" 
                  : `${plan.limits.eventsPerMonth} events per month`}
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                Up to {plan.limits.guestsPerEvent} guests per event
              </li>
              {plan.limits.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  {formatFeatureName(feature)}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              variant={currentPlan.id === id ? "outline" : "default"}
              disabled={currentPlan.id === id || isLoading === id}
              onClick={() => handleSubscribe(id)}
            >
              {isLoading === id 
                ? "Processing..." 
                : currentPlan.id === id 
                ? "Current Plan" 
                : "Subscribe"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}