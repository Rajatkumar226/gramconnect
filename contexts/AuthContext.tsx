"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AuthUser = { uid: string; name: string; email?: string; photoURL?: string };
type ModalState = { message: string; onSuccess?: () => void } | null;

type AuthCtx = {
  user: AuthUser | null;
  modalState: ModalState;
  requireAuth: (message: string, onSuccess?: () => void) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  closeModal: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUser({
            uid: fbUser.uid,
            name: (data.name as string) ?? fbUser.displayName ?? "User",
            email: fbUser.email ?? undefined,
            photoURL: fbUser.photoURL ?? undefined,
          });
        } else {
          const name = fbUser.displayName ?? "User";
          await setDoc(doc(db, "users", fbUser.uid), { name, email: fbUser.email ?? "" }, { merge: true });
          setUser({ uid: fbUser.uid, name, email: fbUser.email ?? undefined, photoURL: fbUser.photoURL ?? undefined });
        }
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    setModalState((prev) => { prev?.onSuccess?.(); return null; });
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const requireAuth = useCallback((message: string, onSuccess?: () => void) => {
    setModalState({ message, onSuccess });
  }, []);

  const closeModal = useCallback(() => setModalState(null), []);

  return (
    <AuthContext.Provider value={{ user, modalState, requireAuth, loginWithGoogle, logout, closeModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
