"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Leaf, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/", label: "Home",      hi: "होम" },
  { href: "/yojnaen", label: "Yojnaen", hi: "योजनाएँ" },
  { href: "/health",  label: "Health",  hi: "स्वास्थ्य" },
  { href: "/emergency", label: "Emergency", hi: "आपातकाल" },
  { href: "/directory", label: "Directory", hi: "डायरेक्टरी" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const navBg = scrolled
    ? "backdrop-blur-xl shadow-2xl shadow-black/20"
    : "";

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
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)" }}
            >
              <Leaf size={17} color="#1B4332" strokeWidth={2.5} />
            </motion.div>
            <div className="leading-none">
              <p className="text-white font-bold text-lg tracking-tight font-display">GramConnect</p>
              <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--sage)" }}>
                Dehrian Panchayat
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex flex-col items-center gap-0.5"
                  style={{
                    backgroundColor: active ? "rgba(201,146,42,0.15)" : "transparent",
                    color: active ? "#E8B84B" : "rgba(255,255,255,0.72)",
                  }}
                  onMouseEnter={(e) => { if (!active) (e.target as HTMLElement).style.color = "white"; }}
                  onMouseLeave={(e) => { if (!active) (e.target as HTMLElement).style.color = "rgba(255,255,255,0.72)"; }}
                >
                  <span>{l.label}</span>
                  <span className="text-[9px] opacity-50 font-hindi">{l.hi}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              onClick={toggle}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Register CTA — desktop */}
            <Link href="/register"
              className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}
            >
              Register
            </Link>

            {/* Hamburger */}
            <motion.button
              onClick={() => setOpen((p) => !p)}
              whileTap={{ scale: 0.9 }}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
              aria-label="Menu"
            >
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
                {links.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={l.href}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all"
                      style={{
                        backgroundColor: pathname === l.href ? "rgba(201,146,42,0.12)" : "transparent",
                        color: pathname === l.href ? "#E8B84B" : "rgba(255,255,255,0.75)",
                      }}
                    >
                      <span className="font-medium">{l.label}</span>
                      <span className="text-xs opacity-45 font-hindi">{l.hi}</span>
                    </Link>
                  </motion.div>
                ))}
                <Link href="/register"
                  className="mt-2 flex items-center justify-center py-3.5 rounded-xl font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}
                >
                  Register Your Business
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
