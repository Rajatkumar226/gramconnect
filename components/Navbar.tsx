"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Leaf, Sun, Moon, User, LogOut, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { T } from "@/data/translations";
import { AnimatePresence, motion } from "framer-motion";

const linkDefs = [
  { href: "/",           key: "home"      as const },
  { href: "/yojnaen",    key: "yojnaen"   as const },
  { href: "/health",     key: "health"    as const },
  { href: "/emergency",  key: "emergency" as const },
  { href: "/directory",  key: "directory" as const },
  { href: "/panchayat",  key: "panchayat" as const },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, requireAuth, logout } = useAuth();
  const { lang, toggleLang } = useLang();
  const tx = T[lang].nav;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  const navBg = scrolled ? "backdrop-blur-xl shadow-2xl shadow-black/20" : "";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
        style={{
          backgroundColor: scrolled ? "var(--nav-bg)" : "transparent",
          paddingTop: scrolled ? "10px" : "20px",
          paddingBottom: scrolled ? "10px" : "20px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)" }}>
              <Leaf size={17} color="#1B4332" strokeWidth={2.5} />
            </motion.div>
            <div className="leading-none">
              <p className="text-white font-bold text-lg tracking-tight font-display">GramConnect</p>
              <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--sage)" }}>Dehrian Panchayat</p>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {linkDefs.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex flex-col items-center gap-0.5"
                  style={{ backgroundColor: active ? "rgba(201,146,42,0.15)" : "transparent", color: active ? "#E8B84B" : "rgba(255,255,255,0.72)" }}
                  onMouseEnter={(e) => { if (!active) (e.target as HTMLElement).style.color = "white"; }}
                  onMouseLeave={(e) => { if (!active) (e.target as HTMLElement).style.color = "rgba(255,255,255,0.72)"; }}
                >
                  <span>{tx[l.key]}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <motion.button onClick={toggleLang} whileTap={{ scale: 0.9 }}
              className="h-9 px-3 rounded-xl flex items-center justify-center text-xs font-bold transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", minWidth: 44 }}
              aria-label="Toggle language">
              <AnimatePresence mode="wait">
                <motion.span key={lang}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="font-hindi">
                  {lang === "en" ? "हिं" : "EN"}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Theme toggle */}
            <motion.button onClick={toggle} whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
              aria-label="Toggle theme">
              <AnimatePresence mode="wait">
                <motion.span key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}>
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Desktop: Login / User chip */}
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div key="user-chip"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold max-w-[80px] truncate" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {user.name.split(" ")[0]}
                  </span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={logout}
                    className="ml-1" title="Logout">
                    <LogOut size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button key="login-btn"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => requireAuth(T[lang].login.message)}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{ border: "1px solid rgba(255,255,255,0.25)", color: "white", backgroundColor: "rgba(255,255,255,0.08)" }}>
                  <User size={14} /> {tx.login}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Desktop Register CTA */}
            <Link href="/register"
              className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
              {tx.register}
            </Link>

            {/* Hamburger */}
            <motion.button onClick={() => setOpen((p) => !p)} whileTap={{ scale: 0.9 }}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
              aria-label="Menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden overflow-hidden"
              style={{ backgroundColor: "var(--nav-bg)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {linkDefs.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={l.href}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all"
                      style={{ backgroundColor: pathname === l.href ? "rgba(201,146,42,0.12)" : "transparent", color: pathname === l.href ? "#E8B84B" : "rgba(255,255,255,0.75)" }}>
                      <span className="font-medium">{tx[l.key]}</span>
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-2 flex flex-col gap-2">
                  <Link href="/admin" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Shield size={14} style={{ color: "#E8B84B" }} />
                    <span>Admin Panel</span>
                    <span className="ml-auto text-xs font-hindi" style={{ color: "rgba(255,255,255,0.3)" }}>पंचायत</span>
                  </Link>

                  {user ? (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                          {user.name.split(" ")[0]}
                        </span>
                      </div>
                      <button onClick={logout} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                        style={{ color: "rgba(255,255,255,0.45)", backgroundColor: "rgba(255,255,255,0.06)" }}>
                        <LogOut size={12} /> {tx.logout}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setOpen(false); requireAuth(T[lang].login.message); }}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white"
                      style={{ border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.08)" }}>
                      <User size={15} /> {tx.loginMobile}
                    </button>
                  )}

                  <Link href="/register"
                    className="flex items-center justify-center py-3.5 rounded-xl font-semibold text-sm"
                    style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
                    {tx.registerBusiness}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
