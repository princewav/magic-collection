'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the credentials provider to sign in
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!response?.ok) {
        throw new Error(response?.error || 'Invalid credentials');
      }

      // Redirect on success
      toast.success('Signed in successfully');
      window.location.href = callbackUrl; // Use window.location to ensure full page reload
    } catch (error: any) {
      console.error('Login failed:', error);

      // Provide more descriptive error messages
      let errorMessage = 'An error occurred during sign in';

      if (error.message === 'CredentialsSignin') {
        errorMessage =
          'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-card w-full max-w-md rounded-lg border p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
          </Button>
        </form>

        <div className="relative mt-6 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="border-muted w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card text-muted-foreground px-2 uppercase">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('google', { callbackUrl })}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
