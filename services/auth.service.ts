import { auth, googleProvider, facebookProvider, githubProvider } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/utils/firebaseErrors";
import { createOrUpdateUserProfile } from "./user.service";
import { FirebaseError } from "firebase/app";
import { 
  signOut,
  UserCredential,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

// Helper function to create/update user profile (non-blocking)
const ensureUserProfile = async (userCredential: UserCredential): Promise<void> => {
  try {
    const user = userCredential.user;
    if (user.email) {
      // Extract username from displayName, email, or provider data
      const username = user.displayName || 
                      user.email.split('@')[0] || 
                      'user';
      
      await createOrUpdateUserProfile(user.uid, user.email, username);
    }
  } catch {
    // Silently fail - don't block auth flow
    // Profile creation can be retried later
  }
};

// Helper function to format Firebase UserCredential to expected format
const formatAuthResponse = async (userCredential: UserCredential): Promise<{ accessToken: string }> => {
  const user = userCredential.user;
  const idToken = await user.getIdToken();
 
  // Ensure user profile exists in Firestore (non-blocking)
  await ensureUserProfile(userCredential);
  
  return { accessToken: idToken };
};

export const registerWithEmailAndPassword = async (email: string, password: string, confirmPassword: string): Promise<{ accessToken: string; userId: string; userEmail: string }> => {
  // Validate inputs before calling Firebase
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();

  if (!trimmedEmail) {
    throw new Error('Email is required');
  }

  if (!trimmedPassword) {
    throw new Error('Password is required');
  }

  if (trimmedPassword.length <= 6) {
    throw new Error('Password must be at least 7 characters long');
  }

  if (!trimmedConfirmPassword) {
    throw new Error('Please confirm your password');
  }

  if (trimmedPassword !== trimmedConfirmPassword) {
    throw new Error('Passwords do not match');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);

    // Get the current domain dynamically (client-side) or use env variable (server-side)
    const getBaseUrl = (): string => {
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    };

    const continueUrl = `${getBaseUrl()}/login?email=${encodeURIComponent(email)}`;

    await sendEmailVerification(userCredential.user, {
      handleCodeInApp: true,
      url: continueUrl,
    });

    const accessToken = await formatAuthResponse(userCredential);
    
    // Return user info for profile creation in RegisterMachine
    return {
      ...accessToken,
      userId: userCredential.user.uid,
      userEmail: userCredential.user.email || trimmedEmail,
    };
  } catch (error: unknown) {
    const errorCode = error instanceof FirebaseError ? error.code : undefined;
    const errorMessage = error instanceof FirebaseError ? error.message : undefined;
    
    const friendlyMessage = getFirebaseErrorMessage(errorCode);
    if (friendlyMessage) {
      throw new Error(friendlyMessage);
    }

    throw new Error(errorMessage || 'Registration failed');
  }
}

export const loginWithEmailAndPassword = async (email: string, password: string): Promise<{ accessToken: string }> => {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail) {
    throw new Error('Email is required');
  }

  if (trimmedPassword.length <= 6) {
    throw new Error('Password is required and must be at least 7 characters long.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      // Send verification email before signing out
      const getBaseUrl = (): string => {
        if (typeof window !== 'undefined') {
          return window.location.origin;
        }
        return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      };

      const continueUrl = `${getBaseUrl()}/register?email=${encodeURIComponent(trimmedEmail)}`;
      
      try {
        await sendEmailVerification(userCredential.user, {
          handleCodeInApp: true,
          url: continueUrl,
        });
      } catch {
        // Continue even if sending verification email fails
      }
      
      // Sign out the user since email is not verified
      await signOut(auth);
      throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
    }
    
    return await formatAuthResponse(userCredential);
  } catch (error: unknown) {
    // If it's already our custom error, re-throw it
    if (error instanceof Error && error.message.includes('verify your email')) {
      throw error;
    }
    
    const errorCode = error instanceof FirebaseError ? error.code : undefined;
    const errorMessage = error instanceof FirebaseError ? error.message : undefined;
    
    const friendlyMessage = getFirebaseErrorMessage(errorCode);
    if (friendlyMessage) {
      throw new Error(friendlyMessage);
    }

    throw new Error(errorMessage || 'Login failed');
  }
}

