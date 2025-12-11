'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { useRouter, useSearchParams } from 'next/navigation';
import loginMachine from '@/machines/LoginMachine';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, send] = useMachine(loginMachine);

  // Fetch email from URL query parameters and pre-fill the form
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) { // Decode the email parameter and set it in the form
      const decodedEmail = decodeURIComponent(emailFromUrl);
      send({ type: 'CHANGE_FIELD', field: 'email', value: decodedEmail });
    }
  }, [searchParams, send]);

  // Redirect to dashboard on successful login
  useEffect(() => {
    if (state.matches('success') && state.context.authResponse) {
      router.push('/dashboard');
    }
  }, [state, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send({ type: 'SUBMIT' });
  };

  const handleChange = (field: 'email' | 'password', value: string) => {
    send({ type: 'CHANGE_FIELD', field, value });
  };

  const isSubmitting = state.matches('submitting');
  const isSuccess = state.matches('success');

  return (
    <div className="flex flex-col items-center py-8 px-4 sm:px-0 sm:py-20">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-sm border border-border bg-background p-4 rounded-2xl flex flex-col gap-3 
        [&>div>label]:mb-1 [&>div>label]:block [&>div>label]:text-sm [&>div>label]:font-medium [&>div>label]:text-primary-foreground 
        
        [&>div>input]:w-full [&>div>input]:rounded-md [&>div>div]:relative
        [&>div>div>input]:w-full [&>div>div>input]:rounded-md 
        [&>div>div>input]:disabled:cursor-not-allowed [&>div>div>input]:disabled:opacity-50
        [&>div>input]:border [&>div>input]:border-border [&>div>input]:bg-background 
        [&>div>input]:text-primary-foreground [&>div>input]:px-3 [&>div>input]:py-2 
        [&>div>input]:focus:outline-none [&>div>input]:focus:ring-2 [&>div>input]:focus:ring-primary 
        [&>div>input]:disabled:cursor-not-allowed [&>div>input]:disabled:opacity-50
        
        [&>div>div>input]:border [&>div>div>input]:border-border [&>div>div>input]:bg-background 
        [&>div>div>input]:text-primary-foreground [&>div>div>input]:px-3 [&>div>div>input]:py-2 
        [&>div>div>input]:focus:outline-none [&>div>div>input]:focus:ring-2 [&>div>div>input]:focus:ring-primary"
      >
        <header className="text-3xl font-extrabold text-primary-foreground text-center">
          Sign In
        </header>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={state.context.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isSubmitting || isSuccess}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <div>
            <input
              id="password"
              type="password"
              value={state.context.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={isSubmitting || isSuccess}
              placeholder="Enter your password"
            />
            <button 
              type="button" 
              className="material-symbols-outlined absolute right-3 top-1/2! -translate-y-1/2! cursor-pointer"
            >visibility</button>
          </div>
        </div>

        {state.context.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {state.context.error}
          </div>
        )}

        {isSuccess && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Login successful! Redirecting...
          </div>
        )}

        <Link href="/forgot-password" className="text-xs text-secondary-foreground text-center font-semibold py-1 hover:opacity-80 hover:underline">
          Forgot password?
        </Link>

        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="bg-primary text-secondary px-4 py-2 font-semibold rounded-md transition-colors hover:opacity-90
          disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : isSuccess ? 'Success!' : 'Sign In'}
        </button>
        <div>
          <p className="mb-4 text-center text-sm text-secondary-foreground">
            or sign in with
          </p>
          <div 
            className="flex justify-center gap-6 [&>button]:text-white [&>button]:bg-primary 
            [&>button]:rounded-full [&>button]:px-2 [&>button]:py-1 [&>button]:border [&>button]:border-border 
            [&>button]:transition-colors [&>button]:hover:opacity-80 [&>button]:focus:opacity-90 
            [&>button]:disabled:cursor-not-allowed [&>button]:disabled:opacity-50"
          >
            <button type="button" className="bi bi-google" aria-label="Sign in with Google" />
            <button type="button" className="bi bi-github" aria-label="Sign in with GitHub" />
            <button type="button" className="bi bi-facebook" aria-label="Sign in with Facebook" />
          </div>
        </div>

        <p className="text-center text-sm text-secondary-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary hover:opacity-80"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
