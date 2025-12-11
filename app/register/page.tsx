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
              localStorage.setItem('accessToken', response.accessToken);
              localStorage.setItem('refreshToken', response.refreshToken);
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
    <div className="flex flex-col items-center h-screen py-8 px-4 sm:px-0 sm:py-20">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-sm border border-border bg-background p-4 rounded-2xl flex flex-col gap-3 
        [&>div>label]:mb-1 [&>div>label]:block [&>div>label]:text-sm [&>div>label]:font-medium 
        [&>div>label]:text-primary-foreground [&>div>input]:w-full [&>div>input]:rounded-md 
        [&>div>input]:border [&>div>input]:border-border [&>div>input]:bg-background 
        [&>div>input]:text-primary-foreground [&>div>input]:px-3 [&>div>input]:py-2 
        [&>div>input]:focus:outline-none [&>div>input]:focus:ring-2 [&>div>input]:focus:ring-primary 
        [&>div>input]:disabled:cursor-not-allowed [&>div>input]:disabled:opacity-50"
      >
        <header className="text-3xl font-extrabold text-primary-foreground text-center">
          Sign Up
        </header>

        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={state.context.username}
            onChange={(e) => handleChange('username', e.target.value)}
            disabled={isSubmitting || isSuccess}
            placeholder="Enter your username"
          />
        </div>

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
          <input
            id="password"
            type="password"
            value={state.context.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={isSubmitting || isSuccess}
            placeholder="Enter your password (min 7 characters)"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={state.context.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            disabled={isSubmitting || isSuccess}
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
          className="bg-primary text-secondary px-4 py-2 mt-5 font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onMouseEnter={(e) => {
            if (!isSubmitting && !isSuccess) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {isSubmitting
            ? 'Creating account...'
            : isSuccess
              ? 'Success!'
              : 'Sign Up'}
        </button>
        <div>
          <p className="mb-3 text-center text-sm text-secondary-foreground">
            or sign up with
          </p>
          <div 
            className="flex justify-center gap-6 [&>button]:text-white [&>button]:bg-primary 
              [&>button]:rounded-full [&>button]:px-2 [&>button]:py-1 [&>button]:border [&>button]:border-border 
              [&>button]:transition-colors [&>button]:hover:opacity-80 [&>button]:focus:outline-none 
              [&>button]:focus:ring-2 [&>button]:focus:ring-offset-2 [&>button]:disabled:cursor-not-allowed 
              [&>button]:disabled:opacity-50"
          >
            <button type="button" className="bi bi-google" aria-label="Sign up with Google" />
            <button type="button" className="bi bi-github" aria-label="Sign up with GitHub" />
            <button type="button" className="bi bi-facebook" aria-label="Sign up with Facebook" />
          </div>
        </div>

        <p className="text-center text-sm text-secondary-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary hover:opacity-80"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

