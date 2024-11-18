import { useCallback, useState } from 'react';

export function useErrorBoundary() {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback((error: Error) => {
    setHasError(true);
    // Log to your error reporting service
    console.error('Error caught by boundary:', error);
  }, []);

  const resetError = useCallback(() => {
    setHasError(false);
  }, []);

  return {
    hasError,
    handleError,
    resetError,
  };
}