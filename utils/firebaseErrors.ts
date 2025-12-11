/**
 * Helper function to get user-friendly error messages from Firebase error codes
 * @param errorCode - The Firebase error code (e.g., 'auth/invalid-email')
 * @returns A user-friendly error message or null if the error code is not recognized
 */
export const getFirebaseErrorMessage = (errorCode: string | undefined): string | null => {
  if (!errorCode) return null;

  switch (errorCode) {
    // Email/Password errors
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/invalid-password':
      return 'Invalid password';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'The email address or password is invalid.';
    case 'auth/email-already-in-use':
      return 'Email address is already in use';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/user-not-found':
      return 'There is no user record corresponding to these credentials.';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    
    // SSO/Popup errors
    case 'auth/account-exists-with-different-credential':
      return 'An account with this email already exists. Please sign in using your original sign-in method (email/password or another provider).';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Please allow popups for this site and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    
    // General errors
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled';
    
    default:
      return null;
  }
};
