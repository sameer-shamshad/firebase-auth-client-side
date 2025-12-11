'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logoutUser } from '@/services/auth.service';

export default function Dashboard() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Welcome to your dashboard! You have successfully logged in.
        </p>
        <button
          type='button'
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

