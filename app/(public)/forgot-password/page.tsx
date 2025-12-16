'use client';
import Link from 'next/link';
import { useMachine } from '@xstate/react';
import passwordResetMachine from '@/machines/auth/PasswordResetMachine';

export default function ForgotPasswordPage() {
  const [state, send] = useMachine(passwordResetMachine);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send({ type: 'SUBMIT' });
  };

  const handleChange = (value: string) => {
    send({ type: 'CHANGE_FIELD', field: 'email', value });
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
        [&>div>input]:text-sm [&>div>input]:text-primary-foreground [&>div>input]:px-3 [&>div>input]:py-3 
        [&>div>input]:focus:outline-none [&>div>input]:focus:ring-2 [&>div>input]:focus:ring-primary 
        [&>div>input]:disabled:cursor-not-allowed [&>div>input]:disabled:opacity-50"
      >
        <header className="text-3xl font-extrabold text-primary-foreground text-center">
          Reset Password
        </header>

        <p className="text-sm text-secondary-foreground text-center mb-4">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={state.context.email}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isSubmitting || isSuccess}
            placeholder="Enter your email"
            required
          />
        </div>

        {state.context.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {state.context.error}
          </div>
        )}

        {isSuccess && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Password reset email sent! Please check your inbox and follow the instructions to reset your password.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="bg-primary text-sm text-secondary px-4 py-3 mt-3 font-semibold hover:opacity-90 cursor-pointer rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : isSuccess ? 'Email Sent!' : 'Send Reset Link'}
        </button>

        <p className="text-center text-sm text-secondary-foreground mt-1">
          Remember your password?{' '}
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