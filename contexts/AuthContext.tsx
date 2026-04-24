"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AuthUser = { uid: string; phone: string; name: string };
type ModalState = { message: string; onSuccess?: () => void } | null;

type AuthCtx = {
  user: AuthUser | null;
  modalState: ModalState;
  requireAuth: (message: string, onSuccess?: () => void) => void;
  saveProfile: (uid: string, phone: string, name: string) => Promise<void>;
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
        const name = snap.exists() ? (snap.data().name as string) : "User";
        setUser({ uid: fbUser.uid, phone: fbUser.phoneNumber ?? "", name });
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const saveProfile = useCallback(async (uid: string, phone: string, name: string) => {
    await setDoc(doc(db, "users", uid), { phone, name }, { merge: true });
    setUser({ uid, phone, name });
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
    <AuthContext.Provider value={{ user, modalState, requireAuth, saveProfile, logout, closeModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
