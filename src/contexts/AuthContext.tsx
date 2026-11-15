import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile } from '../types';
import { dataService } from '../services/dataService';

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  emailVerified: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An OpsDesk account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose at least 6 characters with letters and numbers.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a minute before trying again.';
    case 'auth/user-disabled':
      return 'This account has been disabled by an administrator.';
    case 'auth/network-request-failed':
      return 'Network error while contacting authentication servers. Please check your connection.';
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'Email/Password sign-in is not yet enabled in Firebase Console Authentication settings.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    default: {
      const msg = err instanceof Error ? err.message : String(err);
      return msg || 'Authentication failed. Please try again.';
    }
  }
}

function normalizeTimestamp(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') {
    return val;
  }
  return new Date().toISOString();
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadOrCreateUserProfile = useCallback(async (firebaseUser: User, explicitName?: string): Promise<UserProfile> => {
    const fallbackProfile: UserProfile = {
      uid: firebaseUser.uid,
      name: explicitName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'TBO Operator',
      email: firebaseUser.email || '',
      role: 'agent',
      department: 'Travel Operations',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        return {
          uid: data.uid || firebaseUser.uid,
          name: data.name || fallbackProfile.name,
          email: data.email || fallbackProfile.email,
          role: data.role === 'admin' || data.role === 'lead' ? data.role : 'agent',
          department: data.department || 'Travel Operations',
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt),
        };
      }

      // Create standard non-admin user profile in Firestore
      const profilePayload = {
        uid: firebaseUser.uid,
        name: fallbackProfile.name.slice(0, 100),
        email: (firebaseUser.email || '').slice(0, 200),
        role: 'agent', // Strictly default non-admin privilege
        department: 'Travel Operations',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, profilePayload);
      return fallbackProfile;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
      return fallbackProfile;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setEmailVerified(firebaseUser.emailVerified);
        const profile = await loadOrCreateUserProfile(firebaseUser);
        setUserProfile(profile);
        if (firebaseUser.emailVerified) {
          // Only sync operational Firestore collections once email is verified
          dataService.initAuthenticatedSync().catch(() => {});
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [loadOrCreateUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setEmailVerified(credential.user.emailVerified);
      const profile = await loadOrCreateUserProfile(credential.user);
      setUserProfile(profile);
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(credential.user, { displayName: cleanName });

      // Send Firebase email verification immediately after registration
      await sendEmailVerification(credential.user);
      setEmailVerified(credential.user.emailVerified);

      // Create user profile document in Firestore with standard 'agent' role
      const profile = await loadOrCreateUserProfile(credential.user, cleanName);
      setUserProfile(profile);
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No active user session found. Please sign in again.');
    }
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const refreshVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      const verified = Boolean(auth.currentUser.emailVerified);
      if (verified) {
        // Force ID token refresh so Firestore security rules see email_verified: true
        await auth.currentUser.getIdToken(true);
        dataService.initAuthenticatedSync().catch(() => {});
      }
      setEmailVerified(verified);
      setUser(auth.currentUser);
      return verified;
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setEmailVerified(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        emailVerified,
        loading,
        signIn,
        signUp,
        resetPassword,
        resendVerificationEmail,
        refreshVerificationStatus,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
