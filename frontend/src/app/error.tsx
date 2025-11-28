'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground max-w-md">
            We encountered an unexpected error. Don't worry, your calculation history is safe.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 p-4 bg-muted rounded-lg max-w-2xl text-left">
            <summary className="cursor-pointer font-semibold mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs overflow-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={reset}
          size="lg"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
        
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
          size="lg"
        >
          Go to home
        </Button>
      </div>
    </div>
  );
}