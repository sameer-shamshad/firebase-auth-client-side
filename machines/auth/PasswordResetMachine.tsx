import { assign, fromPromise, setup } from "xstate";
import { sendPasswordResetLinkToEmailAddress } from "@/services/auth.service";

const initialContext = {
  email: '',
  error: null,
};

const passwordResetMachine = setup({
  types: {
    context: {} as {
      email: string;
      error: string | null;
    },
    events: {} as
      | { type: 'CHANGE_FIELD'; field: 'email'; value: string }
      | { type: 'SUBMIT' }
      | { type: 'RESET' },
  },
  actors: {
    sendPasswordResetEmail: fromPromise(async ({ input: { email } }: { input: { email: string } }) => {
      await sendPasswordResetLinkToEmailAddress(email);
      return { success: true };
    }),
  },
  actions: {
    changeField: assign(({ context, event }) => {
      if (event.type !== 'CHANGE_FIELD') return context;
      return {
        ...context,
        [event.field]: event.value,
        error: null, // Clear error when user starts typing
      };
    }),
    setError: assign(({ context, event }) => {
      const error = (event as unknown as { error: Error | unknown }).error;
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return {
        ...context,
        error: errorMessage,
      };
    }),
    clearError: assign(({ context }) => ({ ...context, error: null })),
    clearForm: assign(() => initialContext),
  },
}).createMachine({
  id: 'passwordResetMachine',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {
      on: {
        CHANGE_FIELD: { 
          actions: ['changeField', 'clearError'],
        },
        SUBMIT: {
          target: 'submitting',
          actions: 'clearError',
        },
      },
    },
    submitting: {
      invoke: {
        src: 'sendPasswordResetEmail',
        input: ({ context }) => ({ email: context.email }),
        onDone: {
          target: 'success',
        },
        onError: {
          target: 'idle',
          actions: 'setError',
        },
      },
    },
    success: {
      after: {
        3000: { target: 'idle', actions: 'clearForm' },
      },
    },
  },
});

export default passwordResetMachine;
