/** @type {import('next').NextConfig} */

import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  // Image optimization configuration
  images: {
    domains: ["res.cloudinary.com", "uploadthing.com"],
    unoptimized: process.env.NODE_ENV === "development",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Handle OpenTelemetry instrumentation warnings
    config.ignoreWarnings = [
      // Ignore warnings about critical dependency
      /Critical dependency: the request of a dependency is an expression/,
    ];

    // Handle external packages that need special treatment
    if (isServer) {
      config.externals = [...config.externals, "utf-8-validate", "bufferutil"];
    }

    // Handle OpenTelemetry instrumentation packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        perf_hooks: false,
        diagnostics_channel: false,
      };
    }

    // Enable source maps in production
    if (!dev && !isServer) {
      config.devtool = "source-map";
    }

    return config;
  },

  // Performance optimizations
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  // Cache optimization
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
    instrumentationHook: true,
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(
  withSentryConfig(nextConfig, {
    org: "shareflyt",
    project: "feest",
    authToken: process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: "shareflyt",
    project: "feest",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
);
