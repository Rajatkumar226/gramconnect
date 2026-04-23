"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Phone, MapPin, Clock, Shield, Star, Filter, ArrowRight, X } from "lucide-react";
import businesses from "@/data/businesses.json";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["All", "Grocery & Kirana", "Medical & Pharmacy", "Dairy & Milk", "Hardware & Electronics", "Food & Restaurant", "Tailoring & Clothing", "Mobile & Repair", "Agriculture & Nursery"];

const catIcon: Record<string, string> = {
  "Grocery & Kirana": "🛒", "Medical & Pharmacy": "💊", "Dairy & Milk": "🥛",
  "Hardware & Electronics": "🔧", "Food & Restaurant": "🍽️", "Tailoring & Clothing": "🧵",
  "Mobile & Repair": "📱", "Agriculture & Nursery": "🌱",
};

function Stars({ r }: { r: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={11} fill={s <= Math.round(r) ? "#C9922A" : "none"}
          stroke={s <= Math.round(r) ? "#C9922A" : "#d1d5db"} />
      ))}
      <span className="text-xs ml-1" style={{ color: "var(--text-3)" }}>{r.toFixed(1)}</span>
    </div>
  );
}

export default function DirectoryPage() {
  const { user, requireAuth } = useAuth();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [verified, setVerified] = useState(false);

  const handleCall = (phone: string) => {
    if (!user) { requireAuth("Login to view business contact numbers"); return; }
    window.location.href = `tel:${phone}`;
  };

  const list = businesses.filter((b) => {
    const matchCat = cat === "All" || b.category === cat;
    const matchV = !verified || b.verified;
    const str = q.toLowerCase();
    const matchQ = !str || b.name.toLowerCase().includes(str) || b.description.toLowerCase().includes(str) || b.category.toLowerCase().includes(str);
    return matchCat && matchV && matchQ;
  });

  const verCount = businesses.filter((b) => b.verified).length;

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #2a1500 0%, #78350f 50%, #b45309 100%)" }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgba(252,211,77,0.18), transparent 50%)" }}
          animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 7, repeat: Infinity }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 glass-dark">
            <Shield size={12} style={{ color: "#fde68a" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#fde68a" }}>Business Directory</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold text-white mb-2 font-display">
            Local <span style={{ background: "linear-gradient(90deg, #fde68a, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Directory</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,220,150,0.6)" }}>
            Discover local businesses of Dehrian. <strong style={{ color: "#fde68a" }}>{verCount} listings</strong> are Panchayat Verified.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8 sm:pb-20">
        {/* Search + filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="-mt-5 mb-5 card p-4 flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search businesses, categories…" className="input pl-10" />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <X size={14} style={{ color: "var(--text-3)" }} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} style={{ color: "var(--text-3)" }} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setVerified(!verified)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: verified ? "linear-gradient(135deg, var(--green), var(--green-mid))" : "var(--bg-alt, var(--bg))",
                color: verified ? "white" : "var(--text-2)",
                border: `1px solid ${verified ? "transparent" : "var(--border)"}`,
              }}>
              <Shield size={11} /> Verified Only
            </motion.button>
          </div>
        </motion.div>

        {/* Category scroll */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
          {categories.map((c) => (
            <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setCat(c)}
              className="px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all"
              style={{
                background: cat === c ? "linear-gradient(135deg, #78350f, #b45309)" : "var(--card)",
                color: cat === c ? "white" : "var(--text-2)",
                border: `1px solid ${cat === c ? "transparent" : "var(--border)"}`,
                boxShadow: cat === c ? "0 4px 12px rgba(120,53,15,0.3)" : "none",
              }}>
              {c === "All" ? "All Businesses" : `${catIcon[c] || "🏪"} ${c}`}
            </motion.button>
          ))}
        </motion.div>

        <p className="text-sm mb-5" style={{ color: "var(--text-3)" }}>
          <strong style={{ color: "var(--gold)" }}>{list.length}</strong> listing{list.length !== 1 ? "s" : ""}
          {verified && " · Verified only"}
        </p>

        {/* Cards */}
        <AnimatePresence mode="popLayout">
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {list.map((b, i) => (
              <motion.div key={b.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22,1,0.36,1] }}
                className="card p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden"
                whileHover={{ y: -3 }}
              >
                {b.verified && (
                  <div className="absolute top-3.5 right-3.5">
                    <span className="badge-verified">
                      <Shield size={9} /> VERIFIED
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 pr-20">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: "rgba(120,53,15,0.1)" }}>
                    {catIcon[b.category] || "🏪"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base leading-tight" style={{ color: "var(--text)" }}>{b.name}</h3>
                    <p className="text-xs mt-0.5 font-hindi" style={{ color: "var(--text-3)" }}>{b.nameHi}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ backgroundColor: "rgba(120,53,15,0.1)", color: "#b45309" }}>{b.category}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{b.description}</p>
                <Stars r={b.rating} />

                <div className="space-y-1.5 text-xs" style={{ color: "var(--text-2)" }}>
                  <div className="flex items-center gap-2"><MapPin size={11} style={{ color: "#b45309" }} /><span>{b.address}</span></div>
                  <div className="flex items-center gap-2"><Clock size={11} style={{ color: "#b45309" }} /><span>{b.timing}</span></div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleCall(b.phone)}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white mt-auto"
                  style={{ background: "linear-gradient(135deg, #78350f, #b45309)" }}>
                  <Phone size={14} /> {user ? b.phone : "Login to Call"}
                </motion.button>

                {!b.verified && (
                  <p className="text-center text-xs" style={{ color: "var(--text-3)" }}>Verification pending</p>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {list.length === 0 && (
          <div className="text-center py-14" style={{ color: "var(--text-3)" }}>
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium" style={{ color: "var(--text-2)" }}>No businesses found</p>
          </div>
        )}

        {/* Register CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 rounded-2xl p-5 sm:p-6 text-center green-gradient">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-display">Own a local business?</h3>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>Get listed with a Panchayat Verified badge.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
            Register Now <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}`}</style>
    </div>
  );
}
