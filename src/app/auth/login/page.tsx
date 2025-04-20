'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Github, Mail } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to your account to continue
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => signIn('github', { callbackUrl: '/' })}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => signIn('google', { callbackUrl: '/' })}
          >
            <Mail className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
