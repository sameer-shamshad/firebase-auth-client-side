import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import { 
  sendEmailVerification,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
} from "firebase/auth";

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export const register = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await sendEmailVerification(user, {
      handleCodeInApp: true,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in?email=${email}`,
    });

    return userCredential;
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      throw new Error(error.message);
    }
    throw error;
  }
}