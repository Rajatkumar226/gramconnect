"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { Phone, MapPin, Mail, Clock, Users, Shield, Star, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { T } from "@/data/translations";
import { useData } from "@/contexts/DataContext";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.55, ease: "easeOut" as const, delay } as Transition,
});

const designationEmoji: Record<string, string> = {
  "Gram Pradhan":  "🏛️",
  "Up-Pradhan":    "⭐",
  "Gram Sachiv":   "📋",
  "Gram Sewak":    "🌾",
  "Ward Panch":    "🏘️",
};

const designationColor: Record<string, { bg: string; text: string; border: string }> = {
  "Gram Pradhan": { bg: "rgba(201,146,42,0.12)", text: "#C9922A", border: "rgba(201,146,42,0.3)" },
  "Up-Pradhan":   { bg: "rgba(27,67,50,0.10)",   text: "#2D6A4F", border: "rgba(27,67,50,0.2)"  },
  "Gram Sachiv":  { bg: "rgba(59,130,246,0.10)",  text: "#3b82f6", border: "rgba(59,130,246,0.2)" },
  "Gram Sewak":   { bg: "rgba(34,197,94,0.10)",   text: "#16a34a", border: "rgba(34,197,94,0.2)" },
  "Ward Panch":   { bg: "rgba(124,58,237,0.10)",  text: "#7c3aed", border: "rgba(124,58,237,0.2)" },
};

