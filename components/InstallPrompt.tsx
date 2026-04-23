"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Leaf } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("gc_installed") === "1") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      localStorage.setItem("gc_installed", "1");
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      localStorage.setItem("gc_installed", "1");
    }
    setShow(false);
  };

  if (installed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 18, stiffness: 280 }}
          className="fixed bottom-24 right-4 z-40 md:bottom-8"
        >
          {/* Dismiss */}
          <button
            onClick={() => setShow(false)}
            className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--text-3)", color: "var(--bg)" }}
          >
            <X size={10} />
          </button>

          {/* Button */}
          <motion.button
            onClick={install}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #041A0C, #1B4332)",
              border: "1px solid rgba(201,146,42,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,146,42,0.1)",
              minWidth: 80,
            }}
          >
            {/* App icon */}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)" }}>
              <Leaf size={22} color="#1B4332" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-semibold text-white/80 leading-tight text-center whitespace-nowrap">
              Add to<br />Home Screen
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
