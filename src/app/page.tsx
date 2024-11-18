import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Users, BarChart3, Zap, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center space-y-8 px-4 py-24 text-center lg:py-32">
        <Badge className="mb-4" variant="secondary">
          ✨ Your events, managed perfectly
        </Badge>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Event Management
          <span className="block bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Made Simple
          </span>
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Create, manage, and host remarkable events. From intimate gatherings to
          grand conferences, we've got you covered.
        </p>
        <div className="flex flex-col gap-4 min-[400px]:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/sign-up">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">
              Sign In
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-2 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <Calendar className="mb-4 h-8 w-8 text-primary" />
          <h3 className="mb-2 font-semibold">Smart Scheduling</h3>
          <p className="text-sm text-muted-foreground">
            Intelligent calendar management with conflict detection and timezone support.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <Users className="mb-4 h-8 w-8 text-primary" />
          <h3 className="mb-2 font-semibold">Attendee Management</h3>
          <p className="text-sm text-muted-foreground">
            Seamlessly manage guest lists, RSVPs, and check-ins with real-time updates.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <BarChart3 className="mb-4 h-8 w-8 text-primary" />
          <h3 className="mb-2 font-semibold">Insightful Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive analytics and reporting to track event performance.
          </p>
        </div>
      </div>

      {/* Stats Section
      <div className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold">10K+</div>
              <div className="mt-2 text-sm text-muted-foreground">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">50K+</div>
              <div className="mt-2 text-sm text-muted-foreground">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">99%</div>
              <div className="mt-2 text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Feature Highlights */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to run successful events
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features to help you manage events of any size
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Real-time Updates</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Stay informed with instant notifications and live event updates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Easy Check-ins</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Streamlined check-in process with QR codes and mobile support.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Time Management</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Schedule and coordinate multiple events with ease.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Team Collaboration</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Work together with team members and coordinate responsibilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 px-6 py-20 text-center shadow-xl">
            <div className="relative z-10">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">
                Ready to transform your events?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
                Join thousands of event organizers who trust our platform.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link href="/sign-up">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Get Started Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute left-1/2 top-0 h-[120%] w-[120%] -translate-x-1/2 -translate-y-[10%] rotate-12 bg-white/5" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                © 2024 Event Platform. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}