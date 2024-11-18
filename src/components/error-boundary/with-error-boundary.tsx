import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { GlobalError } from './global-error';

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ComponentType<FallbackProps> = GlobalError
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary FallbackComponent={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}