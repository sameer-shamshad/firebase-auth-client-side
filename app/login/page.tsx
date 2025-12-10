'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { useRouter } from 'next/navigation';
import loginMachine from '@/machines/LoginMachine';

export default function LoginPage() {
  const router = useRouter();
  const [state, send] = useMachine(loginMachine);

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
    <div className="flex flex-col items-center h-screen py-8 px-4 sm:px-0 sm:py-20">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-sm border border-border p-4 rounded-2xl flex flex-col gap-3 
        [&>div>label]:mb-2 [&>div>label]:block [&>div>label]:text-sm [&>div>label]:font-medium 
        [&>div>label]:text-primary-foreground [&>div>input]:w-full [&>div>input]:rounded-md 
        [&>div>input]:border [&>div>input]:px-3 [&>div>input]:py-2 [&>div>input]:focus:outline-none 
        [&>div>input]:focus:ring-2 [&>div>input]:disabled:cursor-not-allowed [&>div>input]:disabled:opacity-50"
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
          <label
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={state.context.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={isSubmitting || isSuccess}
            placeholder="Enter your password"
          />
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
          className="bg-primary text-secondary px-4 py-2 font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onMouseEnter={(e) => {
            if (!isSubmitting && !isSuccess) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
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
            [&>button]:transition-colors [&>button]:hover:opacity-80 [&>button]:focus:outline-none 
            [&>button]:focus:ring-2 [&>button]:focus:ring-offset-2 [&>button]:disabled:cursor-not-allowed 
            [&>button]:disabled:opacity-50">
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
