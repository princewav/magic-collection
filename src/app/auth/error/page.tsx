'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  useEffect(() => {
    if (!error) {
      router.push('/auth/login');
    }
  }, [error, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-destructive text-3xl font-bold">Error</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {error === 'OAuthSignin' &&
              'Error during sign in. Please try again.'}
            {error === 'OAuthCallback' &&
              'Error during OAuth callback. Please try again.'}
            {error === 'OAuthCreateAccount' &&
              'Error creating account. Please try again.'}
            {error === 'EmailCreateAccount' &&
              'Error creating account. Please try again.'}
            {error === 'Callback' && 'Error during callback. Please try again.'}
            {error === 'OAuthAccountNotLinked' &&
              'Email already in use with different provider.'}
            {error === 'EmailSignin' && 'Check your email address.'}
            {error === 'CredentialsSignin' &&
              'Sign in failed. Check the details you provided are correct.'}
            {error === 'Default' && 'An error occurred. Please try again.'}
          </p>
        </div>
        <div className="mt-8">
          <Button className="w-full" onClick={() => router.push('/auth/login')}>
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
