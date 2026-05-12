"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Leaf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { T } from "@/data/translations";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginModal() {
  const { modalState, loginWithGoogle, closeModal } = useAuth();
  const { lang } = useLang();
  const tx = T[lang].login;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch {
      setError(lang === "en" ? "Google sign-in failed. Please try again." : "Google साइन-इन विफल। पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {modalState && (
        <>
          <motion.div key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            onClick={closeModal} />

          <motion.div key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[61] sm:inset-0 sm:flex sm:items-center sm:justify-center sm:pointer-events-none">
            <div className="w-full sm:max-w-sm sm:pointer-events-auto rounded-t-3xl sm:rounded-2xl p-6 sm:p-8"
              style={{ backgroundColor: "var(--bg)" }}>

              <div className="w-10 h-1 rounded-full mx-auto mb-5 sm:hidden" style={{ backgroundColor: "var(--border)" }} />

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)" }}>
                    <Leaf size={17} color="#1B4332" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-base leading-tight" style={{ color: "var(--text)" }}>GramConnect</p>
                    <p className="text-xs mt-0.5 leading-snug max-w-[200px]" style={{ color: "var(--text-3)" }}>
                      {modalState.message}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--bg-alt, var(--bg))", border: "1px solid var(--border)" }}>
                  <X size={14} style={{ color: "var(--text-3)" }} />
                </button>
              </div>

              {/* Title */}
              <div className="mb-5">
                <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{tx.title}</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{tx.sub}</p>
              </div>

              {/* Google button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5"
                style={{
                  backgroundColor: "var(--bg)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text)",
                  opacity: loading ? 0.7 : 1,
                }}>
                {loading
                  ? <><span className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" /> {tx.googleLoading}</>
                  : <><GoogleIcon /> {tx.googleBtn}</>}
              </motion.button>

              {error && <p className="text-xs text-red-500 mt-3 text-center">{error}</p>}

              <p className="text-[11px] text-center mt-4" style={{ color: "var(--text-3)" }}>{tx.terms}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
