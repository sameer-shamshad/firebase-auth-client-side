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

    if (errorCode === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }

    if (errorCode === 'auth/invalid-password') {
      throw new Error('Invalid password');
    }

    if (errorCode === 'auth/email-already-in-use') {
      throw new Error('Email address is already in use');
    }

    if (errorCode === 'auth/weak-password') {
      throw new Error('Password is too weak');
    }

    if (errorCode === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later');
    }

    if (errorCode === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection');
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
    if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/invalid-email' || errorCode === 'auth/wrong-password' || errorCode === 'auth/weak-password') {
      throw new Error('The email address or password is invalid.');
    }

    if (errorCode === 'auth/user-not-found') {
      throw new Error('There is no user record corresponding to these credentials.');
    }

    if (errorCode === 'auth/user-disabled') {
      throw new Error('This account has been disabled');
    }

    if (errorCode === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later');
    }

    if (errorCode === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection');
    }

    if (errorCode === 'auth/operation-not-allowed') {
      throw new Error('This sign-in method is not enabled');
    }

    throw new Error(errorMessage || 'Login failed');
  }
}

export const signInWithGoogle = async (): Promise<{ accessToken: string }> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return await formatAuthResponse(userCredential);
  } catch (error: unknown) {
    const errorMessage = error instanceof FirebaseError ? error.message : 'Google Login failed';
    throw new Error(errorMessage);
  }
}

export const signInWithFacebook = async (): Promise<{ accessToken: string }> => {
  try {
    const userCredential = await signInWithPopup(auth, facebookProvider);
    return await formatAuthResponse(userCredential);
  } catch (error: unknown) {
    const errorMessage = error instanceof FirebaseError ? error.message : 'Facebook Login failed';
    throw new Error(errorMessage);
  }
}

export const signInWithGithub = async (): Promise<{ accessToken: string }> => {
  try {
    const userCredential = await signInWithPopup(auth, githubProvider);
    return await formatAuthResponse(userCredential);
  } catch (error: unknown) {
    const errorMessage = error instanceof FirebaseError ? error.message : 'Github Login failed';
    throw new Error(errorMessage);
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
    // If we're on server-side, resolve immediately as false
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Use onAuthStateChanged to wait for Firebase to restore the session
    // This will fire once Firebase has finished checking auth state (even on refresh)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Unsubscribe immediately after first callback to avoid memory leaks
      unsubscribe();
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