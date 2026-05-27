"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { getGalanaFirebaseAuth, isGalanaFirebaseClientConfigured } from "@/lib/galana-firebase-client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Updates Firebase Auth profile display name for the signed-in user. */
  updateDisplayName: (displayName: string) => Promise<void>;
  /** Sends a password reset email to the signed-in account email (email/password providers). */
  sendPasswordResetEmail: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isGalanaFirebaseClientConfigured()) {
      const t = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(t);
    }

    const auth = getGalanaFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isGalanaFirebaseClientConfigured()) {
      throw new Error(
        "Sign-in is not available. Firebase client configuration is missing."
      );
    }
    const auth = getGalanaFirebaseAuth();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!isGalanaFirebaseClientConfigured()) {
      throw new Error(
        "Sign-up is not available. Firebase client configuration is missing."
      );
    }
    const auth = getGalanaFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isGalanaFirebaseClientConfigured()) {
      throw new Error(
        "Google sign-in is not available. Firebase client configuration is missing."
      );
    }
    const auth = getGalanaFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getGalanaFirebaseAuth();
    await firebaseSignOut(auth);
  }, []);

  const updateDisplayName = useCallback(async (displayName: string) => {
    if (!isGalanaFirebaseClientConfigured()) {
      throw new Error("Account features require Firebase configuration.");
    }
    const auth = getGalanaFirebaseAuth();
    const u = auth.currentUser;
    if (!u) throw new Error("Not signed in");
    await updateProfile(u, { displayName: displayName.trim() });
  }, []);

  const sendPasswordResetEmail = useCallback(async () => {
    if (!isGalanaFirebaseClientConfigured()) {
      throw new Error("Account features require Firebase configuration.");
    }
    const auth = getGalanaFirebaseAuth();
    const email = auth.currentUser?.email;
    if (!email) throw new Error("No email associated with this account.");
    await firebaseSendPasswordResetEmail(auth, email);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateDisplayName,
    sendPasswordResetEmail,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}