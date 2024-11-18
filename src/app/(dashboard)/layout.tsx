import { Navbar } from "@/components/layout/navbar";
import { SubscriptionProvider } from "@/components/subscription/SubscriptionProvider";
import { initialProfile } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initialProfile();

  return (
    <SubscriptionProvider>
      <div className="h-full">
        <Navbar />
        <main className="container mx-auto h-full py-6">{children}</main>
      </div>
    </SubscriptionProvider>
  );
}