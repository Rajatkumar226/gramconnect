"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, AlertTriangle, Info, Check } from "lucide-react";

const main = [
  { n: "108",  l: "Ambulance",       hi: "एम्बुलेंस",       d: "Free 24×7 ambulance — HP",      icon: "🚑", from: "#7f1d1d", to: "#dc2626" },
  { n: "112",  l: "Emergency",       hi: "आपातकाल",         d: "Police + Fire + Ambulance",       icon: "🆘", from: "#881337", to: "#e11d48" },
  { n: "100",  l: "Police",          hi: "पुलिस",           d: "HP Police helpline",              icon: "👮", from: "#1e3a5f", to: "#2563eb" },
  { n: "101",  l: "Fire Brigade",    hi: "अग्निशमन",         d: "Fire emergency",                  icon: "🚒", from: "#7c2d12", to: "#ea580c" },
  { n: "1070", l: "Disaster Relief", hi: "आपदा राहत",       d: "SDMA — floods, landslides, HP",   icon: "⛰️", from: "#14532d", to: "#16a34a" },
  { n: "1091", l: "Women Helpline",  hi: "महिला हेल्पलाइन", d: "Women safety & support",          icon: "👩", from: "#581c87", to: "#9333ea" },
];

const others = [
  { n: "102",          l: "Maternity Ambulance",   d: "Free for pregnant women" },
  { n: "1098",         l: "Childline",             d: "Child abuse / missing children" },
  { n: "14567",        l: "Elder Helpline",         d: "Senior citizens support" },
  { n: "155261",       l: "PM-KISAN Helpline",      d: "Farmers — scheme queries" },
  { n: "1800-180-1551",l: "HP Kisan Call Centre",  d: "Agricultural queries (toll-free)" },
  { n: "1800-233-3555",l: "HP Consumer Helpline",   d: "Consumer grievances" },
];

export default function EmergencyPage() {
  const [called, setCalled] = useState<string | null>(null);

  const handleCall = (n: string) => {
    setCalled(n);
    setTimeout(() => setCalled(null), 2000);
  };

  return (
    <div style={{ backgroundColor: "#060808", minHeight: "100vh" }}>
      {/* Header */}
      <div className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1a0000 0%, #7f1d1d 50%, #991b1b 100%)" }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.25), transparent 60%)" }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 glass-dark">
            <AlertTriangle size={12} className="animate-pulse" style={{ color: "#fca5a5" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#fca5a5" }}>Emergency Contacts</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold text-white mb-2 font-display">
            आपातकालीन <span style={{ background: "linear-gradient(90deg, #fca5a5, #f87171)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>नंबर</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-base max-w-sm mx-auto" style={{ color: "rgba(255,200,200,0.6)" }}>
            Tap any number to call instantly. Save these in your phone.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8 sm:pb-20">
        {/* Main 6 numbers */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-xs uppercase tracking-widest mt-4 mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
          Tap to Call Instantly
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
          {main.map((c, i) => (
            <motion.a key={c.n} href={`tel:${c.n}`}
              onClick={() => handleCall(c.n)}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: "easeOut" }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="relative emergency-card block rounded-2xl p-4 sm:p-5 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
            >
              {/* Shine orb */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent)", transform: "translate(30%,-30%)" }} />

              {called === c.n ? (
                <div className="flex flex-col items-center justify-center h-full py-3 gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <Check size={18} color="white" />
                  </div>
                  <p className="text-white text-sm font-semibold">Calling…</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl sm:text-3xl">{c.icon}</span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                      <Phone size={9} color="white" />
                      <span className="text-white text-[9px] font-medium">Call</span>
                    </div>
                  </div>
                  <p className="text-white font-black text-3xl sm:text-4xl leading-none mb-1">{c.n}</p>
                  <p className="text-white font-bold text-sm">{c.l}</p>
                  <p className="text-xs font-hindi mb-1" style={{ color: "rgba(255,230,230,0.65)" }}>{c.hi}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{c.d}</p>
                </>
              )}
            </motion.a>
          ))}
        </div>

        {/* Divider */}
        <div className="divider-gold mb-8" />

        {/* Other helplines */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(201,146,42,0.15)" }}>
            <Info size={14} style={{ color: "#E8B84B" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Other Helplines</h2>
            <p className="text-xs font-hindi" style={{ color: "rgba(255,255,255,0.35)" }}>अन्य सहायता नंबर</p>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-2.5">
          {others.map((c, i) => (
            <motion.a key={c.n} href={`tel:${c.n}`}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-14 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(232,184,75,0.12)", border: "1px solid rgba(232,184,75,0.2)" }}>
                <span className="font-black text-[11px] leading-tight text-center" style={{ color: "#E8B84B" }}>{c.n}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{c.l}</p>
                <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{c.d}</p>
              </div>
              <Phone size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
            </motion.a>
          ))}
        </div>

        {/* Safety tip */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-8 p-4 sm:p-5 rounded-2xl"
          style={{ background: "rgba(201,146,42,0.08)", border: "1px solid rgba(201,146,42,0.15)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#E8B84B" }}>💡 Safety Tip</p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Save <strong className="text-white">112</strong> as your primary emergency number — it connects to police, fire & ambulance together.
            For Kangra floods/landslides, call <strong className="text-white">1070</strong> (SDMA HP) immediately.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
