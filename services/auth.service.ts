import { auth, googleProvider, facebookProvider, githubProvider } from "@/lib/firebase";
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
import { getFirebaseErrorMessage } from "@/utils/firebaseErrors";

// Helper function to format Firebase UserCredential to expected format
const formatAuthResponse = async (userCredential: UserCredential): Promise<{ accessToken: string }> => {
  const user = userCredential.user;
  const idToken = await user.getIdToken();
  
  return {
    accessToken: idToken,
  };
};

export const registerWithEmailAndPassword = async (email: string, password: string): Promise<{ accessToken: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

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

    return await formatAuthResponse(userCredential);
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
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) { // Sign out the user since email is not verified
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

    console.log('errorCode', errorCode);
    
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