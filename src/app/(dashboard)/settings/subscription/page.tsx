import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PricingTable } from "@/components/subscription/pricing-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentSubscription } from "@/lib/subscription/subscription-service";

import { SubscriptionContent } from "@/components/subscription/subscription-content";

export default async function SubscriptionPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const subscription = await getCurrentSubscription(userId);

  // return (
  //   <div className="container max-w-6xl py-6 space-y-8">
  //     <div className="space-y-2">
  //       <h1 className="text-3xl font-bold">Subscription Settings</h1>
  //       <p className="text-muted-foreground">
  //         Manage your subscription and billing
  //       </p>
  //     </div>

  //     {subscription && (
  //       <Card className="p-6">
  //         <div className="flex items-center justify-between">
  //           <div>
  //             <h2 className="text-xl font-semibold">
  //               Current Plan: {subscription.plan}
  //             </h2>
  //             <p className="text-muted-foreground">
  //               Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
  //             </p>
  //           </div>
  //           <Button
  //             variant="outline"
  //             onClick={async () => {
  //               const response = await fetch('/api/subscriptions/portal', {
  //                 method: 'POST'
  //               });
  //               const data = await response.json();
  //               window.location.href = data.url;
  //             }}
  //           >
  //             Manage Billing
  //           </Button>
  //         </div>
  //       </Card>
  //     )}

  //     <div className="space-y-4">
  //       <h2 className="text-2xl font-bold">Available Plans</h2>
  //       <SubscriptionContent />
  //     </div>
  //   </div>
  // );
  return <SubscriptionContent />;
}