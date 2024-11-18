import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Constants
const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = "15 m";

// Route matchers
const protectedRoutes = createRouteMatcher([
  "/dashboard(.*)",
  "/forum(.*)",
  "/events(.*)",
]);

const authRoutes = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  cache: "no-store",
});

// Initialize rate limiter
const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "15 m"),
  analytics: true,
});

// Security headers
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// Helper functions
async function handleRateLimit(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success, remaining, reset } = await rateLimiter.limit(
    `${ip}:${req.nextUrl.pathname}`,
  );

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": RATE_LIMIT.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    });
  }
  return null;
}

async function getUserRole(userId: string) {
  const cachedRole = await redis.get(`user_role:${userId}`);
  return cachedRole || "ATTENDEE";
}

async function createSecureResponse(req: NextRequest, userId: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", userId);

  const userRole = await getUserRole(userId);
  requestHeaders.set("x-user-role", userRole.toString());

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Add security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  return response;
}

// Main middleware
export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId, redirectToSignIn } = await auth();

    // Check rate limit
    const rateLimitResponse = await handleRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    // Handle authentication
    if (!userId && protectedRoutes(req)) {
      return redirectToSignIn({
        returnBackUrl: new URL(req.url).pathname,
      });
    }

    if (userId && authRoutes(req)) {
      return Response.redirect(new URL("/dashboard", req.url));
    }

    // Add security headers and user info for authenticated requests
    if (userId) {
      return createSecureResponse(req, userId);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/:path*",
    "/(.*)",
  ],
};
