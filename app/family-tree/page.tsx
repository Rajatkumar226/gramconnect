"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transition } from "framer-motion";
import { Search, Users, TreePine, Info, ChevronDown, ChevronRight } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
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
  id: string; house: string; headId: string; headName: string; members: Member[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut", delay } as Transition,
});

function norm(s: string) {
  // Unicode NFC + remove OCR junk chars + lowercase
  return (s || "").normalize("NFC").replace(/[^ऀ-ॿa-zA-Z\s]/g, "").trim().toLowerCase();
}

function isCleanName(name: string) {
  // reject names with clear OCR artifacts (mostly Latin in middle of Hindi names)
  const latinCount = (name.match(/[a-zA-Z]/g) || []).length;
  const totalCount = name.replace(/\s/g, "").length;
  return latinCount < totalCount * 0.5 && name.length > 1;
}

// Derive the true gender using the same priority as deriveRole.
// The OCR gender field has errors; relType + name suffix are more reliable.
const FEMALE_SUFFIXES = ["देवी", "कुमारी", "बाई", "वती", "मती", "बेगम", "बीबी"];
const MALE_SUFFIXES   = ["कुमार", "राम", "लाल", "सिंह", "प्रसाद", "नाथ", "दास", "चन्द", "चंद"];

function inferGender(m: Member): "M" | "F" {
  if (m.relType === "husband") return "F"; // person IS a wife — 100% reliable
  if (m.relType === "wife")    return "M"; // person IS a husband — 100% reliable
  const name = m.name || "";
  for (const s of FEMALE_SUFFIXES) if (name.includes(s)) return "F";
  for (const s of MALE_SUFFIXES)   if (name.endsWith(s) || name.includes(` ${s}`)) return "M";
  return m.gender || "M"; // OCR field as last resort
}

function memberIcon(m: Member) {
  const g = inferGender(m);
  if (g === "F") return m.age > 55 ? "👩‍🦳" : m.age > 20 ? "👩" : "👧";
  return m.age > 60 ? "👴" : m.age > 30 ? "👨" : m.age > 14 ? "🧑" : "👦";
}

// Extract the reference person's name from the noisy OCR relName field.
// relName often looks like "राम लाल पिता का नाम: बिहारी लाल" — we want "राम लाल".
function extractFirstName(relName: string): string {
  const before = (relName || "")
    .split(/(पिता|पति|माता|पत्नी)\s+का\s+नाम/)[0]
    .replace(/[^ऀ-ॿa-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return before.split(/\s+/).filter(Boolean).slice(0, 3).join(" ") || "";
}

// Derive the actual family role from gender + relType + whether this is the head.
// relType in the voter roll means HOW the person was identified — not their role:
//   relType="father"  → identified by father's name → could be son OR daughter
//   relType="husband" → identified by husband's name → the person IS a wife
//   relType="wife"    → identified by wife's name → the person IS a husband
// Males with relType="husband" are an OCR artifact; treat them as sons.
function deriveRole(m: Member, headId: string, lang: string): { label: string; color: string } {
  const en = lang === "en";
  if (m.id === headId)
    return { label: en ? "Head" : "मुखिया", color: "#C9922A" };

  // Use inferGender — NOT m.gender — to avoid OCR field errors
  const g = inferGender(m);

  if (m.relType === "husband")
    return { label: en ? "Wife" : "पत्नी", color: "#db2777" };   // always female
  if (m.relType === "wife")
    return { label: en ? "Husband" : "पति", color: "#2563eb" };  // always male
  if (m.relType === "father")
    return g === "F"
      ? { label: en ? "Daughter" : "पुत्री", color: "#7c3aed" }
      : { label: en ? "Son"      : "पुत्र",   color: "#2563eb" };
  if (m.relType === "mother")
    return { label: en ? "Child" : "संतान", color: "#16a34a" };
  return { label: en ? "Member" : "सदस्य", color: "var(--text-3)" };
}

function genColor(m: Member) {
  const g = inferGender(m);
  return g === "F"
    ? { bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.3)", text: "#db2777" }
    : { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#2563eb" };
}

// ── Tree constants ────────────────────────────────────────────────────────────

const NODE_W    = 108; // px — column width per node
const NODE_SIZE = 68;  // px — circle diameter
const LINE_COL  = "#C9922A";

// ── Circular Tree Node ────────────────────────────────────────────────────────

function TreeNode({
  m, highlight, headId, compact = false,
}: {
  m: Member; highlight: boolean; headId: string; compact?: boolean;
}) {
  const { lang } = useLang();
  const col = genColor(m);
  const { label: roleLabel, color: roleColor } = deriveRole(m, headId, lang);
  const sz = compact ? 52 : NODE_SIZE;
  const nw = compact ? 80 : NODE_W;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: nw }}>
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        style={{
          width: sz, height: sz, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: compact ? "1.35rem" : "1.9rem", flexShrink: 0,
          backgroundColor: highlight ? "rgba(201,146,42,0.15)" : col.bg,
          border: `2.5px solid ${highlight ? "#C9922A" : col.border}`,
          boxShadow: highlight
            ? "0 0 0 4px rgba(201,146,42,0.25), 0 2px 12px rgba(0,0,0,0.1)"
            : "0 2px 8px rgba(0,0,0,0.08)",
          position: "relative",
        }}>
        {memberIcon(m)}
        {highlight && (
          <motion.span
            style={{ position: "absolute", top: -5, right: -5, fontSize: 13, lineHeight: 1 }}
            animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
            ⭐
          </motion.span>
        )}
      </motion.div>

      <p className="font-hindi"
        style={{
          marginTop: 7, fontSize: compact ? 10 : 11, fontWeight: 700, lineHeight: 1.3,
          color: highlight ? "var(--gold)" : "var(--text)",
          textAlign: "center", maxWidth: nw - 4, wordBreak: "break-word",
        }}>
        {m.name}
      </p>

      <span style={{
        display: "inline-block", marginTop: 4, fontSize: 9,
        padding: "2px 7px", borderRadius: 999, fontWeight: 600,
        backgroundColor: `${roleColor}20`, color: roleColor,
      }}>
        {roleLabel}
      </span>

      {m.age > 0 && (
        <span style={{ fontSize: 9, color: "var(--text-3)", marginTop: 2 }}>{m.age} yr</span>
      )}
    </div>
  );
}

// ── Family Tree Visualization ─────────────────────────────────────────────────

function FamilyTree({ family, searchedName }: { family: Family; searchedName: string }) {
  const { lang } = useLang();
  const members = family.members;
  const searchNorm = norm(searchedName);
  const isHit = (m: Member) => searchNorm.length > 1 && norm(m.name).includes(searchNorm);

  // ── Build relationship groups ──────────────────────────────────────────────
  const head = members.find((m) => m.id === family.headId) || members[0];
  const headNorm = norm(head?.name || "");

  // relType="husband" → this person IS a wife (relType is more reliable than m.gender OCR field)
  const spouse = members.find((m) =>
    m.id !== head?.id &&
    m.relType === "husband" &&
    (m.linkedTo === head?.id ||
      headNorm.length > 1 && (
        norm(extractFirstName(m.relName)).includes(headNorm) ||
        headNorm.includes(norm(extractFirstName(m.relName)))
      ))
  );

  const children = members.filter((m) =>
    m.id !== head?.id &&
    m.id !== spouse?.id &&
    m.relType === "father" &&
    (m.linkedTo === head?.id ||
      headNorm.length > 1 && (
        norm(extractFirstName(m.relName)).includes(headNorm) ||
        headNorm.includes(norm(extractFirstName(m.relName)))
      ))
  ).sort((a, b) => b.age - a.age);

  const coreIds = new Set([head?.id, spouse?.id, ...children.map((c) => c.id)].filter(Boolean) as string[]);
  const others = members.filter((m) => !coreIds.has(m.id)).sort((a, b) => b.age - a.age);

  const hasSpouse   = !!spouse;
  const hasChildren = children.length > 0;

  // Heart connector width between head and spouse
  const HEART_W = 48;
  // Each child gets this column width (node + horizontal padding)
  const CHILD_COL = NODE_W + 20;

  return (
    <div className="space-y-5">

      {/* ── Household Header ── */}
      <motion.div {...fadeUp()} className="rounded-2xl p-5 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#1B4332,#2D6A4F)", border: "1px solid rgba(201,146,42,0.2)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(201,146,42,0.1), transparent 60%)" }} />
        <p className="text-[11px] tracking-widest uppercase text-white/40 mb-1 relative">
          {lang === "en" ? "Household" : "परिवार"} · {lang === "en" ? "House No." : "गृह संख्या"} {family.house || "—"} · Part {members[0]?.part}
        </p>
        <p className="text-xl font-bold text-white font-hindi relative">{family.headName}</p>
        <p className="text-xs text-white/40 mt-0.5 relative">{lang === "en" ? "Head of household" : "परिवार के मुखिया"}</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs relative"
          style={{ backgroundColor: "rgba(201,146,42,0.15)", color: "#E8B84B" }}>
          <Users size={11} /> {members.length} {lang === "en" ? "registered voters" : "पंजीकृत मतदाता"}
        </div>
      </motion.div>

      {/* ── Tree Diagram Card ── */}
      <motion.div {...fadeUp(0.06)} className="card p-5 sm:p-7" style={{ overflowX: "auto" }}>
        {/* Flex column — all rows centered horizontally so lines align naturally */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "max-content", minWidth: "100%" }}>

          {/* ── Generation 1: Couple row ── */}
          {head && (
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}>
                <TreeNode m={head} highlight={isHit(head)} headId={family.headId} />
              </motion.div>

              {hasSpouse && (
                <>
                  {/* ❤ connector centered at circle mid-height */}
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    paddingTop: NODE_SIZE / 2 - 11, width: HEART_W, gap: 2,
                  }}>
                    <div style={{ width: "100%", height: 2, backgroundColor: LINE_COL, opacity: 0.55 }} />
                    <span style={{ fontSize: 12, color: LINE_COL, lineHeight: 1 }}>❤</span>
                    <div style={{ width: "100%", height: 2, backgroundColor: LINE_COL, opacity: 0.55 }} />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.07 }}>
                    <TreeNode m={spouse!} highlight={isHit(spouse!)} headId={family.headId} />
                  </motion.div>
                </>
              )}
            </div>
          )}

          {/* ── Vertical drop from couple ── */}
          {hasChildren && (
            <motion.div
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              style={{ width: 2, height: 36, backgroundColor: LINE_COL, opacity: 0.45, transformOrigin: "top" }} />
          )}

          {/* ── Generation 2: Children with bracket connector ── */}
          {hasChildren && (
            <div style={{ display: "flex" }}>
              {children.map((child, i) => {
                const isFirst = i === 0;
                const isLast  = i === children.length - 1;
                const isOnly  = children.length === 1;

                return (
                  <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: CHILD_COL }}>
                    {/* Bracket segment: horizontal rail + vertical drop */}
                    <div style={{ width: "100%", height: 32, position: "relative" }}>
                      {/* Left half of horizontal rail */}
                      {!isOnly && !isFirst && (
                        <div style={{
                          position: "absolute", top: 0, left: 0, width: "50%",
                          height: 2, backgroundColor: LINE_COL, opacity: 0.45,
                        }} />
                      )}
                      {/* Right half of horizontal rail */}
                      {!isOnly && !isLast && (
                        <div style={{
                          position: "absolute", top: 0, right: 0, width: "50%",
                          height: 2, backgroundColor: LINE_COL, opacity: 0.45,
                        }} />
                      )}
                      {/* Vertical drop to node */}
                      <div style={{
                        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                        width: 2, height: "100%", backgroundColor: LINE_COL, opacity: 0.45,
                      }} />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 260, damping: 22 }}>
                      <TreeNode m={child} highlight={isHit(child)} headId={family.headId} />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Other Household Members (compact nodes) ── */}
      {others.length > 0 && (
        <motion.div {...fadeUp(0.22)} className="card p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>
            {lang === "en" ? `Other Members (${others.length})` : `अन्य सदस्य (${others.length})`}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            {others.map((m, i) => (
              <motion.div key={m.id}
                initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}>
                <TreeNode m={m} highlight={isHit(m)} headId={family.headId} compact />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Disclaimer ── */}
      <motion.div {...fadeUp(0.3)} className="flex items-start gap-2 p-3 rounded-xl"
        style={{ backgroundColor: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
        <Info size={12} className="mt-0.5 shrink-0" style={{ color: "#3b82f6" }} />
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-3)" }}>
          {lang === "en"
            ? "Source: ECI Final Voter Roll 2025, Jawalamukhi (Parts 4 & 5). Only registered voters shown. Relationships are derived from voter roll fields — some groupings may need correction. For errors, contact Dehrian Panchayat office."
            : "स्रोत: ECI अंतिम मतदाता सूची 2025, जवालामुखी (भाग 4 और 5)। केवल पंजीकृत मतदाता दिखते हैं। रिश्ते मतदाता सूची से निकाले गए हैं — किसी गलती के लिए पंचायत कार्यालय से संपर्क करें।"}
        </p>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function FamilyTreePage() {
  const { user, requireAuth } = useAuth();
  const { lang } = useLang();

  const [allVoters, setAllVoters]   = useState<any[]>([]);
  const [allFamilies, setAllFamilies] = useState<Family[]>([]);
  const [dataLoaded, setDataLoaded]  = useState(false);

  const [queryStr, setQueryStr] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [loading, setLoading]   = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);

  // Load all data once on mount (601 voters, 149 families — small enough)
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getDocs(collection(db, "voters")),
      getDocs(collection(db, "families")),
    ]).then(([vSnap, fSnap]) => {
      const voters   = vSnap.docs.map((d) => d.data()).filter((v) => isCleanName(v.name ?? ""));
      const families = fSnap.docs.map((d) => d.data() as Family);
      setAllVoters(voters);
      setAllFamilies(families);
      setDataLoaded(true);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  // Filtered suggestions — live as user types
  const suggestions = useMemo(() => {
    if (!queryStr.trim() || queryStr.trim().length < 2) return [];
    const q = norm(queryStr);
    return allVoters
      .filter((v) => norm(v.name).includes(q))
      .slice(0, 15);
  }, [queryStr, allVoters]);

  const selectVoter = useCallback((voter: any) => {
    const vn = norm(voter.name);
    // Try exact match first, then partial — handles minor OCR name variations
    // between the voters collection and the families collection.
    const fam =
      allFamilies.find((f) => f.members.some((m) => norm(m.name) === vn)) ||
      allFamilies.find((f) => f.members.some((m) => {
        const mn = norm(m.name);
        return mn.includes(vn) || vn.includes(mn);
      }));
    setSelectedFamily(fam ?? null);
    setQueryStr(voter.name);
    setShowBrowse(false);
  }, [allFamilies]);

  const handleSearch = () => {
    if (!user) {
      requireAuth(lang === "en" ? "Login to search your family tree" : "वंश वृक्ष देखने के लिए लॉगिन करें");
      return;
    }
    if (!queryStr.trim()) return;
    // Try direct search from suggestions
    if (suggestions.length > 0) selectVoter(suggestions[0]);
  };

  // Browse: alphabetically sorted clean names
  const browseNames = useMemo(() =>
    [...allVoters]
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", "hi"))
      .slice(0, 200),
    [allVoters]
  );

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div className="relative pt-28 pb-10 sm:pt-36 sm:pb-14 overflow-hidden"
        style={{ background: "linear-gradient(160deg,#052e16 0%,#14532d 50%,#166534 100%)" }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 65% 40%, rgba(74,222,128,0.18), transparent 55%)" }}
          animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 10, repeat: Infinity }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 glass-dark">
            <TreePine size={12} style={{ color: "#86efac" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#86efac" }}>
              {lang === "en" ? "Family Tree · वंश वृक्ष" : "वंश वृक्ष · Family Tree"}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold text-white mb-3 font-display">
            {lang === "en" ? "Your " : "अपना "}
            <span style={{ background: "linear-gradient(90deg,#86efac,#bbf7d0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {lang === "en" ? "Family Tree" : "वंश वृक्ष"}
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-sm max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            {lang === "en"
              ? "Search your name in Hindi to find your household from Dehrian's official ECI voter records."
              : "डेहरियाँ की ECI मतदाता सूची में अपना नाम हिंदी में खोजें।"}
          </motion.p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">

        {/* ── Search Card ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-5 sm:p-6 -mt-8 relative z-10">

          {!user ? (
            <div className="text-center py-4">
              <p className="text-3xl mb-3">🔒</p>
              <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                {lang === "en" ? "Login Required" : "लॉगिन आवश्यक"}
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
                {lang === "en" ? "Login to search the family tree records." : "वंश वृक्ष देखने के लिए लॉगिन करें।"}
              </p>
              <motion.button whileTap={{ scale: 0.96 }}
                onClick={() => requireAuth(lang === "en" ? "Login to view family tree" : "वंश वृक्ष देखने के लिए लॉगिन करें")}
                className="px-6 py-3 rounded-xl font-semibold text-sm text-white"
                style={{ background: "linear-gradient(135deg,#14532d,#166534)" }}>
                {lang === "en" ? "Login with Mobile OTP" : "मोबाइल OTP से लॉगिन करें"}
              </motion.button>
            </div>
          ) : (
            <>
              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: "var(--text-3)" }}>
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {lang === "en" ? "Loading voter records…" : "मतदाता रिकॉर्ड लोड हो रहे हैं…"}
                </div>
              )}

              {/* Hint */}
              {dataLoaded && (
                <p className="text-[11px] mb-3 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                  <Info size={11} />
                  {lang === "en"
                    ? `${allVoters.filter(v=>isCleanName(v.name)).length} voter records loaded — type your name in Hindi script (हिंदी)`
                    : `${allVoters.filter(v=>isCleanName(v.name)).length} मतदाता रिकॉर्ड लोड — हिंदी में नाम टाइप करें`}
                </p>
              )}

              {/* Search input */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
                    <input type="text" className="input font-hindi" style={{ paddingLeft: "2.75rem" }}
                      placeholder={lang === "en" ? "मदन लाल / Madan Lal…" : "जैसे मदन लाल, सुनीता देवी…"}
                      value={queryStr}
                      onChange={(e) => { setQueryStr(e.target.value); setSelectedFamily(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      disabled={!dataLoaded}
                    />
                  </div>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={handleSearch}
                    disabled={!dataLoaded || !queryStr.trim()}
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white shrink-0"
                    style={{ background: "linear-gradient(135deg,#14532d,#166534)", opacity: (!dataLoaded || !queryStr.trim()) ? 0.5 : 1 }}>
                    <Search size={15} />
                  </motion.button>
                </div>

                {/* Live suggestions dropdown */}
                <AnimatePresence>
                  {suggestions.length > 0 && !selectedFamily && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden z-20 shadow-xl"
                      style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                      {suggestions.map((v, i) => (
                        <motion.button key={i} onClick={() => selectVoter(v)}
                          whileHover={{ backgroundColor: "rgba(27,67,50,0.06)" }}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 border-b last:border-0"
                          style={{ borderColor: "var(--border)" }}>
                          <span className="text-lg">{memberIcon(v as Member)}</span>
                          <div>
                            <p className="font-semibold text-sm font-hindi" style={{ color: "var(--text)" }}>{v.name}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>
                              {v.relType === "father" && v.gender === "M" ? "S/O" :
                               v.relType === "father" && v.gender === "F" ? "D/O" :
                               v.relType === "husband" ? "W/O" :
                               v.relType === "wife" ? "H/O" : ""}{" "}
                              {extractFirstName(v.relName)} · {v.age > 0 ? `${v.age} yr` : ""} · Part {v.part}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* No match + browse option */}
              {dataLoaded && queryStr.length >= 2 && suggestions.length === 0 && !selectedFamily && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                  <p className="text-xs text-red-500 flex items-center gap-1.5">
                    <Info size={11} />
                    {lang === "en"
                      ? "No match found. Your name might have a different spelling in the voter roll — try browsing below."
                      : "कोई मिलान नहीं मिला। मतदाता सूची में नाम की वर्तनी अलग हो सकती है — नीचे ब्राउज़ करें।"}
                  </p>
                </motion.div>
              )}

              {/* Browse all button */}
              {dataLoaded && (
                <button onClick={() => setShowBrowse((p) => !p)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "var(--green-lt, #40916C)" }}>
                  {showBrowse ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {lang === "en" ? `Browse all ${browseNames.length} names` : `सभी ${browseNames.length} नाम देखें`}
                </button>
              )}

              {/* Browse list */}
              <AnimatePresence>
                {showBrowse && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
                      {browseNames.map((v, i) => (
                        <button key={i} onClick={() => selectVoter(v)}
                          className="w-full text-left px-3 py-2.5 flex items-center gap-2 border-b last:border-0 hover:bg-green-50 transition-colors"
                          style={{ borderColor: "var(--border)" }}>
                          <span>{v.gender === "F" ? "👩" : "👨"}</span>
                          <span className="text-sm font-hindi" style={{ color: "var(--text)" }}>{v.name}</span>
                          <span className="ml-auto text-[10px]" style={{ color: "var(--text-3)" }}>{v.age > 0 ? `${v.age}yr` : ""}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>

        {/* ── Stats ── */}
        {!selectedFamily && user && dataLoaded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: "🗳️", val: allVoters.length, label: lang === "en" ? "Voters" : "मतदाता" },
              { icon: "🏠", val: allFamilies.length, label: lang === "en" ? "Households" : "परिवार" },
              { icon: "📋", val: "2", label: lang === "en" ? "Roll Parts" : "भाग" },
            ].map(({ icon, val, label }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }} className="card p-4 text-center">
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-xl font-bold font-display" style={{ color: "var(--text)" }}>{val}</p>
                <p className="text-[10px] font-hindi" style={{ color: "var(--text-3)" }}>{label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Family Tree result ── */}
        <AnimatePresence>
          {selectedFamily && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} className="mt-6">
              <FamilyTree family={selectedFamily} searchedName={queryStr} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
