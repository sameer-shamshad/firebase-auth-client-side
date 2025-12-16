import { assign, fromPromise, setup } from "xstate";
import { registerWithEmailAndPassword } from "@/services/auth.service";
import { createUserProfileWithRetry } from "@/services/user.service";

const initialContext = {
    email: '',
    password: '',
    confirmPassword: '',
    error: null,
    authResponse: null,
    profileCreationError: null,
}
const registerMachine = setup({
    types: {
        context: {} as {
            email: string;
            password: string;
            confirmPassword: string;
            error: string | null;
            authResponse: { accessToken: string; userId?: string; userEmail?: string } | null;
            profileCreationError: string | null;
        },
        events: {} as
            | { type: 'CHANGE_FIELD'; field: 'email' | 'password' | 'confirmPassword'; value: string }
            | { type: 'SUBMIT' }
            | { type: 'RESET' }
    },
    actors: {
        registerWithEmailAndPassword: fromPromise(async ({ input: { email, password, confirmPassword } }: { input: { email: string; password: string; confirmPassword: string } }) => {
            const response = await registerWithEmailAndPassword(email, password, confirmPassword);
            return response;
        }),
        createUserProfile: fromPromise(async ({ input: { userId, email } }: { input: { userId: string; email: string } }) => {
            const username = email.split('@')[0];
            const profile = await createUserProfileWithRetry(userId, email, username, 3);
            return profile;
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
        clearForm: assign(() => initialContext),
        clearError: assign(({ context }) => ({ ...context, error: null })),
        storeAuth: assign(({ context, event }) => {
            const output = (event as unknown as { output: { accessToken: string; userId?: string; userEmail?: string } }).output;
            return { ...context, authResponse: output, profileCreationError: null };
        }),
        setProfileCreationError: assign(({ context, event }) => {
            const error = (event as unknown as { error: Error | unknown }).error;
            const errorMessage = error instanceof Error ? error.message : 'Failed to create user profile';
            return { ...context, profileCreationError: errorMessage };
        }),
        clearProfileCreationError: assign(({ context }) => ({ ...context, profileCreationError: null })),
    },
}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCcxQJawC5mQWQEMBjAC3QDswA6dCAGzAGIBhACQEEA5AcQFEB9AGIBJXgBkAIgG0ADAF1EoAA4B7WOizoV5RSAAeiAOwBGKgE4zANhlmAzGeOGArE+MAmABwAaEAE9Exg7mTrbG7gAsgWYeth4eAL7xPqgY2LiEpBTUtAyMAMoAqgBCeMIAKrIKSCCq6praugYInrbmhpYuhrbWlpbuPv4IoYZU3SaGHsYyk+HRiclomDj4xGSUNPRMhSXlUsZVymoaWjrVTZHmFlfXVx6WA4hmTqOGs5OGMl22bsYJSSApJbpVZZKiwACuACMALYaTTkKCMCDabLkABuKgA1tRAWkVpl1hCYXCKFAEBQMUQCPVyJVKrpascGmcjJ8qD8bKEfj8+sYHkMZM9wk5BcZehZDB8zPMAYs8Rk1tQibCsPDEbhkCpkFQlHRqQAzLXQqi45YK0HKkkI8nolRUml0+QMo40xqIWxdKjWOxmNwTGScty2fluINUCZmQUeQVPJzRwwy03AglK8FEIhwWCMPTYanUAj65YACimAYAlIwk-jFWC0xnYLB6dVGa6WQhDGHLN9DL7bMK43Z+ZMqLNbjJbE43JZQ25Ev9yCoIHBdFXzZRnXUTm6EABaSxUAOHo9H4zhfl7g-Hq8BhP-Vcg9Y5MAbpmnUBNSzhKgeNzjmdOaxxz5PxEDcOwqBCCJQm+LsXCcRM5TNB9U2JVVSRfVt30QScPAgz4f2FSxJnce4QIFVpoiedoRU8cIENSJCU1rdNMwwrc2zuNxzGFMDPksHtojPMjvlMSNpw8J5bFsGQ-XCSw53iIA */
    id: 'registerMachine',
    initial: 'idle',
    context: initialContext,
    states: {
        idle: {
            on: {
                CHANGE_FIELD: { actions: 'changeField' },
                SUBMIT: {
                    target: 'submitting',
                    actions: 'clearError',
                },
            },
        },
        submitting: {
            invoke: {
                src: 'registerWithEmailAndPassword',
                input: ({ context }) => ({
                    email: context.email,
                    password: context.password,
                    confirmPassword: context.confirmPassword,
                }),
                onDone: {
                    target: 'creatingProfile',
                    actions: 'storeAuth',
                },
                onError: {
                    target: 'idle',
                    actions: 'setError',
                },
            },
        },
        creatingProfile: {
            entry: 'clearProfileCreationError',
            invoke: {
                src: 'createUserProfile',
                input: ({ context }) => {
                    if (!context.authResponse?.userId || !context.authResponse?.userEmail) {
                        throw new Error('User information not available for profile creation');
                    }

                    return {
                        userId: context.authResponse.userId,
                        email: context.authResponse.userEmail,
                    };
                },
                onDone: { target: 'success' },
                onError: { target: 'idle', actions: 'setProfileCreationError' },
            },
        },
        success: {
            after: {
                1000: { target: 'idle', actions: 'clearForm' },
            },
        },
    },
});

export default registerMachine;