'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const type = (params?.type as string) || 'paper';
  const otherType = type === 'paper' ? 'arena' : 'paper';

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(`Decks (${type}) error:`, error);
  }, [error, type]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="border-destructive bg-destructive/10 flex max-w-md flex-col items-center justify-center rounded-md border p-6 text-center">
        <AlertTriangle className="text-destructive mb-4 h-10 w-10" />
        <h2 className="mb-2 text-xl font-semibold">Error Loading Decks</h2>
        <p className="text-muted-foreground mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex flex-wrap gap-4">
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
          <Link href={`/decks/${otherType}`}>
            <Button>
              View {otherType.charAt(0).toUpperCase() + otherType.slice(1)}{' '}
              Decks
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
