"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Shield, ArrowRight, ChevronLeft, Leaf, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { T } from "@/data/translations";

export default function LoginModal() {
  const { modalState, login, closeModal } = useAuth();
  const { lang } = useLang();
  const tx = T[lang].login;

  const [phase, setPhase] = useState<"phone" | "otp">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalState) {
      setPhase("phone");
      setName("");
      setPhone("");
      setOtp("");
      setError("");
    }
  }, [modalState]);

  const sendOtp = () => {
    if (!name.trim()) { setError(lang === "en" ? "Please enter your name" : "कृपया अपना नाम दर्ज करें"); return; }
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) { setError(lang === "en" ? "Enter a valid 10-digit mobile number" : "10 अंकों का मोबाइल नंबर दर्ज करें"); return; }
    setLoading(true);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setDemoOtp(code);
    setTimeout(() => { setLoading(false); setPhase("otp"); }, 900);
  };

  const verifyOtp = () => {
    if (otp !== demoOtp) { setError(lang === "en" ? "Incorrect OTP. Please try again." : "गलत OTP। कृपया दोबारा प्रयास करें।"); return; }
    login(phone.replace(/\D/g, ""), name.trim());
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
              style={{ backgroundColor: "var(--bg)", maxHeight: "92vh", overflowY: "auto" }}>

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

              <AnimatePresence mode="wait">
                {phase === "phone" ? (
                  <motion.div key="phone"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }} className="space-y-4">
                    <div>
                      <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{tx.title}</p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{tx.sub}</p>
                    </div>

                    {/* Name field */}
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
                      <input
                        type="text"
                        placeholder={lang === "en" ? "Your full name" : "आपका पूरा नाम"}
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(""); }}
                        className="input"
                        style={{ paddingLeft: "2.5rem" }}
                        autoFocus
                      />
                    </div>

                    {/* Phone field */}
                    <div className="flex gap-2">
                      <div className="px-3 py-3 rounded-xl text-sm font-medium flex items-center gap-1 shrink-0"
                        style={{ backgroundColor: "var(--bg-alt, var(--bg))", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel" inputMode="numeric" maxLength={10}
                        placeholder="XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                        className="input flex-1"
                      />
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <motion.button whileTap={{ scale: 0.97 }} onClick={sendOtp} disabled={loading}
                      className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white"
                      style={{ background: "linear-gradient(135deg, var(--green), var(--green-mid))", opacity: loading ? 0.7 : 1 }}>
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {tx.sending}</>
                        : <><Phone size={14} /> {tx.send} <ArrowRight size={14} /></>}
                    </motion.button>

                    <p className="text-[11px] text-center" style={{ color: "var(--text-3)" }}>{tx.terms}</p>
                  </motion.div>
                ) : (
                  <motion.div key="otp"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }} className="space-y-4">
                    <button onClick={() => { setPhase("phone"); setError(""); }}
                      className="flex items-center gap-1 text-xs mb-1" style={{ color: "var(--text-3)" }}>
                      <ChevronLeft size={13} /> {tx.changeNum}
                    </button>
                    <div>
                      <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{tx.otpTitle}</p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{tx.otpSub} +91 {phone}</p>
                    </div>

                    <div className="rounded-xl px-4 py-3.5 text-center"
                      style={{ backgroundColor: "rgba(201,146,42,0.08)", border: "1px solid rgba(201,146,42,0.2)" }}>
                      <p className="text-xs mb-1" style={{ color: "var(--text-3)" }}>{tx.demo}</p>
                      <p className="text-3xl font-bold tracking-[0.3em]" style={{ color: "var(--gold)" }}>{demoOtp}</p>
                    </div>

                    <input
                      type="tel" inputMode="numeric" maxLength={4}
                      placeholder="— — — —"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                      className="input text-center text-2xl tracking-[0.5em] font-bold"
                      autoFocus
                    />

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <motion.button whileTap={{ scale: 0.97 }} onClick={verifyOtp}
                      className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
                      <Shield size={14} /> {tx.verify}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
