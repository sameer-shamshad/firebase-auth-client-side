import { assign, fromPromise, setup } from "xstate";
import { loginWithEmailAndPassword, signInWithGoogle, signInWithGithub, signInWithFacebook, resendEmailVerification } from "@/services/auth.service";

const initialContext = {
  email: 'sameershamshad.42@gmail.com',
  password: '12345678',
  showPassword: false,
  error: null,
  authResponse: null,
  isResendingEmail: false,
  resendSuccess: false,
  resendError: null,
};

const loginMachine = setup({
  types: {
    context: {} as {
      email: string;
      password: string;
      showPassword: boolean;
      error: string | null;
      authResponse: { accessToken: string } | null;
      isResendingEmail: boolean;
      resendSuccess: boolean;
      resendError: string | null;
    },
    events: {} as
      | { type: 'CHANGE_FIELD'; field: 'email' | 'password'; value: string }
      | { type: 'TOGGLE_PASSWORD_VISIBILITY' }
      | { type: 'SUBMIT' }
      | { type: 'SIGN_IN_WITH_GOOGLE' }
      | { type: 'SIGN_IN_WITH_GITHUB' }
      | { type: 'SIGN_IN_WITH_FACEBOOK' }
      | { type: 'RESEND_EMAIL' }
      | { type: 'CLEAR_RESEND_SUCCESS' }
      | { type: 'RESET' },
  },
  actors: {
    login: fromPromise(async ({ input: { email, password } }: { input: { email: string; password: string } }) => {
      const response = await loginWithEmailAndPassword(email, password);
      return response;
    }),
    signInWithGoogle: fromPromise(async () => {
      const response = await signInWithGoogle();
      return response;
    }),
    signInWithGithub: fromPromise(async () => {
      const response = await signInWithGithub();
      return response;
    }),
    signInWithFacebook: fromPromise(async () => {
      const response = await signInWithFacebook();
      return response;
    }),
    resendEmailVerification: fromPromise(async ({ input: { email, password } }: { input: { email: string; password: string } }) => {
      await resendEmailVerification(email, password);
      return { success: true };
    }),
  },
  actions: {
    togglePasswordVisibility: assign(({ context }) => ({ ...context, showPassword: !context.showPassword })),
    changeField: assign(({ context, event }) => {
      if (event.type !== 'CHANGE_FIELD') return context;
      
      return { 
        ...context, 
        [event.field]: event.value,
        resendSuccess: false, // Clear resend success when field changes
        resendError: null, // Clear resend error when field changes
      };
    }),
    setError: assign(({ context, event }) => {
      const error = (event as unknown as { error: Error | unknown }).error;
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      return { ...context, error: errorMessage };
    }),
    clearError: assign(({ context }) => ({ ...context, error: null })),
    clearForm: assign(() => initialContext),
    startResending: assign(({ context }) => ({
      ...context,
      isResendingEmail: true,
      resendSuccess: false,
      resendError: null,
    })),
    setResendSuccess: assign(({ context }) => ({
      ...context,
      isResendingEmail: false,
      resendSuccess: true,
      resendError: null,
    })),
    setResendError: assign(({ context, event }) => {
      const error = (event as unknown as { error: Error | unknown }).error;
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      return {
        ...context,
        isResendingEmail: false,
        resendSuccess: false,
        resendError: errorMessage,
      };
    }),
    clearResendSuccess: assign(({ context }) => ({
      ...context,
      resendSuccess: false,
    })),
    storeAuth: assign(({ context, event }) => {
      const output = (event as unknown as { output: { accessToken: string } }).output;
      return { ...context, authResponse: output };
    }),
  },
}).createMachine({
  id: 'loginMachine',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {
      on: {
        TOGGLE_PASSWORD_VISIBILITY: { actions: 'togglePasswordVisibility' },
        CHANGE_FIELD: { 
          actions: ['changeField', 'clearError'],
        },
        SUBMIT: {
          target: 'submitting',
          actions: 'clearError',
        },
        SIGN_IN_WITH_GOOGLE: {
          target: 'signingInWithGoogle',
          actions: 'clearError',
        },
        SIGN_IN_WITH_GITHUB: {
          target: 'signingInWithGithub',
          actions: 'clearError',
        },
        SIGN_IN_WITH_FACEBOOK: {
          target: 'signingInWithFacebook',
          actions: 'clearError',
        },
        RESEND_EMAIL: {
          guard: ({ context }) => context.email.trim().length > 0 && context.password.trim().length > 0,
          target: 'resendingEmail',
          actions: 'startResending',
        },
        CLEAR_RESEND_SUCCESS: { actions: 'clearResendSuccess' },
      },
    },
    signingInWithGoogle: {
      invoke: {
        src: 'signInWithGoogle',
        input: () => ({}),
        onDone: {
          target: 'success',
          actions: 'storeAuth',
        },
        onError: {
          target: 'idle',
          actions: 'setError',
        },
      },
    },
    signingInWithGithub: {
      invoke: {
        src: 'signInWithGithub',
        input: () => ({}),
        onDone: {
          target: 'success',
          actions: 'storeAuth',
        },
        onError: {
          target: 'idle',
          actions: 'setError',
        },
      },
    },
    signingInWithFacebook: {
      invoke: {
        src: 'signInWithFacebook',
        input: () => ({}),
        onDone: {
          target: 'success',
          actions: 'storeAuth',
        },
        onError: {
          target: 'idle',
          actions: 'setError',
        },
      },
    },
    submitting: {
      invoke: {
        src: 'login',
        input: ({ context }) => ({
          email: context.email,
          password: context.password,
        }),
        onDone: {
          target: 'success',
          actions: 'storeAuth',
        },
        onError: {
          target: 'idle',
          actions: 'setError',
        },
      },
    },
    success: {
      on: {
        RESEND_EMAIL: {
          guard: ({ context }) => context.email.trim().length > 0 && context.password.trim().length > 0,
          target: 'resendingEmail',
          actions: 'startResending',
        },
        CLEAR_RESEND_SUCCESS: { actions: 'clearResendSuccess' },
      },
      after: {
        1000: { target: 'idle', actions: 'clearForm' },
      },
    },
    resendingEmail: {
      invoke: {
        src: 'resendEmailVerification',
        input: ({ context }) => ({ 
          email: context.email.trim(),
          password: context.password.trim(),
        }),
        onDone: {
          target: 'idle',
          actions: 'setResendSuccess',
        },
        onError: {
          target: 'idle',
          actions: 'setResendError',
        },
      },
    },
  },
});

export default loginMachine;