export default function PanchayatPage() {
  const { user, requireAuth } = useAuth();
  const { lang } = useLang();
  const tx = T[lang].panchayat;
  const { members, panchayatInfo } = useData();

  const handleCall = (phone: string, name: string) => {
    if (!user) {
      requireAuth(lang === "en" ? `Login to call ${name}` : `${name} को कॉल करने के लिए लॉगिन करें`);
      return;
    }
    if (phone) window.location.href = `tel:${phone}`;
  };

  const hasName = (m?: { name: string }) => !!m?.name?.trim();

  const pradhan    = members.find((m) => m.designation === "Gram Pradhan");
  const upPradhan  = members.find((m) => m.designation === "Up-Pradhan");
  const sachiv     = members.find((m) => m.designation === "Gram Sachiv");
  const sewak      = members.find((m) => m.designation === "Gram Sewak");
  const wardPanchs = members.filter((m) => m.designation === "Ward Panch");

  const pendingBanner = !hasName(pradhan) && (
    <motion.div {...fadeUp()} className="mt-8 flex items-start gap-3 p-4 rounded-2xl"
      style={{ backgroundColor: "rgba(201,146,42,0.08)", border: "1px solid rgba(201,146,42,0.2)" }}>
      <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: "#C9922A" }} />
      <div>
        <p className="text-sm font-semibold" style={{ color: "#C9922A" }}>
          {lang === "en" ? "Details Being Updated" : "विवरण अपडेट हो रहा है"}
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-3)" }}>
          {lang === "en"
            ? "Panchayat member details are being verified and will appear here shortly. For immediate assistance, contact the Panchayat office in Dehrian or call Civil Hospital Jawalamukhi: 01970-222001."
            : "पंचायत सदस्यों का विवरण जल्द ही यहाँ दिखाई देगा। तत्काल सहायता के लिए डेहरियाँ पंचायत कार्यालय से संपर्क करें।"}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      {/* ── Hero Header ── */}
      <div className="relative pt-28 pb-10 sm:pt-36 sm:pb-16 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1a0533 0%, #2d0a5e 40%, #3d1278 70%, #4c1d95 100%)" }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 65% 50%, rgba(167,139,250,0.25), transparent 55%)" }}
          animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 9, repeat: Infinity }} />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
        <div className="absolute -bottom-10 -left-16 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9922A, transparent)" }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 glass-dark">
            <Shield size={12} style={{ color: "#a78bfa" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#a78bfa" }}>{tx.badge}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold text-white mb-2 font-display">
            {tx.title}{" "}
            <span style={{ background: "linear-gradient(90deg, #a78bfa, #ddd6fe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {tx.titleGold}
            </span>
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

        {pendingBanner}

        {/* ── Gram Pradhan — Hero Card ── */}
        {pradhan && hasName(pradhan) && (
          <motion.div {...fadeUp()} className="mt-8">
            <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8"
              style={{ background: "linear-gradient(135deg, #78350f, #b45309, #C9922A)", border: "1px solid rgba(232,184,75,0.3)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12), transparent 50%)" }} />
              <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <motion.div
                  animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-5xl shadow-xl shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}>
                  🏛️
                </motion.div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-xs font-bold tracking-wider uppercase"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
                    <Star size={10} fill="currentColor" /> {lang === "en" ? "Gram Pradhan" : "ग्राम प्रधान"}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mb-1">{pradhan.name}</h2>
                  {pradhan.nameHi && (
                    <p className="text-base font-hindi mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>{pradhan.nameHi}</p>
                  )}
                  {pradhan.ward && (
                    <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>{pradhan.ward}</p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleCall(pradhan.phone, pradhan.name)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
                    style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#78350f" }}>
                    <Phone size={14} />
                    {user && pradhan.phone ? pradhan.phone : tx.loginToCall}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Staff Section: Up-Pradhan, Sachiv, Sewak ── */}
        {[upPradhan, sachiv, sewak].some((m) => m && hasName(m)) && (
          <div>
            <motion.div {...fadeUp()} className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1B4332, #2D6A4F)" }}>
                <Users size={16} color="white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-display" style={{ color: "var(--text)" }}>{tx.staffTitle}</h2>
                <p className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>{tx.staffHi}</p>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[upPradhan, sachiv, sewak].filter((m) => m && hasName(m)).map((m, i) => {
                if (!m) return null;
                const col = designationColor[m.designation] || designationColor["Ward Panch"];
                const emoji = designationEmoji[m.designation] || "👤";
                const designationLabel =
                  m.designation === "Up-Pradhan"  ? (lang === "en" ? "Up-Pradhan"  : "उप-प्रधान")  :
                  m.designation === "Gram Sachiv" ? (lang === "en" ? "Gram Sachiv" : "ग्राम सचिव") :
                  m.designation === "Gram Sewak"  ? (lang === "en" ? "Gram Sewak"  : "ग्राम सेवक") : m.designation;
                return (
                  <motion.div key={m.id} {...fadeUp(i * 0.1)} className="card p-5 flex flex-col items-center text-center gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: col.bg, border: `1px solid ${col.border}` }}>
                      {emoji}
                    </div>
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
                        style={{ backgroundColor: col.bg, color: col.text }}>
                        {designationLabel}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base" style={{ color: "var(--text)" }}>{m.name}</h3>
                      {m.nameHi && <p className="text-xs font-hindi mt-0.5" style={{ color: "var(--text-3)" }}>{m.nameHi}</p>}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleCall(m.phone, m.name)}
                      className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white mt-auto"
                      style={{ background: `linear-gradient(135deg, ${col.text}cc, ${col.text})` }}>
                      <Phone size={13} />
                      {user && m.phone ? m.phone : tx.loginToCall}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Ward Members Grid ── */}
        {wardPanchs.some((m) => hasName(m)) && (
          <div>
            <motion.div {...fadeUp()} className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#7c3aed" }}>
                <Shield size={16} color="white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-display" style={{ color: "var(--text)" }}>{tx.wardMembers}</h2>
                <p className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>{tx.wardMembersHi}</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {wardPanchs.filter((m) => hasName(m)).map((m, i) => (
                <motion.div key={m.id} {...fadeUp(i * 0.06)}
                  className="card p-4 flex flex-col items-center text-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                    🏘️
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
                      {m.ward || tx.wardPanch}
                    </p>
                    <h3 className="font-semibold text-xs sm:text-sm leading-tight" style={{ color: "var(--text)" }}>{m.name}</h3>
                    {m.nameHi && <p className="text-xs font-hindi mt-0.5" style={{ color: "var(--text-3)" }}>{m.nameHi}</p>}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleCall(m.phone, m.name)}
                    className="w-full flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}>
                    <Phone size={11} />
                    {user && m.phone ? m.phone : tx.loginToCall}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Office Info ── */}
        <motion.div {...fadeUp()}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1B4332, #2D6A4F)" }}>
              <MapPin size={16} color="white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display" style={{ color: "var(--text)" }}>{tx.officeTitle}</h2>
              <p className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>{tx.officeHi}</p>
            </div>
          </div>

          <div className="card p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(27,67,50,0.1)" }}>
                <MapPin size={15} style={{ color: "var(--green)" }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>{tx.address}</p>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{panchayatInfo.address}</p>
              </div>
            </div>

            {panchayatInfo.email && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(59,130,246,0.1)" }}>
                  <Mail size={15} style={{ color: "#3b82f6" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>{tx.email}</p>
                  <p className="text-sm font-medium break-all" style={{ color: "var(--text)" }}>{panchayatInfo.email}</p>
                </div>
              </div>
            )}

            {panchayatInfo.phone && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
                  <Phone size={15} style={{ color: "#16a34a" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>{tx.phone}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{panchayatInfo.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(201,146,42,0.1)" }}>
                <Clock size={15} style={{ color: "var(--gold)" }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>{tx.officeHours}</p>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{tx.officeHoursVal}</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
