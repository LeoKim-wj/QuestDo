import {
  FirebaseError,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirebaseApp } from '../database/firebase';

function getAuthInstance() {
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase is not configured.');
  return getAuth(app);
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function signUp(email: string, password: string): Promise<void> {
  await createUserWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuthInstance());
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(getAuthInstance(), email);
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
  return 'An unexpected error occurred.';
}
