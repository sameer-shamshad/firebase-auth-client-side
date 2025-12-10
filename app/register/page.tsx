'use client';

import { useMachine } from '@xstate/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import registerMachine from '@/machines/RegisterMachine';
import { login } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [state, send] = useMachine(registerMachine);

  // Auto-login after successful registration
  useEffect(() => {
    if (state.matches('success')) {
      if (state.context.authResponse) {
        // If registration already returned auth tokens, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If registration didn't return tokens, auto-login with the credentials
        // Capture credentials before form is cleared
        const { email, password } = state.context;
        if (email && password) {
          login(email, password)
            .then((response) => {
              // Store tokens
              localStorage.setItem('accessToken', response.accessToken);
              localStorage.setItem('refreshToken', response.refreshToken);
              // Redirect to dashboard
              router.push('/dashboard');
            })
            .catch((error) => {
              // If auto-login fails, show error but user can manually login
              console.error('Auto-login failed:', error);
              // Still redirect to login page so user can manually login
              router.push('/login');
            });
        }
      }
    }
  }, [state, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send({ type: 'SUBMIT' });
  };

  const handleChange = (
    field: 'username' | 'email' | 'password' | 'confirmPassword',
    value: string
  ) => {
    send({ type: 'CHANGE_FIELD', field, value });
  };

  const isSubmitting = state.matches('submitting');
  const isSuccess = state.matches('success');

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={state.context.username}
              onChange={(e) => handleChange('username', e.target.value)}
              disabled={isSubmitting || isSuccess}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={state.context.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isSubmitting || isSuccess}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={state.context.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={isSubmitting || isSuccess}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              placeholder="Enter your password (min 7 characters)"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={state.context.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              disabled={isSubmitting || isSuccess}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              placeholder="Confirm your password"
            />
          </div>

          {state.context.error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {state.context.error}
            </div>
          )}

          {isSuccess && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Registration successful! Logging you in...
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSubmitting
              ? 'Creating account...'
              : isSuccess
                ? 'Success!'
                : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

