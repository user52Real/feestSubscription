// src/app/global-error.tsx
'use client';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Something went wrong!</h1>
            <button
              className="mt-4 rounded bg-primary px-4 py-2 text-white"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}