export const signInWithGoogle = async (): Promise<{ accessToken: string }> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return await formatAuthResponse(userCredential);
  } catch (error: unknown) {
    const errorCode = error instanceof FirebaseError ? error.code : undefined;
    const errorMessage = error instanceof FirebaseError ? error.message : undefined;

    const friendlyMessage = getFirebaseErrorMessage(errorCode);
    if (friendlyMessage) {
      throw new Error(friendlyMessage);
    }

    throw new Error(errorMessage || 'Google sign-in failed');
  }
}

export const signInWithFacebook = async (): Promise<{ accessToken: string }> => {
  try {
    const userCredential = await signInWithPopup(auth, facebookProvider);
    return await formatAuthResponse(userCredential);
  } catch (error: unknown) {
    const errorCode = error instanceof FirebaseError ? error.code : undefined;
    const errorMessage = error instanceof FirebaseError ? error.message : undefined;

    const friendlyMessage = getFirebaseErrorMessage(errorCode);
    if (friendlyMessage) {
      throw new Error(friendlyMessage);
    }

    throw new Error(errorMessage || 'Facebook sign-in failed');
  }
}

export const signInWithGithub = async (): Promise<{ accessToken: string }> => {
  try {
    const userCredential = await signInWithPopup(auth, githubProvider);
    return await formatAuthResponse(userCredential);
  } catch (error: unknown) {
    const errorCode = error instanceof FirebaseError ? error.code : undefined;
    const errorMessage = error instanceof FirebaseError ? error.message : undefined;

    const friendlyMessage = getFirebaseErrorMessage(errorCode);
    if (friendlyMessage) {
      throw new Error(friendlyMessage);
    }

    throw new Error(errorMessage || 'GitHub sign-in failed');
  }
}

// Refresh the ID token (Firebase handles this automatically, but we can force refresh)
export const refreshAccessToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in');
  }
  // Force refresh the token
  return await user.getIdToken(true);
}

// Check if user session is valid using onAuthStateChanged
// This is the reliable way to check auth state, especially after page refresh
// auth.currentUser can be null immediately after refresh before Firebase loads the session
export const checkSession = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Use onAuthStateChanged to wait for Firebase to restore the session
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Unsubscribe immediately after first callback to avoid memory leaks
      resolve(!!user);
    });
  });
}

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    const errorMessage = error instanceof FirebaseError ? error.message : 'Logout failed';
    throw new Error(errorMessage);
  }
}

/**
 * Resend email verification link
 * For Firebase, we need to sign in the user first, send the verification email, then sign out
 * @param email - Email address to send verification to
 * @param password - Password for the account (required to sign in temporarily)
 * @returns Promise that resolves when the email is sent
 */
export const resendEmailVerification = async (email: string, password: string): Promise<void> => {
  try {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      throw new Error('Email is required');
    }

    if (!trimmedPassword) {
      throw new Error('Password is required');
    }

    // Sign in the user temporarily to send verification email
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    const user = userCredential.user;

    // Check if email is already verified
    if (user.emailVerified) {
      await signOut(auth);
      throw new Error('Your email address is already verified.');
    }

    // Get the current domain dynamically (client-side) or use env variable (server-side)
    const getBaseUrl = (): string => {
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }

      return process.env.NEXT_PUBLIC_APP_URL!;
    };

    const continueUrl = `${getBaseUrl()}/login?email=${encodeURIComponent(trimmedEmail)}`;

    await sendEmailVerification(user, {
      handleCodeInApp: true,
      url: continueUrl,
    });

    // Sign out after sending verification email
    await signOut(auth);
  } catch (error: unknown) {
    // Ensure user is signed out even if there's an error
    try {
      await signOut(auth);
    } catch {
      // Ignore sign out errors
    }

    const errorCode = error instanceof FirebaseError ? error.code : undefined;
    const errorMessage = error instanceof FirebaseError ? error.message : undefined;
    
    // If it's already our custom error, re-throw it
    if (error instanceof Error && (
      error.message.includes('already verified') ||
      error.message.includes('Email is required') ||
      error.message.includes('Password is required')
    )) {
      throw error;
    }
    
    const friendlyMessage = getFirebaseErrorMessage(errorCode);
    if (friendlyMessage) {
      throw new Error(friendlyMessage);
    }

    throw new Error(errorMessage || 'Failed to resend verification email');
  }
}