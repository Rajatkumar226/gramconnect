"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { Phone, MapPin, Clock, Stethoscope, Heart, Pill } from "lucide-react";
import healthData from "@/data/health.json";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { T } from "@/data/translations";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.55, ease: "easeOut" as const, delay } as Transition,
});

const typeStyle: Record<string, React.CSSProperties> = {
  "Government Hospital":      { backgroundColor: "rgba(59,130,246,0.12)",  color: "#3b82f6" },
  PHC:                        { backgroundColor: "rgba(34,197,94,0.12)",   color: "#16a34a" },
  "Zonal Hospital":           { backgroundColor: "rgba(168,85,247,0.12)", color: "#a855f7" },
  "Medical College Hospital": { backgroundColor: "rgba(239,68,68,0.12)",   color: "#dc2626" },
};

export default function HealthPage() {
  const { user, requireAuth } = useAuth();
  const { lang } = useLang();
  const tx = T[lang].health;

  const handleCall = (phone: string) => {
    if (!user) { requireAuth(lang === "en" ? "Login to view and call health contacts" : "स्वास्थ्य सम्पर्क देखने के लिए लॉगिन करें"); return; }
    window.location.href = `tel:${phone}`;
  };

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="relative pt-28 pb-10 sm:pt-36 sm:pb-14 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #1e3a5f 50%, #2d5986 100%)" }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgba(122,179,224,0.2), transparent 55%)" }}
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 glass-dark">
            <Heart size={12} style={{ color: "#7ab3e0" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#7ab3e0" }}>{tx.badge}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold text-white mb-2 font-display">
            {tx.title} <span style={{ background: "linear-gradient(90deg, #7ab3e0, #bde0f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{tx.titleBlue}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-sm mb-3 font-hindi" style={{ color: "rgba(255,255,255,0.45)" }}>{tx.sub}</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            {tx.desc}
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8 sm:pb-20 space-y-10 sm:space-y-14">
        {/* Ambulance strip */}
        <motion.div {...fadeUp()} className="mt-8">
          <div className="rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #7f1d1d, #b91c1c)" }}>
            <p className="text-center text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,200,200,0.7)" }}>
              {tx.ambTitle}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {healthData.ambulance.map((a) => (
                <motion.button key={a.number} onClick={() => handleCall(a.number)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                  <span className="text-2xl">🚑</span>
                  <div className="text-left">
                    <p className="text-white font-black text-2xl leading-none">{a.number}</p>
                    <p className="text-xs" style={{ color: "rgba(255,180,180,0.8)" }}>{a.name}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Hospitals */}
        <div>
          <motion.div {...fadeUp()} className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5986)" }}>
              <Stethoscope size={16} color="white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display" style={{ color: "var(--text)" }}>{tx.hospitals}</h2>
              <p className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>{tx.hospitalsHi}</p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {healthData.hospitals.map((h, i) => (
              <motion.div key={h.id} {...fadeUp(i * 0.07)} className="card p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--text)" }}>{h.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                    style={typeStyle[h.type] || { backgroundColor: "rgba(100,100,100,0.1)", color: "var(--text-3)" }}>
                    {h.type}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm" style={{ color: "var(--text-2)" }}>
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="mt-0.5 shrink-0" style={{ color: "var(--green-lt)" }} />
                    <span>{h.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="shrink-0" style={{ color: "var(--green-lt)" }} />
                    <span>{h.timing}</span>
                  </div>
                  {h.distance && (
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>{h.distance}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {h.services.slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(27,67,50,0.08)", color: "var(--green)" }}>{s}</span>
                  ))}
                  {h.services.length > 4 && (
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "var(--bg-alt, var(--bg))", color: "var(--text-3)" }}>+{h.services.length - 4}</span>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleCall(h.phone)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white green-gradient flex-1 justify-center">
                    <Phone size={12} /> {user ? tx.opd : tx.loginToCall}
                  </motion.button>
                  {h.emergency && (
                    <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleCall(h.emergency!)}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white flex-1 justify-center"
                      style={{ backgroundColor: "#dc2626" }}>
                      <Phone size={12} /> {tx.emergency}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ASHA Workers */}
        <div>
          <motion.div {...fadeUp()} className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#db2777" }}>
              <Heart size={16} color="white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display" style={{ color: "var(--text)" }}>{tx.asha}</h2>
              <p className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>{tx.ashaHi}</p>
            </div>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-4">
            {healthData.ashaWorkers.map((a, i) => (
              <motion.div key={a.id} {...fadeUp(i * 0.07)} className="card p-4 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: "rgba(219,39,119,0.1)" }}>👩‍⚕️</div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>{a.name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{a.village}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {a.services.slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(219,39,119,0.1)", color: "#db2777" }}>{s}</span>
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleCall(a.phone)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #9d174d, #db2777)" }}>
                  <Phone size={13} /> {user ? tx.callAsha : tx.loginToCall}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Jan Aushadhi */}
        <div>
          <motion.div {...fadeUp()} className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#7c3aed" }}>
              <Pill size={16} color="white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display" style={{ color: "var(--text)" }}>{tx.jan}</h2>
              <p className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>{tx.janHi}</p>
            </div>
          </motion.div>
          {healthData.janAushadhi.map((j, i) => (
            <motion.div key={j.id} {...fadeUp(i * 0.07)} className="card p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: "rgba(124,58,237,0.1)" }}>💊</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base mb-2" style={{ color: "var(--text)" }}>{j.name}</h3>
                  <div className="space-y-1.5 text-xs sm:text-sm mb-3" style={{ color: "var(--text-2)" }}>
                    <div className="flex items-center gap-2"><MapPin size={12} style={{ color: "#7c3aed" }} /><span>{j.address}</span></div>
                    <div className="flex items-center gap-2"><Clock size={12} style={{ color: "#7c3aed" }} /><span>{j.timing}</span></div>
                  </div>
                  <p className="text-sm px-3 py-2 rounded-xl font-medium" style={{ backgroundColor: "rgba(124,58,237,0.08)", color: "#7c3aed" }}>💡 {j.note}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
