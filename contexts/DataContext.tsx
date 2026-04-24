"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import rawBusinesses from "@/data/businesses.json";
import rawHealth from "@/data/health.json";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Notice = { id: string; title: string; body: string; date: string; urgent: boolean; };
export type Business = { id: string; name: string; nameHi: string; category: string; owner: string; phone: string; address: string; timing: string; description: string; rating: number; verified: boolean; };
export type Registration = { id: string; bName: string; bNameHi: string; category: string; address: string; phone: string; timing: string; desc: string; oName: string; oPhone: string; aadhaar: string; email: string; status: "pending" | "approved" | "rejected"; at: string; reviewNote?: string; };
export type Hospital = { id: string; name: string; type: string; address: string; phone: string; emergency: string; timing: string; services: string[]; distance: string; };
export type ASHAWorker = { id: string; name: string; village: string; phone: string; services: string[]; };
export type JanAushadhi = { id: string; name: string; address: string; timing: string; note: string; phone: string; };
export type PanchayatInfo = { address: string; phone: string; email: string; pradhan: string; secretary: string; };
export type VillageStats = { villagers: string; businesses: string; schemes: string; emergency: string; };

type DataCtx = {
  notices: Notice[]; businesses: Business[]; registrations: Registration[];
  hospitals: Hospital[]; ashaWorkers: ASHAWorker[]; janAushadhi: JanAushadhi[];
  panchayatInfo: PanchayatInfo; villageStats: VillageStats;
  saveNotices: (n: Notice[]) => void;
  saveBusinesses: (b: Business[]) => void;
  saveRegistrations: (r: Registration[]) => void;
  saveHospitals: (h: Hospital[]) => void;
  saveAshaWorkers: (a: ASHAWorker[]) => void;
  saveJanAushadhi: (j: JanAushadhi[]) => void;
  savePanchayatInfo: (p: PanchayatInfo) => void;
  saveVillageStats: (v: VillageStats) => void;
  approveRegistration: (id: string, note?: string) => void;
  rejectRegistration: (id: string, note?: string) => void;
};

// ── Seed defaults ─────────────────────────────────────────────────────────────

const seedBusinesses: Business[] = (rawBusinesses as any[]).map((b) => ({
  id: String(b.id), name: b.name, nameHi: b.nameHi || "", category: b.category,
  owner: b.owner || "", phone: b.phone, address: b.address, timing: b.timing,
  description: b.description, rating: b.rating, verified: b.verified,
}));

const seedHospitals: Hospital[] = (rawHealth.hospitals as any[]).map((h) => ({
  id: String(h.id), name: h.name, type: h.type, address: h.address,
  phone: h.phone, emergency: h.emergency || "", timing: h.timing,
  services: h.services, distance: h.distance || "",
}));

const seedAshaWorkers: ASHAWorker[] = (rawHealth.ashaWorkers as any[]).map((a) => ({
  id: String(a.id), name: a.name, village: a.village, phone: a.phone, services: a.services,
}));

const seedJanAushadhi: JanAushadhi[] = (rawHealth.janAushadhi as any[]).map((j) => ({
  id: String(j.id), name: j.name, address: j.address, timing: j.timing,
  note: j.note, phone: (j as any).phone || "",
}));

const seedNotices: Notice[] = [
  { id: "1", title: "PM-KISAN 17th Installment Released", body: "The 17th installment of PM-KISAN has been credited to eligible farmers. Check your bank account.", date: "Apr 20, 2025", urgent: false },
  { id: "2", title: "Vaccination Camp — Dehrian PHC", body: "Free vaccination camp on Apr 28 at PHC Dehrian. Bring Aadhaar + immunization card.", date: "Apr 19, 2025", urgent: false },
  { id: "3", title: "Gram Sabha Meeting", body: "Monthly gram sabha on Apr 30, 10AM at Panchayat Ghar. All residents invited.", date: "Apr 18, 2025", urgent: true },
];

const seedPanchayatInfo: PanchayatInfo = {
  address: "GP Dehrian, Jawalamukhi, Kangra, HP — 176031",
  phone: "", email: "panchayat.dehrian@hp.gov.in", pradhan: "", secretary: "",
};

const seedVillageStats: VillageStats = { villagers: "847", businesses: "32+", schemes: "16+", emergency: "6" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  return v ? (JSON.parse(v) as T) : fallback;
}

