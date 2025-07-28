'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
    }
    
    // Log to external error tracking service in production
    if (process.env.NODE_ENV === 'production' && error.digest) {
      // TODO: Replace with your error tracking service
      // e.g., Sentry, LogRocket, etc.
      console.error('Error digest:', error.digest);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2 text-destructive">Oops! Something went wrong</h2>
        <p className="text-muted-foreground mb-4">
          We encountered an unexpected error. The issue has been logged and our team will look into it.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Go to home
          </button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}