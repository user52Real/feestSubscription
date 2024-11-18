"use client"

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { FallbackProps } from 'react-error-boundary';

export function GlobalError({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    // Log to error reporting service
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-destructive">Something went wrong!</h1>
        <p className="text-muted-foreground">
          We apologize for the inconvenience. Please try again.
        </p>
      </div>
      <div className="flex space-x-4">
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        <Button variant="outline" onClick={resetErrorBoundary}>Try Again</Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 max-w-xl overflow-auto rounded-md bg-muted p-4">
          <pre className="text-sm text-destructive">{error.message}</pre>
          <pre className="text-xs text-muted-foreground">{error.stack}</pre>
        </div>
      )}
    </div>
  );
}