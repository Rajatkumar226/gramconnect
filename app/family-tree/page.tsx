"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transition } from "framer-motion";
import { Search, Users, TreePine, Phone, ChevronDown, Info, User, Heart, Baby } from "lucide-react";
import {
  collection, query, where, getDocs, orderBy, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

// ── Types ──────────────────────────────────────────────────────────────────────

type Member = {
  id: string; name: string; age: number; gender: "M" | "F";
  relType: string; relName: string; house: string; part: string;
  linkedTo: string | null;
};

type Family = {
  id: string; house: string; headId: string; headName: string;
  members: Member[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut", delay } as Transition,
});

function relLabel(relType: string, lang: string) {
  const map: Record<string, [string, string]> = {
    father:  ["Son/Daughter of", "पुत्र/पुत्री"],
    husband: ["Wife of",         "पत्नी"],
    mother:  ["Child of",        "सन्तान"],
    wife:    ["Husband of",      "पति"],
  };
  return lang === "en" ? (map[relType]?.[0] ?? relType) : (map[relType]?.[1] ?? relType);
}

function memberIcon(m: Member) {
  if (m.relType === "husband") return "👩";
  if (m.gender === "F") return m.age > 50 ? "👩‍🦳" : "👩";
  return m.age > 60 ? "👴" : m.age > 30 ? "👨" : "👦";
}

function genderColor(m: Member) {
  return m.gender === "F"
    ? { bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.35)", text: "#db2777" }
    : { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.35)", text: "#2563eb" };
}

// ── Member Node ────────────────────────────────────────────────────────────────

function MemberNode({ m, highlight, onClick, index }:
  { m: Member; highlight: boolean; onClick: () => void; index: number }) {
  const col = genderColor(m);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 20 }}
      onClick={onClick}
      className="cursor-pointer flex flex-col items-center gap-2 group"
    >
      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg"
        style={{
          backgroundColor: highlight ? "rgba(201,146,42,0.15)" : col.bg,
          border: `2px solid ${highlight ? "#C9922A" : col.border}`,
          boxShadow: highlight ? "0 0 0 4px rgba(201,146,42,0.2)" : undefined,
        }}>
        {memberIcon(m)}
        {highlight && (
          <motion.div
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ backgroundColor: "#C9922A" }}
            animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            ★
          </motion.div>
        )}
      </motion.div>

      {/* Name */}
      <div className="text-center max-w-[80px] sm:max-w-[100px]">
        <p className="text-xs sm:text-sm font-bold leading-tight font-hindi truncate"
          style={{ color: highlight ? "var(--gold)" : "var(--text)" }}>
          {m.name}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: col.text }}>
          {m.age > 0 ? `${m.age} yr` : ""} · {m.gender === "F" ? "महिला" : "पुरुष"}
        </p>
      </div>
    </motion.div>
  );
}

// ── Connector SVG line ─────────────────────────────────────────────────────────

function Connector({ vertical = false }: { vertical?: boolean }) {
  return (
    <motion.div
      initial={{ scaleY: 0, scaleX: 0 }} animate={{ scaleY: 1, scaleX: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={vertical ? "w-0.5 h-8 mx-auto" : "h-0.5 w-8"}
      style={{ backgroundColor: "var(--border)", transformOrigin: "top" }} />
  );
}

// ── Family Tree Viz ────────────────────────────────────────────────────────────

function FamilyTreeViz({ family, searchedName }: { family: Family; searchedName: string }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { lang } = useLang();

  const members = family.members;
  const head    = members.find((m) => m.id === family.headId) ?? members[0];

  // Separate into generations heuristically by age
  const sorted   = [...members].sort((a, b) => b.age - a.age);
  const elders   = sorted.filter((m) => m.age >= 55);
  const adults   = sorted.filter((m) => m.age >= 25 && m.age < 55);
  const youth    = sorted.filter((m) => m.age < 25);

  const generations = [elders, adults, youth].filter((g) => g.length > 0);
  const genLabels   = [
    lang === "en" ? "Elders" : "बुजुर्ग",
    lang === "en" ? "Adults" : "वयस्क",
    lang === "en" ? "Youth"  : "युवा",
  ];

  return (
    <div className="space-y-6">
      {/* House banner */}
      <motion.div {...fadeUp()} className="rounded-2xl p-4 text-center"
        style={{ background: "linear-gradient(135deg, #1B4332, #2D6A4F)", border: "1px solid rgba(201,146,42,0.2)" }}>
        <p className="text-xs tracking-widest uppercase text-white/50 mb-1">
          {lang === "en" ? "Household" : "परिवार"} · {lang === "en" ? "House No." : "गृह संख्या"} {family.house || "—"}
        </p>
        <p className="text-lg font-bold text-white font-hindi">{head?.name}</p>
        <p className="text-xs text-white/40 mt-0.5 font-hindi">
          {lang === "en" ? "Head of household" : "परिवार के मुखिया"}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
          style={{ backgroundColor: "rgba(201,146,42,0.15)", color: "#E8B84B" }}>
          <Users size={11} /> {members.length} {lang === "en" ? "registered voters" : "पंजीकृत मतदाता"}
        </div>
      </motion.div>

      {/* Tree by generation */}
      {generations.map((gen, gi) => (
        <motion.div key={gi} {...fadeUp(gi * 0.1)}>
          {/* Gen label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
            <span className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: "var(--bg-alt,var(--bg))", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              {genLabels[gi]}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
          </div>

          {/* Connector from above */}
          {gi > 0 && <Connector vertical />}

          {/* Members row */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {gen.map((m, mi) => (
              <div key={m.id} className="flex flex-col items-center gap-1">
                {mi > 0 && mi % 2 === 1 && <Connector />}
                <MemberNode
                  m={m}
                  highlight={m.name === searchedName || m.name.includes(searchedName)}
                  index={mi}
                  onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Member detail panel */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="card p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ ...genderColor(selectedMember), backgroundColor: genderColor(selectedMember).bg }}>
                {memberIcon(selectedMember)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg font-hindi" style={{ color: "var(--text)" }}>
                  {selectedMember.name}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: genderColor(selectedMember).bg, color: genderColor(selectedMember).text }}>
                    {selectedMember.gender === "F" ? "महिला" : "पुरुष"} · {selectedMember.age} yr
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(27,67,50,0.1)", color: "var(--green)" }}>
                    {relLabel(selectedMember.relType, lang)} {selectedMember.relName.split(" ")[0]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--bg-alt,var(--bg))", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                    Part {selectedMember.part}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <motion.div {...fadeUp(0.3)} className="flex items-start gap-2 p-3 rounded-xl"
        style={{ backgroundColor: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.15)" }}>
        <Info size={13} className="mt-0.5 shrink-0" style={{ color: "#3b82f6" }} />
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
          {lang === "en"
            ? "Data sourced from ECI Final Voter Roll 2025, Jawalamukhi Constituency (Parts 4 & 5). Only registered voters are shown. For corrections, contact Dehrian Panchayat office."
            : "यह डेटा ECI अंतिम मतदाता सूची 2025, जवालामुखी निर्वाचन क्षेत्र (भाग 4 और 5) से लिया गया है। केवल पंजीकृत मतदाता दिखाई देते हैं। सुधार के लिए पंचायत कार्यालय से संपर्क करें।"}
        </p>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function FamilyTreePage() {
  const { user, requireAuth } = useAuth();
  const { lang } = useLang();

  const [query_, setQuery] = useState("");
  const [results, setResults] = useState<{ voter: any; family: Family } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    if (!user) {
      requireAuth(lang === "en" ? "Login to search your family tree" : "पारिवारिक वृक्ष देखने के लिए लॉगिन करें");
      return;
    }
    if (!query_.trim() || query_.trim().length < 2) {
      setError(lang === "en" ? "Enter at least 2 characters" : "कम से कम 2 अक्षर दर्ज करें");
      return;
    }
    setLoading(true);
    setError("");
    setResults(null);
    setSearched(false);

    try {
      // Search voters collection for name match
      const votersSnap = await getDocs(collection(db, "voters"));
      const q = query_.trim().toLowerCase();

      // Find best matching voter
      const matched = votersSnap.docs
        .map((d) => d.data())
        .filter((v) => v.name && v.name.toLowerCase().includes(q));

      if (matched.length === 0) {
        setError(lang === "en"
          ? "No records found. Try a different spelling or contact the panchayat office."
          : "कोई रिकॉर्ड नहीं मिला। अलग वर्तनी आज़माएँ या पंचायत कार्यालय से संपर्क करें।");
        setSearched(true);
        return;
      }

      const voter = matched[0];

      // Find their family by house
      const famsSnap = await getDocs(collection(db, "families"));
      const fam = famsSnap.docs
        .map((d) => d.data() as Family)
        .find((f) => f.members.some((m) => m.name === voter.name));

      if (!fam) {
        setError(lang === "en" ? "Family record not found." : "पारिवारिक रिकॉर्ड नहीं मिला।");
        setSearched(true);
        return;
      }

      setResults({ voter, family: fam });
      setSearched(true);
    } catch (e) {
      setError(lang === "en" ? "Error fetching records." : "रिकॉर्ड लाने में त्रुटि।");
    } finally {
      setLoading(false);
    }
  }, [user, query_, requireAuth, lang]);

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div className="relative pt-28 pb-10 sm:pt-36 sm:pb-14 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #052e16 0%, #14532d 50%, #166534 100%)" }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 70% 40%, rgba(74,222,128,0.15), transparent 55%)" }}
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity }} />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #86efac, transparent)" }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 glass-dark">
            <TreePine size={12} style={{ color: "#86efac" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#86efac" }}>
              {lang === "en" ? "Family Tree" : "वंश वृक्ष"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold text-white mb-2 font-display">
            {lang === "en" ? "Your " : "अपना "}
            <span style={{ background: "linear-gradient(90deg, #86efac, #bbf7d0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {lang === "en" ? "Family Tree" : "वंश वृक्ष"}
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            {lang === "en"
              ? "Search your name to see your household family tree from Dehrian's official voter records."
              : "डेहरियाँ की आधिकारिक मतदाता सूची से अपना पारिवारिक वृक्ष देखने के लिए अपना नाम खोजें।"}
          </motion.p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">

        {/* ── Search box ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-5 sm:p-6 -mt-8 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-3)" }}>
            {lang === "en" ? "Search by name (Hindi or English)" : "नाम से खोजें (हिंदी या अंग्रेज़ी)"}
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: "2.75rem" }}
                placeholder={lang === "en" ? "e.g. राम लाल / Ram Lal" : "जैसे राम लाल / Ram Lal"}
                value={query_}
                onChange={(e) => { setQuery(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }} onClick={search} disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2 shrink-0"
              style={{ background: "linear-gradient(135deg, #14532d, #166534)", opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Search size={14} /> {lang === "en" ? "Search" : "खोजें"}</>}
            </motion.button>
          </div>

          {!user && (
            <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: "var(--gold)" }}>
              <Info size={11} />
              {lang === "en" ? "Login required to search records." : "रिकॉर्ड खोजने के लिए लॉगिन आवश्यक है।"}
            </p>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-3 text-xs text-red-500 flex items-center gap-1.5">
              <Info size={11} /> {error}
            </motion.p>
          )}
        </motion.div>

        {/* ── Stats strip ── */}
        {!searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Users,    val: "601", label: lang === "en" ? "Registered Voters" : "पंजीकृत मतदाता" },
              { icon: Heart,    val: "149", label: lang === "en" ? "Households" : "परिवार" },
              { icon: TreePine, val: "2",   label: lang === "en" ? "Voter Roll Parts" : "मतदाता सूची भाग" },
            ].map(({ icon: Icon, val, label }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="card p-4 text-center">
                <Icon size={18} className="mx-auto mb-1" style={{ color: "var(--green)" }} />
                <p className="text-xl font-bold font-display" style={{ color: "var(--text)" }}>{val}</p>
                <p className="text-[10px] mt-0.5 font-hindi" style={{ color: "var(--text-3)" }}>{label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Results ── */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="mt-8">
              <FamilyTreeViz family={results.family} searchedName={query_.trim()} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
