"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, ChevronDown, FileText, Users, Shield, BadgeCheck } from "lucide-react";
import schemes from "@/data/schemes.json";
import { useLang } from "@/contexts/LanguageContext";
import { T } from "@/data/translations";

const catIconsEn: Record<string, string> = {
  Agriculture: "🌾", Employment: "💼", Health: "❤️", Housing: "🏠",
  Women: "👩", Education: "🎓", "Social Security": "🛡️",
};

const levelBadge: Record<string, { bg: string; text: string }> = {
  Central: { bg: "rgba(59,130,246,0.12)", text: "#3b82f6" },
  "State (HP)": { bg: "rgba(168,85,247,0.12)", text: "#a855f7" },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.55, ease: "easeOut" as const, delay },
});

const enCats = ["All","Agriculture","Employment","Health","Housing","Women","Education","Social Security"];

export default function YojnaenPage() {
  const { lang } = useLang();
  const tx = T[lang].yojnaen;
  const [q, setQ] = useState("");
  const [catIdx, setCatIdx] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  const selectedEnCat = enCats[catIdx];

  const filtered = schemes.filter((s) => {
    const matchCat = selectedEnCat === "All" || s.category === selectedEnCat;
    const str = q.toLowerCase();
    const matchQ = !str || s.name.toLowerCase().includes(str) || s.nameHi.includes(str) ||
      s.eligibility.toLowerCase().includes(str) || s.benefit.toLowerCase().includes(str);
    return matchCat && matchQ;
  });

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="relative pt-28 pb-10 sm:pt-36 sm:pb-14 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #041A0C 0%, #0C2E1A 45%, #163A24 100%)" }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 75% 50%, rgba(201,146,42,0.18), transparent 55%)" }}
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 glass-dark">
            <FileText size={12} style={{ color: "#74C69D" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#74C69D" }}>{tx.badge}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold text-white mb-2 font-display">
            {tx.title} <span className="gold-shimmer">{tx.titleGold}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-sm mb-3 font-hindi" style={{ color: "rgba(255,255,255,0.45)" }}>{tx.sub}</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            {schemes.length}{tx.desc}
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 sm:pb-20">
        {/* Source / trust banner */}
        <motion.div {...fadeUp()} className="mt-8 mb-4 flex flex-wrap items-center gap-3 p-3.5 rounded-2xl"
          style={{ backgroundColor: "rgba(27,67,50,0.06)", border: "1px solid rgba(27,67,50,0.12)" }}>
          <div className="flex items-center gap-1.5">
            <BadgeCheck size={14} style={{ color: "#2D6A4F" }} />
            <span className="text-xs font-semibold" style={{ color: "#2D6A4F" }}>
              {lang === "en" ? "Verified from Official Govt. Portals" : "सरकारी पोर्टल से सत्यापित"}
            </span>
          </div>
          <span className="hidden sm:block w-px h-4" style={{ backgroundColor: "rgba(27,67,50,0.2)" }} />
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {lang === "en" ? "Sources: pmkisan.gov.in · pmjay.gov.in · nrega.nic.in · hpsbys.in · nsap.nic.in" : "स्रोत: केंद्र एवं HP सरकार के आधिकारिक पोर्टल"}
          </span>
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(201,146,42,0.1)", color: "#C9922A" }}>
            {lang === "en" ? "Updated: May 2025" : "अपडेट: मई 2025"}
          </span>
        </motion.div>

        {/* Search */}
        <motion.div {...fadeUp(0.04)} className="mb-5">
          <div className="card p-4">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }} />
              <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder={tx.search} className="input" style={{ paddingLeft: "2.75rem" }} />
            </div>
          </div>
        </motion.div>

        {/* Category pills */}
        <motion.div {...fadeUp(0.06)} className="flex gap-2 flex-wrap mb-6">
          {tx.cats.map((c, i) => (
            <motion.button key={c} onClick={() => setCatIdx(i)} whileTap={{ scale: 0.95 }}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200"
              style={{
                background: catIdx === i ? "linear-gradient(135deg, var(--green), var(--green-mid))" : "var(--card)",
                color: catIdx === i ? "white" : "var(--text-2)",
                border: `1px solid ${catIdx === i ? "transparent" : "var(--border)"}`,
                boxShadow: catIdx === i ? "0 4px 12px rgba(27,67,50,0.25)" : "none",
              }}>
              {i === 0 ? c : `${catIconsEn[enCats[i]] || "📋"} ${c}`}
            </motion.button>
          ))}
        </motion.div>

        <motion.p {...fadeUp(0.08)} className="text-sm mb-5" style={{ color: "var(--text-3)" }}>
          <strong style={{ color: "var(--green)" }}>{filtered.length}</strong>{" "}
          {filtered.length !== 1 ? tx.schemesIn : tx.schemeIn}
          {catIdx !== 0 && <> {tx.inCat} {tx.cats[catIdx]}</>}
        </motion.p>

        {/* Scheme cards — 2 column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} {...fadeUp(i * 0.03)} className="card overflow-hidden flex flex-col">
              <button className="w-full text-left p-4 sm:p-5 flex-1"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: "rgba(27,67,50,0.08)" }}>
                    {catIconsEn[s.category] || "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                        {lang === "hi" && s.nameHi ? s.nameHi : s.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                        style={{ backgroundColor: levelBadge[s.level]?.bg || "rgba(100,100,100,0.1)", color: levelBadge[s.level]?.text || "var(--text-3)" }}>
                        {s.level}
                      </span>
                    </div>
                    <p className="text-xs font-hindi mb-1.5" style={{ color: "var(--gold)" }}>
                      {lang === "hi" ? s.name : s.nameHi}
                    </p>
                    <p className="text-xs sm:text-sm" style={{ color: "var(--text-2)" }}>{s.benefit}</p>
                  </div>
                  <motion.div animate={{ rotate: expanded === s.id ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown size={16} style={{ color: "var(--text-3)" }} />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {expanded === s.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="overflow-hidden">
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <div className="flex flex-col gap-3 mb-4">
                        <div className="rounded-xl p-3.5" style={{ backgroundColor: "var(--bg-alt, var(--bg))" }}>
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>
                            <Users size={11} /> {tx.eligibility}
                          </p>
                          <p className="text-sm" style={{ color: "var(--text-2)" }}>{s.eligibility}</p>
                        </div>
                        <div className="rounded-xl p-3.5" style={{ backgroundColor: "var(--gold-pale)" }}>
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>
                            <FileText size={11} /> {tx.documents}
                          </p>
                          <ul className="space-y-1">
                            {s.documents.map((d) => (
                              <li key={d} className="flex items-center gap-1.5 text-xs sm:text-sm" style={{ color: "var(--text-2)" }}>
                                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--gold)" }} />{d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs" style={{ color: "var(--text-3)" }}>{s.ministry}</span>
                        <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                          href={s.applyLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white green-gradient">
                          {tx.apply} <ExternalLink size={12} />
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-14" style={{ color: "var(--text-3)" }}>
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium" style={{ color: "var(--text-2)" }}>{tx.none}</p>
            <p className="text-sm">{tx.noneHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
