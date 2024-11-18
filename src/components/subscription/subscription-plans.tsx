"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { SUBSCRIPTION_PLANS, SubscriptionPlan, SubscriptionTier } from "@/types/subscription";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface Subscription {
  planId: SubscriptionTier;
  status: 'active' | 'past_due' | 'canceled' | 'inactive';
  currentPeriodEnd: string;
}

interface SubscriptionPlansProps {
  currentSubscription: Subscription | null;
}

export function SubscriptionPlans({ currentSubscription }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubscribe = async (planId: SubscriptionTier) => {
    try {
      setLoading(planId);

      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
      if (!stripe) throw new Error("Stripe failed to load");

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoading("manage");
      const response = await fetch("/api/subscriptions/portal", {
        method: "POST",
      });
      const data = await response.json();
      router.push(data.url);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {currentSubscription && (
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Current Subscription</h2>
          <div className="space-y-2">
            <p>
              Plan:{" "}
              <span className="font-medium">
                {SUBSCRIPTION_PLANS[currentSubscription.planId].name}
              </span>
            </p>
            <p>
              Status:{" "}
              <span 
                className={
                  currentSubscription.status === "active"
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              >
                {currentSubscription.status}
              </span>
            </p>
            <p>
              Current Period Ends:{" "}
              {formatDate(new Date(currentSubscription.currentPeriodEnd))}
            </p>
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={loading === "manage"}
            >
              {loading === "manage" && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Manage Billing
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionTier, SubscriptionPlan][]).map(([id, plan]) => (
          <Card 
            key={id}
            className={
              currentSubscription?.planId === id 
                ? "border-primary"
                : undefined
            }
          >
            <CardHeader>
              <CardTitle>
                {plan.name}
                {currentSubscription?.planId === id && (
                  <span className="ml-2 text-sm text-primary">Current Plan</span>
                )}
              </CardTitle>
              <div className="text-2xl font-bold">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4 text-primary" />
                  {plan.limits.eventsPerMonth === -1
                    ? "Unlimited events"
                    : `${plan.limits.eventsPerMonth} events per month`}
                </li>
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4 text-primary" />
                  {plan.limits.guestsPerEvent} guests per event
                </li>
                {plan.limits.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    {feature
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={
                  currentSubscription?.planId === id ? "outline" : "default"
                }
                disabled={
                  loading !== null ||
                  currentSubscription?.planId === id ||
                  (currentSubscription?.status === "past_due" && plan.price > 0)
                }
                onClick={() => handleSubscribe(id)}
              >
                {loading === id && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {currentSubscription?.planId === id
                  ? "Current Plan"
                  : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}