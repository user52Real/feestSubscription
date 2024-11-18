import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SubscriptionContent } from "@/components/subscription/subscription-content";
import { getCurrentSubscription } from "@/lib/subscription/subscription-service";

export default async function SubscriptionPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const subscription = await getCurrentSubscription(userId);

  return <SubscriptionContent currentPlan={subscription?.plan} />;
}