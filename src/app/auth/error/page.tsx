'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'Configuration':
          setError('There is a problem with the server configuration.');
          break;
        case 'AccessDenied':
          setError('You do not have access to this resource.');
          break;
        case 'Verification':
          setError('The verification failed or token has expired.');
          break;
        case 'CredentialsSignin':
          setError('The credentials you provided are invalid.');
          break;
        default:
          setError('An unknown error occurred during authentication.');
          break;
      }
    } else {
      setError('An unknown error occurred during authentication.');
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-card mx-auto w-full max-w-md rounded-lg border p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-destructive text-3xl font-bold">
            Authentication Error
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">{error}</p>
        </div>
        <div className="mt-6 space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
