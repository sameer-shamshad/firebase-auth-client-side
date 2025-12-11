'use client';
import { useEffect, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { useRouter } from 'next/navigation';
import loginMachine from '@/machines/LoginMachine';

interface SSOButtonsProps {
  label?: string;
  disabled?: boolean;
}

export default function SSOButtons({ label = 'or sign in with', disabled = false }: SSOButtonsProps) {
  const router = useRouter();
  const [state, send] = useMachine(loginMachine);
  const isSSOInitiatedRef = useRef(false);

  // Redirect to dashboard on successful SSO sign-in (only for SSO, not email login)
  useEffect(() => {
    if (state.matches('success') && state.context.authResponse && isSSOInitiatedRef.current) {
      router.push('/dashboard');
      isSSOInitiatedRef.current = false; // Reset flag
    }
  }, [state, router]);

  const isSSOLoading = state.matches('signingInWithGoogle') || 
    state.matches('signingInWithGithub') || 
    state.matches('signingInWithFacebook');

  return (
    <div>
      <p className="mb-4 text-center text-sm text-secondary-foreground">
        {label}
      </p>
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

