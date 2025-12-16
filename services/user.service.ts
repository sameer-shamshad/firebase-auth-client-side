import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "@/types";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Create or update user profile in Firestore 'users' collection
 * This is called after successful authentication (email/password or SSO)
 */
export const createOrUpdateUserProfile = async (userId: string, email: string, username?: string): Promise<User> => {
  try {
    // Extract username from email if not provided (for SSO users)
    const finalUsername = username || email.split('@')[0];

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    const profileData: Omit<User, 'id'> = {
      email: email,
      username: finalUsername,
      createdAt: userSnap.exists() 
        ? userSnap.data().createdAt 
        : serverTimestamp(),
    };

    // Use setDoc with merge to create or update
    await setDoc(userRef, profileData, { merge: true });

    // Fetch the created/updated document
    const updatedSnap = await getDoc(userRef);
    if (!updatedSnap.exists()) {
      throw new Error('Failed to create user profile');
    }

    const data = updatedSnap.data();
    return {
      id: userId,
      email: data.email,
      username: data.username,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(
      `Failed to create user profile: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create user profile with retry logic (2-3 attempts)
 * Useful for handling network errors during registration
 */
export const createUserProfileWithRetry = async (userId: string, email: string, username?: string, maxRetries: number = 3): Promise<User> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await createOrUpdateUserProfile(userId, email, username);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff: 500ms, 1000ms, 2000ms)
      const delay = Math.min(500 * Math.pow(2, attempt - 1), 2000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Failed to create user profile after retries');
}

/**
 * Fetch user profile from Firestore 'users' collection
 * Returns null if user is not authenticated or profile doesn't exist
 */
export const fetchUserProfile = async (): Promise<User | null> => {
  try {
    // Wait for auth state to be ready
    return new Promise<User | null>((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe(); // Unsubscribe immediately after first callback

        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // Profile doesn't exist, return null
            resolve(null);
            return;
          }

          const data = userSnap.data();
          resolve({
            id: firebaseUser.uid,
            email: data.email || firebaseUser.email || '',
            username: data.username || firebaseUser.email?.split('@')[0] || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          });
        } catch (error) {
          reject(new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
