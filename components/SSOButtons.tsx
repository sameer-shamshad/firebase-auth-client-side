'use client';
import { useEffect, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import loginMachine from '@/machines/auth/LoginMachine';
import { fetchProfileFromFirebase } from '@/store/features/AuthReducer';

interface SSOButtonsProps {
  label?: string;
  disabled?: boolean;
}

export default function SSOButtons({ label = 'or sign in with', disabled = false }: SSOButtonsProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [state, send] = useMachine(loginMachine);
  const isSSOInitiatedRef = useRef(false);

  // Redirect to dashboard on successful SSO sign-in (only for SSO, not email login)
  useEffect(() => {
    // Check if we're currently in an SSO state to track initiation
    const isInSSOState = state.matches('signingInWithGoogle') || 
      state.matches('signingInWithGithub') || 
      state.matches('signingInWithFacebook');
    
    if (isInSSOState) {
      isSSOInitiatedRef.current = true;
    }
    
    // Redirect on success if SSO was initiated
    const isSSOSuccess = state.matches('success') && 
      state.context.authResponse && 
      isSSOInitiatedRef.current;
    
    if (isSSOSuccess) {
      // Fetch profile from Firestore after successful SSO login
      dispatch(fetchProfileFromFirebase()).then(() => {
        router.push('/dashboard'); // Redirect after profile is fetched
        isSSOInitiatedRef.current = false; // Reset flag after redirect
      });
    }
  }, [state, router, dispatch]);

  const isSSOLoading = state.matches('signingInWithGoogle') || 
    state.matches('signingInWithGithub') || 
    state.matches('signingInWithFacebook');

  return (
    <div>
      <p className="mb-4 text-center text-sm text-secondary-foreground">
        {label}
      </p>
      {state.context.error && (
        <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {state.context.error}
        </div>
      )}
      <div 
        className="flex justify-center gap-6 [&>button]:text-white [&>button]:bg-primary 
        [&>button]:rounded-full [&>button]:px-2 [&>button]:py-1 [&>button]:border [&>button]:border-border 
        [&>button]:transition-colors [&>button]:hover:opacity-80 [&>button]:focus:opacity-90 
        [&>button]:disabled:cursor-not-allowed [&>button]:disabled:opacity-50"
      >
        <button 
          type="button" 
          className="bi bi-google" 
          aria-label="Sign in with Google"
          onClick={() => {
            isSSOInitiatedRef.current = true;
            send({ type: 'SIGN_IN_WITH_GOOGLE' });
          }}
          disabled={disabled || isSSOLoading}
        />
        <button 
          type="button" 
          className="bi bi-github" 
          aria-label="Sign in with GitHub"
          onClick={() => {
            isSSOInitiatedRef.current = true;
            send({ type: 'SIGN_IN_WITH_GITHUB' });
          }}
          disabled={disabled || isSSOLoading}
        />
        <button 
          type="button" 
          className="bi bi-facebook" 
          aria-label="Sign in with Facebook"
          onClick={() => {
            isSSOInitiatedRef.current = true;
            send({ type: 'SIGN_IN_WITH_FACEBOOK' });
          }}
          disabled={disabled || isSSOLoading}
        />
      </div>
    </div>
  );
}

