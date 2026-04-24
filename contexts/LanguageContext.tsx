"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "hi";

type LangCtx = { lang: Lang; toggleLang: () => void };

const LangContext = createContext<LangCtx>({ lang: "en", toggleLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("gc_lang") as Lang;
    if (saved === "en" || saved === "hi") setLang(saved);
  }, []);

  const toggleLang = () =>
    setLang((l) => {
      const next: Lang = l === "en" ? "hi" : "en";
      localStorage.setItem("gc_lang", next);
      return next;
    });

  return <LangContext.Provider value={{ lang, toggleLang }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }
