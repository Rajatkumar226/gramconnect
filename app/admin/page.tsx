"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, XCircle, Clock, Eye, Lock, Search, Users, Store, AlertTriangle, Check } from "lucide-react";

interface Reg {
  id: number; bName: string; category: string; address: string; phone: string;
  oName: string; oPhone: string; aadhaar: string; email: string;
  status: "pending" | "approved" | "rejected"; at: string;
  timing?: string; desc?: string;
}

const PASS = "dehrian2025";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const [regs, setRegs] = useState<Reg[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<Reg | null>(null);

  useEffect(() => {
    if (authed) setRegs(JSON.parse(localStorage.getItem("gc_regs") || "[]"));
  }, [authed]);

  const login = () => {
    if (pass === PASS) { setAuthed(true); setErr(false); }
    else setErr(true);
  };

  const update = (id: number, status: "approved" | "rejected") => {
    const next = regs.map((r) => r.id === id ? { ...r, status } : r);
    setRegs(next);
    localStorage.setItem("gc_regs", JSON.stringify(next));
    if (sel?.id === id) setSel({ ...sel, status });
  };

  const list = regs
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) => !search || r.bName?.toLowerCase().includes(search.toLowerCase()) || r.oName?.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: regs.length,
    pending: regs.filter((r) => r.status === "pending").length,
    approved: regs.filter((r) => r.status === "approved").length,
    rejected: regs.filter((r) => r.status === "rejected").length,
  };

  const statusStyle: Record<string, React.CSSProperties> = {
    pending:  { backgroundColor: "rgba(234,179,8,0.12)",   color: "#ca8a04" },
    approved: { backgroundColor: "rgba(22,163,74,0.12)",   color: "#16a34a" },
    rejected: { backgroundColor: "rgba(220,38,38,0.12)",   color: "#dc2626" },
  };

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #041A0C, #1B4332)" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center gold-gradient shadow-xl">
            <Lock size={26} color="#1B4332" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white font-display">Admin Panel</h1>
          <p className="text-xs font-hindi mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>पंचायत प्रशासन पैनल</p>
        </div>
        <div className="glass-dark rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-white/70 block mb-2">Admin Password</label>
            <input type="password" placeholder="Enter password" value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="input"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                color: "white",
                borderColor: err ? "#dc2626" : "rgba(255,255,255,0.12)",
              }} />
            {err && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle size={11} /> Incorrect password</p>}
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={login}
            className="w-full py-3.5 rounded-xl font-semibold text-sm gold-gradient"
            style={{ color: "#1B4332" }}>
            Login to Admin Panel
          </motion.button>
          <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Demo: dehrian2025</p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      {/* Admin header */}
      <div className="relative py-14 sm:py-16 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #041A0C, #1B4332)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center gold-gradient">
                <Shield size={16} color="#1B4332" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-display">Admin Dashboard</h1>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Dehrian Panchayat — Verification Panel</p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setAuthed(false)}
              className="px-4 py-2 rounded-xl text-sm glass-dark text-white/60 hover:text-white transition-colors">
              Logout
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { k: "all" as const, l: "Total", icon: Store, col: "#E8B84B" },
              { k: "pending" as const, l: "Pending", icon: Clock, col: "#fbbf24" },
              { k: "approved" as const, l: "Approved", icon: CheckCircle2, col: "#4ade80" },
              { k: "rejected" as const, l: "Rejected", icon: XCircle, col: "#f87171" },
            ].map((s) => (
              <motion.div key={s.k} whileTap={{ scale: 0.97 }}
                className="glass-dark rounded-2xl p-3 sm:p-4 text-center cursor-pointer"
                style={filter === s.k ? { boxShadow: "0 0 0 2px rgba(201,146,42,0.4)" } : {}}
                onClick={() => setFilter(s.k)}>
                <s.icon size={16} className="mx-auto mb-1" style={{ color: s.col }} />
                <p className="text-xl sm:text-2xl font-bold text-white">{counts[s.k]}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.l}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-20">
        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="-mt-4 mb-5 card p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["pending","all","approved","rejected"] as const).map((f) => (
              <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  background: filter === f ? "linear-gradient(135deg, var(--green), var(--green-mid))" : "var(--bg-alt, var(--bg))",
                  color: filter === f ? "white" : "var(--text-2)",
                  border: `1px solid ${filter === f ? "transparent" : "var(--border)"}`,
                }}>
                {f} ({counts[f]})
              </motion.button>
            ))}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
            <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input pl-8 text-sm py-2.5" style={{ width: "180px" }} />
          </div>
        </motion.div>

        {regs.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-3)" }}>
            <Users size={48} className="mx-auto mb-4 opacity-25" />
            <p className="font-medium" style={{ color: "var(--text-2)" }}>No registrations yet</p>
            <p className="text-sm">Registrations from the Registration page appear here</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* List */}
            <div className="lg:col-span-1 space-y-2.5">
              <AnimatePresence>
                {list.map((r, i) => (
                  <motion.button key={r.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSel(r)}
                    className="w-full text-left card p-4 transition-all"
                    style={sel?.id === r.id ? { boxShadow: "0 0 0 2px var(--green-mid)" } : {}}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>{r.bName || "Unnamed"}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                        style={statusStyle[r.status]}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>{r.category}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Owner: {r.oName}</p>
                  </motion.button>
                ))}
              </AnimatePresence>
              {list.length === 0 && (
                <p className="text-center text-sm py-8" style={{ color: "var(--text-3)" }}>No results</p>
              )}
            </div>

            {/* Detail */}
            <div className="lg:col-span-2">
              {sel ? (
                <motion.div key={sel.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="card p-5 sm:p-6 sticky top-24">
                  <div className="flex items-start justify-between mb-5 gap-3">
                    <div>
                      <h2 className="text-xl font-bold font-display" style={{ color: "var(--text)" }}>{sel.bName}</h2>
                      <p className="text-sm" style={{ color: "var(--text-3)" }}>{sel.category}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={statusStyle[sel.status]}>
                      {sel.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-5">
                    {[
                      ["Business Address", sel.address], ["Phone", sel.phone], ["Timing", sel.timing || "—"],
                      ["Owner", sel.oName], ["Owner Phone", sel.oPhone], ["Email", sel.email || "—"],
                      ["Aadhaar (masked)", "XXXX XXXX " + sel.aadhaar?.slice(-4)],
                      ["Submitted", new Date(sel.at).toLocaleString("en-IN")],
                    ].map(([k, v]) => v && (
                      <div key={k} className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-alt, var(--bg))" }}>
                        <p className="text-xs mb-0.5" style={{ color: "var(--text-3)" }}>{k}</p>
                        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {sel.desc && (
                    <div className="rounded-xl p-3 mb-5" style={{ backgroundColor: "var(--gold-pale)" }}>
                      <p className="text-xs mb-1" style={{ color: "var(--text-3)" }}>Description</p>
                      <p className="text-sm" style={{ color: "var(--text-2)" }}>{sel.desc}</p>
                    </div>
                  )}

                  <div className="rounded-xl p-3 mb-5" style={{ backgroundColor: "var(--bg-alt, var(--bg))" }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>Documents Submitted</p>
                    <div className="flex gap-2 flex-wrap">
                      {["Aadhaar Card", "Residence Proof", "Character Certificate"].map((d) => (
                        <span key={d} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                          style={{ backgroundColor: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
                          <Check size={11} /> {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {sel.status === "pending" && (
                    <div className="flex gap-3">
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => update(sel.id, "approved")}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white green-gradient">
                        <CheckCircle2 size={15} /> Approve & Verify
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => update(sel.id, "rejected")}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: "#dc2626" }}>
                        <XCircle size={15} /> Reject
                      </motion.button>
                    </div>
                  )}
                  {sel.status === "approved" && (
                    <div className="flex items-center gap-2 p-4 rounded-xl" style={{ backgroundColor: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
                      <CheckCircle2 size={16} />
                      <span className="text-sm font-semibold">Verified — listed with Panchayat Verified badge</span>
                    </div>
                  )}
                  {sel.status === "rejected" && (
                    <div className="flex items-center gap-2 p-4 rounded-xl" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#dc2626" }}>
                      <XCircle size={16} />
                      <span className="text-sm font-semibold">Registration rejected</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-64 card" style={{ color: "var(--text-3)" }}>
                  <div className="text-center">
                    <Eye size={32} className="mx-auto mb-3 opacity-25" />
                    <p>Select a registration to review</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
