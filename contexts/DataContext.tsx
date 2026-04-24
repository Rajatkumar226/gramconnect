"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  collection, doc, onSnapshot, setDoc, writeBatch, getDoc, getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import rawBusinesses from "@/data/businesses.json";
import rawHealth from "@/data/health.json";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Notice         = { id: string; title: string; body: string; date: string; urgent: boolean };
export type Business       = { id: string; name: string; nameHi: string; category: string; owner: string; phone: string; address: string; timing: string; description: string; rating: number; verified: boolean };
export type Registration   = { id: string; bName: string; bNameHi: string; category: string; address: string; phone: string; timing: string; desc: string; oName: string; oPhone: string; aadhaar: string; email: string; status: "pending"|"approved"|"rejected"; at: string; reviewNote?: string };
export type Hospital       = { id: string; name: string; type: string; address: string; phone: string; emergency: string; timing: string; services: string[]; distance: string };
export type ASHAWorker     = { id: string; name: string; village: string; phone: string; services: string[] };
export type JanAushadhi    = { id: string; name: string; address: string; timing: string; note: string; phone: string };
export type PanchayatInfo  = { address: string; phone: string; email: string; pradhan: string; secretary: string };
export type PanchayatMember= { id: string; name: string; nameHi: string; designation: string; ward: string; phone: string };
export type VillageStats   = { villagers: string; businesses: string; schemes: string; emergency: string };

