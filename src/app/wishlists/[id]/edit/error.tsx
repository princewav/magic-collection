'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Wishlist edit error:', error);
  }, [error]);

  return (
    <div className="border-destructive bg-destructive/10 flex flex-col items-center justify-center rounded-md border p-6 text-center">
      <AlertTriangle className="text-destructive mb-4 h-10 w-10" />
      <h2 className="mb-2 text-xl font-semibold">Error Loading Wishlist</h2>
      <p className="text-muted-foreground mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
