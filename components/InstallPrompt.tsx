"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Share2, ArrowDown } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Hide only if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setShow(false));

    // Always show after 2 seconds
    const t = setTimeout(() => setShow(true), 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(t);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShow(false);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {/* Floating install button — bottom right */}
      <AnimatePresence>
        {show && !showGuide && (
          <motion.div
            key="fab"
            initial={{ scale: 0, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 18, stiffness: 260 }}
            className="fixed bottom-24 right-4 z-40 md:bottom-8 flex flex-col items-center gap-1.5"
          >
            {/* Main FAB */}
            <motion.button
              onClick={handleInstall}
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
              className="flex flex-col items-center gap-1.5 rounded-2xl px-3.5 py-3 shadow-2xl"
              style={{
                background: "linear-gradient(160deg, #0C2E1A 0%, #1B4332 100%)",
                border: "1.5px solid rgba(201,146,42,0.4)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,146,42,0.12)",
                minWidth: 76,
              }}
            >
              {/* App icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)" }}
              >
                <Leaf size={24} color="#1B4332" strokeWidth={2.5} />
              </div>

              {/* Label */}
              <div className="text-center">
                <p className="text-[10px] font-bold text-white leading-tight">Install App</p>
                <p className="text-[9px] font-hindi leading-tight" style={{ color: "rgba(255,255,255,0.55)" }}>ऐप इन्स्टॉल</p>
              </div>

              {/* Arrow indicator */}
              <ArrowDown size={10} style={{ color: "rgba(201,146,42,0.7)" }} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide sheet — how to install on iOS / other browsers */}
      <AnimatePresence>
        {showGuide && (
          <>
            <motion.div
              key="guide-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowGuide(false)}
            />
            <motion.div
              key="guide-sheet"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-3xl p-6"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: "var(--border)" }} />

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)" }}>
                  <Leaf size={22} color="#1B4332" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-bold text-lg font-display" style={{ color: "var(--text)" }}>Add to Home Screen</p>
                  <p className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>होम स्क्रीन पर जोड़ें</p>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-3 mb-6">
                  {[
                    { step: "1", icon: <Share2 size={16} />, text: "Tap the Share button at the bottom of Safari", hi: "Safari में नीचे Share बटन दबाएँ" },
                    { step: "2", icon: "➕", text: "Scroll down and tap \"Add to Home Screen\"", hi: "\"Add to Home Screen\" पर टैप करें" },
                    { step: "3", icon: "✅", text: "Tap \"Add\" — GramConnect appears on your home screen!", hi: "\"Add\" दबाएँ — आइकन होम स्क्रीन पर आ जाएगा" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-alt, var(--bg))" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
                        style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
                        {s.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{s.text}</p>
                        <p className="text-xs font-hindi mt-0.5" style={{ color: "var(--text-3)" }}>{s.hi}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {[
                    { step: "1", text: "Open the browser menu (⋮ or ···)", hi: "ब्राउज़र मेनू खोलें (⋮ या ···)" },
                    { step: "2", text: "Tap \"Install app\" or \"Add to Home Screen\"", hi: "\"Install app\" या \"Add to Home Screen\" दबाएँ" },
                    { step: "3", text: "GramConnect will be added like a native app!", hi: "GramConnect आपकी होम स्क्रीन पर आ जाएगा!" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-alt, var(--bg))" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)", color: "#1B4332" }}>
                        {s.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{s.text}</p>
                        <p className="text-xs font-hindi mt-0.5" style={{ color: "var(--text-3)" }}>{s.hi}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setShowGuide(false)}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: "linear-gradient(135deg, var(--green), var(--green-mid))" }}>
                Got it! / समझ गया
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