function persist<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Context ───────────────────────────────────────────────────────────────────

const DataContext = createContext<DataCtx>({} as DataCtx);
export const useData = () => useContext(DataContext);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [notices,       setNotices]       = useState<Notice[]>(seedNotices);
  const [businesses,    setBusinesses]    = useState<Business[]>(seedBusinesses);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [hospitals,     setHospitals]     = useState<Hospital[]>(seedHospitals);
  const [ashaWorkers,   setAshaWorkers]   = useState<ASHAWorker[]>(seedAshaWorkers);
  const [janAushadhi,   setJanAushadhi]   = useState<JanAushadhi[]>(seedJanAushadhi);
  const [panchayatInfo, setPanchayatInfo] = useState<PanchayatInfo>(seedPanchayatInfo);
  const [villageStats,  setVillageStats]  = useState<VillageStats>(seedVillageStats);

  useEffect(() => {
    setNotices(load("gc_notices", seedNotices));
    setBusinesses(load("gc_businesses", seedBusinesses));
    // Normalise legacy numeric ids from register page
    const rawRegs = load<any[]>("gc_regs", []);
    setRegistrations(rawRegs.map((r) => ({ ...r, id: String(r.id) })));
    setHospitals(load("gc_hospitals", seedHospitals));
    setAshaWorkers(load("gc_asha", seedAshaWorkers));
    setJanAushadhi(load("gc_jan", seedJanAushadhi));
    setPanchayatInfo(load("gc_info", seedPanchayatInfo));
    setVillageStats(load("gc_stats", seedVillageStats));
  }, []);

  const saveNotices       = useCallback((n: Notice[])       => { setNotices(n);       persist("gc_notices",   n); }, []);
  const saveBusinesses    = useCallback((b: Business[])     => { setBusinesses(b);    persist("gc_businesses",b); }, []);
  const saveRegistrations = useCallback((r: Registration[]) => { setRegistrations(r); persist("gc_regs",      r); }, []);
  const saveHospitals     = useCallback((h: Hospital[])     => { setHospitals(h);     persist("gc_hospitals", h); }, []);
  const saveAshaWorkers   = useCallback((a: ASHAWorker[])   => { setAshaWorkers(a);   persist("gc_asha",      a); }, []);
  const saveJanAushadhi   = useCallback((j: JanAushadhi[])  => { setJanAushadhi(j);   persist("gc_jan",       j); }, []);
  const savePanchayatInfo = useCallback((p: PanchayatInfo)  => { setPanchayatInfo(p); persist("gc_info",      p); }, []);
  const saveVillageStats  = useCallback((v: VillageStats)   => { setVillageStats(v);  persist("gc_stats",     v); }, []);

  const approveRegistration = useCallback((id: string, note?: string) => {
    setRegistrations((prev) => {
      const reg = prev.find((r) => r.id === id);
      if (!reg) return prev;
      const newBiz: Business = {
        id, name: reg.bName, nameHi: reg.bNameHi || "", category: reg.category,
        owner: reg.oName, phone: reg.phone, address: reg.address,
        timing: reg.timing || "", description: reg.desc || "",
        rating: 4.0, verified: true,
      };
      setBusinesses((b) => { const u = [...b, newBiz]; persist("gc_businesses", u); return u; });
      const updated = prev.map((r) => r.id === id ? { ...r, status: "approved" as const, reviewNote: note } : r);
      persist("gc_regs", updated);
      return updated;
    });
  }, []);

  const rejectRegistration = useCallback((id: string, note?: string) => {
    setRegistrations((prev) => {
      const updated = prev.map((r) => r.id === id ? { ...r, status: "rejected" as const, reviewNote: note } : r);
      persist("gc_regs", updated);
      return updated;
    });
  }, []);

  return (
    <DataContext.Provider value={{
      notices, businesses, registrations, hospitals, ashaWorkers, janAushadhi,
      panchayatInfo, villageStats,
      saveNotices, saveBusinesses, saveRegistrations, saveHospitals,
      saveAshaWorkers, saveJanAushadhi, savePanchayatInfo, saveVillageStats,
      approveRegistration, rejectRegistration,
    }}>
      {children}
    </DataContext.Provider>
  );
}
