// src/components/subscription/subscription-content.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingTable } from "./pricing-table";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionTier } from "@/types/subscription";

interface SubscriptionContentProps {
  currentPlan?: string;
}

export function SubscriptionContent({ currentPlan }: SubscriptionContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);  

  const handleSubscribe = async (planId: SubscriptionTier) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        router.push(data.url);
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the perfect plan for your needs
        </p>
      </div>

      <PricingTable
        currentPlan={currentPlan}
        onSubscribe={handleSubscribe}
        isLoading={isLoading}
      />
    </div>
  );
}