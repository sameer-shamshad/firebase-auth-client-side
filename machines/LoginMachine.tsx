import type { User } from "@/types";
import { assign, fromPromise, setup } from "xstate";
import { login as loginApi } from "@/services/auth.service";

const loginMachine = setup({
  types: {
    context: {} as {
      email: string;
      password: string;
      error: string | null;
      authResponse: { accessToken: string; refreshToken: string; user: User } | null;
    },
    events: {} as
      | { type: 'CHANGE_FIELD'; field: 'email' | 'password' | 'rememberMe'; value: string | boolean }
      | { type: 'SUBMIT' }
      | { type: 'RESET' },
  },
  actors: {
    login: fromPromise(async ({ input: { email, password } }: { input: { email: string; password: string } }) => {
      const response = await loginApi(email, password);

      return response;
    }),
  },
  actions: {
    changeField: assign(({ context, event }) => {
        if (event.type !== 'CHANGE_FIELD') return context;
        
        return { ...context, [event.field]: event.value };
    }),
    setError: assign(({ context, event }) => {
      const error = (event as unknown as { error: Error | unknown }).error;
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      return { ...context, error: errorMessage };
    }),
      clearError: assign(({ context }) => ({ ...context, error: null })),
      clearForm: assign(() => ({
          email: '',
          password: '',
          error: null,
          authResponse: null,
      })),
      setValidationError: assign(({ context }) => {
        const email = context.email.trim();
        const password = context.password.trim();

        if (!email) {
          return { ...context, error: 'Email is required' };
        }
        
        if (!password) {
          return { ...context, error: 'Password is required' };
        }

        return context;
      }),
      storeAuth: assign(({ context, event }) => {
        const output = (event as unknown as { output: { accessToken: string; user: User; refreshToken: string } }).output;
        localStorage.setItem('accessToken', output.accessToken);
        localStorage.setItem('refreshToken', output.refreshToken);

        return { ...context, authResponse: output };
      }),
  },
  guards: {
    isValidForm: ({ context }) => {
      const email = context.email.trim();
      const password = context.password.trim();
      return email.length > 0 && password.length > 0;
    },
  },
}).createMachine({
  id: 'loginMachine',
  initial: 'idle',
  context: {
    email: 'sameershamshad.42@gmail.com',
    password: '12345678',
    error: null,
    authResponse: null,
  },
  states: {
    idle: {
        entry: 'clearError',
        on: {
            CHANGE_FIELD: { actions: 'changeField' },
            SUBMIT: [
              {
                guard: 'isValidForm',
                target: 'submitting',
                actions: 'clearError',
              },
              {
                actions: 'setValidationError',
                target: 'idle',
              },
            ],
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
      after: {
        1000: { target: 'idle', actions: 'clearForm' },
      },
    },
  },
});

export default loginMachine;