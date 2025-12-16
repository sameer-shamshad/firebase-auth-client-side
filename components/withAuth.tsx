'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { initializeAuth } from '@/store/features/AuthReducer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/**
 * Higher Order Component (HOC) to protect routes that require authentication
 * 
 * This HOC relies on `initializeAuth` (called in App.tsx) which already:
 * - Checks Firebase session
 * - Fetches user profile if authenticated
 * - Loads from localStorage if fetch fails
 * 
 * The HOC simply checks Redux state and redirects if user is not authenticated.
 * 
 * Usage:
 * ```tsx
 * import withAuth from '@/components/withAuth';
 * 
 * function MyProtectedPage() {
 *   return <div>Protected Content</div>;
 * }
 * 
 * export default withAuth(MyProtectedPage);
 * ```
 * 
 * For layouts:
 * ```tsx
 * function MyProtectedLayout({ children }) {
 *   return <div>{children}</div>;
 * }
 * 
 * export default withAuth(MyProtectedLayout);
 * ```
 */
export default function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isMounted, setIsMounted] = useState(false);
    const hasInitializedRef = useRef(false); // Track if we've already initialized
    const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);

    // Track if component is mounted (client-side only)
    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      // Only check auth after component is mounted (client-side only)
      if (!isMounted) return;

      // Only initialize once, not every time user becomes null
      // This prevents re-initialization on logout
      if (!hasInitializedRef.current && !isLoading && !isAuthenticated) {
        hasInitializedRef.current = true;
        dispatch(initializeAuth());
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, isLoading, dispatch]); // Intentionally excluding 'user' to prevent infinite loops on logout

    // Show loading state during SSR and initial client render to prevent hydration mismatch
    if (!isMounted || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-primary-foreground">Loading...</div>
        </div>
      );
    }

    // If user is not authenticated, show a friendly message with a button to navigate to login
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="w-full max-w-md border border-border bg-background p-6 rounded-2xl flex flex-col gap-4 text-center">
            <h1 className="text-2xl font-bold text-left text-primary-foreground">
              Authentication Required
            </h1>
            <p className="text-sm text-secondary-foreground text-left">
              The route you are trying to access requires sign-in. Please sign in to continue.
            </p>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="bg-primary text-sm text-secondary px-4 py-3 font-semibold rounded-md transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    // User is authenticated, render the protected component
    return <Component {...props} />;
  };
}

