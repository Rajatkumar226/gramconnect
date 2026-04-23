"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type User = { phone: string };
type ModalState = { message: string; onSuccess?: () => void } | null;

type AuthCtx = {
  user: User | null;
  modalState: ModalState;
  requireAuth: (message: string, onSuccess?: () => void) => void;
  login: (phone: string) => void;
  logout: () => void;
  closeModal: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gc_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = useCallback((phone: string) => {
    const u = { phone };
    setUser(u);
    localStorage.setItem("gc_user", JSON.stringify(u));
    setModalState((prev) => {
      prev?.onSuccess?.();
      return null;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("gc_user");
  }, []);

  const requireAuth = useCallback((message: string, onSuccess?: () => void) => {
    setModalState({ message, onSuccess });
  }, []);

  const closeModal = useCallback(() => setModalState(null), []);

  return (
    <AuthContext.Provider value={{ user, modalState, requireAuth, login, logout, closeModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
