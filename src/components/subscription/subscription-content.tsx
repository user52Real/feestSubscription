"use client";

import { PricingTable } from "@/components/subscription/pricing-table";

export function SubscriptionContent() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>
      <PricingTable />
    </div>
  );
}