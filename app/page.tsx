"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import {
  FileText, Stethoscope, Phone, Store, Users,
  ArrowRight, Bell, AlertTriangle, CloudRain,
  CheckCircle2, Megaphone, Shield, ChevronDown,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { T } from "@/data/translations";
import { useData } from "@/contexts/DataContext";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: "easeOut" as const, delay } as Transition,
});

const quickLinkDefs = [
  { icon: FileText,    href: "/yojnaen",   from: "#1B4332", to: "#2D6A4F", iconCol: "#74C69D" },
  { icon: Stethoscope, href: "/health",    from: "#1e3a5f", to: "#2d5986", iconCol: "#7ab3e0" },
  { icon: Phone,       href: "/emergency", from: "#7f1d1d", to: "#b91c1c", iconCol: "#fca5a5" },
  { icon: Store,       href: "/directory", from: "#78350f", to: "#b45309", iconCol: "#fde68a" },
  { icon: Users,       href: "/panchayat", from: "#312e81", to: "#4f46e5", iconCol: "#a5b4fc" },
];

export default function HomePage() {
  const { lang } = useLang();
  const tx = T[lang].home;
  const { notices: liveNotices, villageStats } = useData();

  const notices = liveNotices.length > 0 ? liveNotices : tx.notices;
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTicker((p) => (p + 1) % notices.length), 5000);
    return () => clearInterval(t);
  }, [notices.length]);

  const stats = [
    { v: villageStats.villagers, l: tx.statsV,  hi: tx.statsVHi },
    { v: villageStats.businesses, l: tx.statsB, hi: tx.statsBHi },
    { v: villageStats.schemes,    l: tx.statsS, hi: tx.statsSHi },
    { v: villageStats.emergency,  l: tx.statsE, hi: tx.statsEHi },
  ];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
        {[
          { w: 420, h: 420, top: "10%", left: "5%",  col: "#C9922A" },
          { w: 320, h: 320, top: "60%", right: "5%", col: "#2D6A4F" },
          { w: 200, h: 200, top: "35%", left: "55%", col: "#C9922A" },
        ].map((o, i) => (
          <motion.div key={i} className="absolute rounded-full pointer-events-none"
            style={{ width: o.w, height: o.h, top: o.top, left: o.left, right: (o as { right?: string }).right,
              background: `radial-gradient(circle, ${o.col}22, transparent 70%)` }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 5 + i * 1.5, repeat: Infinity, ease: "easeInOut" }} />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-28 pb-20">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 glass-dark">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#74C69D" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#74C69D" }}>
              {tx.badge}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-tight mb-3 font-display">
            Gram<span className="gold-shimmer">Connect</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm tracking-widest mb-4 font-hindi" style={{ color: "rgba(255,255,255,0.45)" }}>
            {tx.heroSub}
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: "rgba(255,255,255,0.62)" }}>
            {tx.heroDesc}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/yojnaen"
              className="flex items-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl pulse w-full sm:w-auto justify-center"
              style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
              <FileText size={17} /> {tx.ctaSchemes} <ArrowRight size={16} />
            </Link>
            <Link href="/emergency"
              className="flex items-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-base text-white glass-dark transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center">
              <Phone size={17} /> {tx.ctaEmergency}
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="mt-16 flex flex-col items-center gap-1.5 bounce-down" style={{ color: "rgba(255,255,255,0.25)" }}>
            <span className="text-xs tracking-widest uppercase">{tx.scroll}</span>
            <ChevronDown size={16} />
          </motion.div>
        </div>
      </section>

      {/* ── WEATHER ALERT ── */}
      <div style={{ backgroundColor: "#7f1d1d" }}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            <AlertTriangle size={13} className="animate-pulse" style={{ color: "#fca5a5" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#fca5a5" }}>Alert</span>
          </div>
          <div className="w-px h-3.5" style={{ backgroundColor: "#7f2020" }} />
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <CloudRain size={13} className="shrink-0" style={{ color: "#fca5a5" }} />
            <p className="text-xs truncate" style={{ color: "rgba(255,200,200,0.85)" }}>{tx.alert}</p>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="py-12 sm:py-16" style={{ backgroundColor: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.v} {...fadeUp(i * 0.08)} className="card text-center p-5 sm:p-7">
                <p className="text-3xl sm:text-4xl font-bold mb-1 font-display" style={{ color: "var(--green-mid)" }}>{s.v}</p>
                <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{s.l}</p>
                <p className="text-xs mt-0.5 font-hindi" style={{ color: "var(--text-3)" }}>{s.hi}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTICE BOARD ── */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "var(--bg-alt)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp()} className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center green-gradient">
              <Megaphone size={18} color="white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display" style={{ color: "var(--text)" }}>{tx.noticeBoard}</h2>
              <p className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>{tx.noticeBoardHi}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Bell size={13} style={{ color: "var(--gold)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--gold)" }}>{notices.length} {tx.active}</span>
            </div>
          </motion.div>

          <div className="flex flex-col gap-3">
            {notices.map((n, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)}
                className="card p-4 sm:p-5" whileHover={{ scale: 1.005 }}
                style={{
                  borderLeft: `4px solid ${n.urgent ? "#ef4444" : "var(--green-mid)"}`,
                  outline: ticker === i ? `2px solid rgba(201,146,42,0.3)` : "none",
                }}>
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: n.urgent ? "rgba(239,68,68,0.1)" : "rgba(27,67,50,0.08)" }}>
                    {n.urgent
                      ? <AlertTriangle size={15} color="#ef4444" />
                      : <CheckCircle2 size={15} style={{ color: "var(--green-mid)" }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--text)" }}>{n.title}</h3>
                      {n.urgent && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">URGENT</span>}
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{n.body}</p>
                    <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>{n.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS ── */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>{tx.quickAccess}</p>
            <h2 className="text-2xl sm:text-4xl font-bold font-display" style={{ color: "var(--text)" }}>
              {tx.quickTitle}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
            {quickLinkDefs.map((l, i) => (
              <motion.div key={l.href} {...fadeUp(i * 0.08)}>
                <Link href={l.href} className="group block h-full">
                  <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="rounded-2xl p-5 sm:p-7 h-full flex flex-col gap-3"
                    style={{ background: `linear-gradient(135deg, ${l.from}, ${l.to})` }}>
                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                      <l.icon size={22} color={l.iconCol} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-base sm:text-lg leading-tight">{tx.quickLinks[i].label}</p>
                      <p className="text-white/45 text-xs mt-0.5 font-hindi">{tx.quickLinks[i].hi}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-1 text-white/40 text-xs group-hover:text-white/70 transition-colors">
                      {lang === "en" ? "Explore" : "देखें"} <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTER CTA ── */}
      <section className="py-14 sm:py-20 green-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 25% 50%, rgba(201,146,42,0.18) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(116,198,157,0.12) 0%, transparent 40%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp()}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center gold-gradient shadow-xl">
              <Shield size={26} color="#1B4332" />
            </motion.div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 font-display">{tx.verifiedTitle}</h2>
            <p className="max-w-xl mx-auto mb-8 leading-relaxed text-base" style={{ color: "rgba(255,255,255,0.58)" }}>
              {tx.verifiedDesc}
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
              {tx.verifiedCTA} <ArrowRight size={17} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