type DataCtx = {
  notices: Notice[]; businesses: Business[]; registrations: Registration[];
  hospitals: Hospital[]; ashaWorkers: ASHAWorker[]; janAushadhi: JanAushadhi[];
  panchayatInfo: PanchayatInfo; villageStats: VillageStats; members: PanchayatMember[];
  saveNotices:      (n: Notice[])          => Promise<void>;
  saveBusinesses:   (b: Business[])        => Promise<void>;
  saveRegistrations:(r: Registration[])    => Promise<void>;
  saveHospitals:    (h: Hospital[])        => Promise<void>;
  saveAshaWorkers:  (a: ASHAWorker[])      => Promise<void>;
  saveJanAushadhi:  (j: JanAushadhi[])     => Promise<void>;
  savePanchayatInfo:(p: PanchayatInfo)     => Promise<void>;
  saveVillageStats: (v: VillageStats)      => Promise<void>;
  saveMembers:      (m: PanchayatMember[]) => Promise<void>;
  approveRegistration: (id: string, note?: string) => Promise<void>;
  rejectRegistration:  (id: string, note?: string) => Promise<void>;
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

const seedMembers: PanchayatMember[] = [
  { id:"m1", name:"(Pradhan Name)",    nameHi:"(प्रधान नाम)",   designation:"Gram Pradhan", ward:"",      phone:"" },
  { id:"m2", name:"(Up-Pradhan Name)", nameHi:"(उप-प्रधान नाम)",designation:"Up-Pradhan",   ward:"",      phone:"" },
  { id:"m3", name:"(Secretary Name)",  nameHi:"(सचिव नाम)",     designation:"Gram Sachiv",  ward:"",      phone:"" },
  { id:"m4", name:"(Gram Sewak Name)", nameHi:"(ग्राम सेवक)",   designation:"Gram Sewak",   ward:"",      phone:"" },
  { id:"m5", name:"(Ward Panch)",      nameHi:"",               designation:"Ward Panch",   ward:"Ward 1",phone:"" },
  { id:"m6", name:"(Ward Panch)",      nameHi:"",               designation:"Ward Panch",   ward:"Ward 2",phone:"" },
  { id:"m7", name:"(Ward Panch)",      nameHi:"",               designation:"Ward Panch",   ward:"Ward 3",phone:"" },
  { id:"m8", name:"(Ward Panch)",      nameHi:"",               designation:"Ward Panch",   ward:"Ward 4",phone:"" },
  { id:"m9", name:"(Ward Panch)",      nameHi:"",               designation:"Ward Panch",   ward:"Ward 5",phone:"" },
];

// ── Firestore helpers ─────────────────────────────────────────────────────────

// Write all docs in an array to a collection, deleting any docs whose id
// is in oldIds but not in the new array.
async function syncCollection<T extends { id: string }>(
  colName: string, newItems: T[], oldItems: T[]
) {
  const batch = writeBatch(db);
  const newIds = new Set(newItems.map((x) => x.id));
  oldItems.forEach((x) => { if (!newIds.has(x.id)) batch.delete(doc(db, colName, x.id)); });
  newItems.forEach((x) => batch.set(doc(db, colName, x.id), x));
  await batch.commit();
}

// Seed Firestore on first run (checks notices collection as sentinel)
async function seedIfEmpty() {
  const snap = await getDocs(collection(db, "notices"));
  if (!snap.empty) return;

  const batch = writeBatch(db);
  seedNotices.forEach((n) => batch.set(doc(db, "notices",      n.id), n));
  seedBusinesses.forEach((b) => batch.set(doc(db, "businesses", b.id), b));
  seedHospitals.forEach((h) => batch.set(doc(db, "hospitals",   h.id), h));
  seedAshaWorkers.forEach((a) => batch.set(doc(db, "ashaWorkers",a.id), a));
  seedJanAushadhi.forEach((j) => batch.set(doc(db, "janAushadhi",j.id), j));
  seedMembers.forEach((m) => batch.set(doc(db, "members",       m.id), m));
  batch.set(doc(db, "config", "panchayatInfo"), seedPanchayatInfo);
  batch.set(doc(db, "config", "villageStats"),  seedVillageStats);
  await batch.commit();
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
  const [members,       setMembers]       = useState<PanchayatMember[]>(seedMembers);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;
    const unsubs: (() => void)[] = [];

    const init = async () => {
      await seedIfEmpty();
      if (!mounted) return;

      unsubs.push(
        onSnapshot(collection(db, "notices"),
          (s) => setNotices(s.docs.map((d) => d.data() as Notice))),

        onSnapshot(collection(db, "businesses"),
          (s) => setBusinesses(s.docs.map((d) => d.data() as Business))),

        onSnapshot(collection(db, "registrations"),
          (s) => setRegistrations(s.docs.map((d) => ({ ...d.data(), id: d.id } as Registration)))),

        onSnapshot(collection(db, "hospitals"),
          (s) => setHospitals(s.docs.map((d) => d.data() as Hospital))),

        onSnapshot(collection(db, "ashaWorkers"),
          (s) => setAshaWorkers(s.docs.map((d) => d.data() as ASHAWorker))),

        onSnapshot(collection(db, "janAushadhi"),
          (s) => setJanAushadhi(s.docs.map((d) => d.data() as JanAushadhi))),

        onSnapshot(collection(db, "members"),
          (s) => setMembers(s.docs.map((d) => d.data() as PanchayatMember))),

        onSnapshot(doc(db, "config", "panchayatInfo"),
          (d) => { if (d.exists()) setPanchayatInfo(d.data() as PanchayatInfo); }),

        onSnapshot(doc(db, "config", "villageStats"),
          (d) => { if (d.exists()) setVillageStats(d.data() as VillageStats); }),
      );
    };

    init();
    return () => { mounted = false; unsubs.forEach((u) => u()); };
  }, []);

  // ── Write helpers (keep same API surface) ──

  const saveNotices = useCallback(async (n: Notice[]) => {
    await syncCollection("notices", n, notices);
  }, [notices]);

  const saveBusinesses = useCallback(async (b: Business[]) => {
    await syncCollection("businesses", b, businesses);
  }, [businesses]);

  const saveRegistrations = useCallback(async (r: Registration[]) => {
    await syncCollection("registrations", r, registrations);
  }, [registrations]);

  const saveHospitals = useCallback(async (h: Hospital[]) => {
    await syncCollection("hospitals", h, hospitals);
  }, [hospitals]);

  const saveAshaWorkers = useCallback(async (a: ASHAWorker[]) => {
    await syncCollection("ashaWorkers", a, ashaWorkers);
  }, [ashaWorkers]);

  const saveJanAushadhi = useCallback(async (j: JanAushadhi[]) => {
    await syncCollection("janAushadhi", j, janAushadhi);
  }, [janAushadhi]);

  const savePanchayatInfo = useCallback(async (p: PanchayatInfo) => {
    await setDoc(doc(db, "config", "panchayatInfo"), p);
  }, []);

  const saveVillageStats = useCallback(async (v: VillageStats) => {
    await setDoc(doc(db, "config", "villageStats"), v);
  }, []);

  const saveMembers = useCallback(async (m: PanchayatMember[]) => {
    await syncCollection("members", m, members);
  }, [members]);

  const approveRegistration = useCallback(async (id: string, note?: string) => {
    const reg = registrations.find((r) => r.id === id);
    if (!reg) return;
    const newBiz: Business = {
      id, name: reg.bName, nameHi: reg.bNameHi || "", category: reg.category,
      owner: reg.oName, phone: reg.phone, address: reg.address,
      timing: reg.timing || "", description: reg.desc || "",
      rating: 4.0, verified: true,
    };
    const batch = writeBatch(db);
    batch.set(doc(db, "businesses", id), newBiz);
    batch.set(doc(db, "registrations", id), { ...reg, status: "approved", reviewNote: note || "" });
    await batch.commit();
  }, [registrations]);

  const rejectRegistration = useCallback(async (id: string, note?: string) => {
    const reg = registrations.find((r) => r.id === id);
    if (!reg) return;
    await setDoc(doc(db, "registrations", id), { ...reg, status: "rejected", reviewNote: note || "" });
  }, [registrations]);

  return (
    <DataContext.Provider value={{
      notices, businesses, registrations, hospitals, ashaWorkers, janAushadhi,
      panchayatInfo, villageStats, members,
      saveNotices, saveBusinesses, saveRegistrations, saveHospitals,
      saveAshaWorkers, saveJanAushadhi, savePanchayatInfo, saveVillageStats,
      saveMembers, approveRegistration, rejectRegistration,
    }}>
      {children}
    </DataContext.Provider>
  );
}
