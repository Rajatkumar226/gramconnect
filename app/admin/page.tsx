"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ClipboardList, Store, HeartPulse, Megaphone,
  Settings, LogOut, Lock, Menu, X, Shield, CheckCircle2, XCircle,
  Clock, Eye, Search, Plus, Pencil, Trash2, Check, AlertTriangle,
  Phone, MapPin, Star, ChevronRight, RefreshCw, Users, Bell,
  Building2, UserCheck, Pill, Info, Save, ArrowLeft,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import type {
  Notice, Business, Registration, Hospital, ASHAWorker, JanAushadhi,
  PanchayatInfo, VillageStats, PanchayatMember,
} from "@/contexts/DataContext";

// ── Constants ──────────────────────────────────────────────────────────────────

const ADMIN_PASS_KEY = "gc_admin_pass";
const DEFAULT_PASS = "dehrian2025";
const BIZ_CATS = ["Grocery & Kirana","Medical & Pharmacy","Dairy & Milk","Hardware & Electronics","Food & Restaurant","Tailoring & Clothing","Mobile & Repair","Agriculture & Nursery","Automobile & Repair","Education & Coaching","Beauty & Salon","Other"];
const HOSP_TYPES = ["Government Hospital","PHC","Zonal Hospital","Medical College Hospital","Private Hospital","Clinic"];
const CAT_ICONS: Record<string,string> = { "Grocery & Kirana":"🛒","Medical & Pharmacy":"💊","Dairy & Milk":"🥛","Hardware & Electronics":"🔧","Food & Restaurant":"🍽️","Tailoring & Clothing":"🧵","Mobile & Repair":"📱","Agriculture & Nursery":"🌱","Automobile & Repair":"🚗","Education & Coaching":"📚","Beauty & Salon":"💇","Other":"🏪" };

type Tab = "overview"|"registrations"|"businesses"|"health"|"notices"|"members"|"settings";
type HealthTab = "hospitals"|"asha"|"jan";

// ── Helpers ────────────────────────────────────────────────────────────────────

function uid() { return Date.now().toString(); }

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string,React.CSSProperties> = {
    pending:  { backgroundColor:"rgba(234,179,8,0.12)",  color:"#ca8a04" },
    approved: { backgroundColor:"rgba(22,163,74,0.12)",  color:"#16a34a" },
    rejected: { backgroundColor:"rgba(220,38,38,0.12)",  color:"#dc2626" },
  };
  const icons: Record<string, React.ReactNode> = {
    pending:  <Clock size={10}/>,
    approved: <CheckCircle2 size={10}/>,
    rejected: <XCircle size={10}/>,
  };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
      style={styles[status]||{}}>
      {icons[status]} {status}
    </span>
  );
}

// ── Shared form field ──────────────────────────────────────────────────────────

function FField({ label, value, onChange, type="text", ph="", req=false, as: As="input", rows=3 }:
  { label:string; value:string; onChange:(v:string)=>void; type?:string; ph?:string; req?:boolean; as?:"input"|"textarea"; rows?:number }) {
  const cls = "w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-offset-0";
  const style = { backgroundColor:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", "--tw-ring-color":"rgba(45,106,79,0.3)" } as React.CSSProperties;
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text-2)"}}>
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {As === "textarea"
        ? <textarea className={cls} style={{...style,resize:"none"}} rows={rows} placeholder={ph} value={value} onChange={(e)=>onChange(e.target.value)}/>
        : <input type={type} className={cls} style={style} placeholder={ph} value={value} onChange={(e)=>onChange(e.target.value)}/>
      }
    </div>
  );
}

// ── Modal wrapper ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide=false }: { title:string; onClose:()=>void; children:React.ReactNode; wide?:boolean }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:"rgba(0,0,0,0.5)"}}>
        <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.95}} transition={{duration:0.2}}
          className={`w-full ${wide?"max-w-2xl":"max-w-lg"} max-h-[90vh] overflow-y-auto rounded-2xl`}
          style={{backgroundColor:"var(--bg)",boxShadow:"0 25px 50px rgba(0,0,0,0.35)"}}>
          <div className="flex items-center justify-between p-5 border-b" style={{borderColor:"var(--border)"}}>
            <h3 className="font-bold text-base" style={{color:"var(--text)"}}>{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{color:"var(--text-3)"}}>
              <X size={16}/>
            </button>
          </div>
          <div className="p-5">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Preview: Business Card ─────────────────────────────────────────────────────

function BizPreviewCard({ b }: { b: Partial<Business> }) {
  return (
    <div className="rounded-2xl p-4 border relative overflow-hidden" style={{backgroundColor:"var(--card,var(--bg))",borderColor:"var(--border)"}}>
      {b.verified && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{background:"linear-gradient(135deg,#1B4332,#2D6A4F)"}}>
          <Shield size={8}/> VERIFIED
        </span>
      )}
      <div className="flex items-start gap-3 pr-20 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{backgroundColor:"rgba(120,53,15,0.1)"}}>
          {CAT_ICONS[b.category||""]||"🏪"}
        </div>
        <div>
          <p className="font-bold text-sm" style={{color:"var(--text)"}}>{b.name||"Business Name"}</p>
          <p className="text-xs mt-0.5" style={{color:"var(--text-3)"}}>{b.nameHi||"—"}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{backgroundColor:"rgba(120,53,15,0.1)",color:"#b45309"}}>{b.category||"Category"}</span>
        </div>
      </div>
      <p className="text-xs mb-2" style={{color:"var(--text-2)"}}>{b.description||"Description"}</p>
      <div className="space-y-1 text-xs mb-3" style={{color:"var(--text-2)"}}>
        <div className="flex gap-2"><MapPin size={11} style={{color:"#b45309",flexShrink:0}}/>{b.address||"Address"}</div>
        <div className="flex gap-2"><Clock size={11} style={{color:"#b45309",flexShrink:0}}/>{b.timing||"Timing"}</div>
      </div>
      <div className="py-2.5 rounded-xl text-xs font-semibold text-white text-center"
        style={{background:"linear-gradient(135deg,#78350f,#b45309)"}}>
        <Phone size={11} className="inline mr-1"/>{b.phone||"Phone"}
      </div>
    </div>
  );
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────

function OverviewSection({ setTab }: { setTab:(t:Tab)=>void }) {
  const { registrations, businesses, notices } = useData();
  const pending = registrations.filter(r=>r.status==="pending").length;
  const approved = registrations.filter(r=>r.status==="approved").length;

  const stats = [
    { label:"Pending Reviews", value:pending,             icon:Clock,        col:"#f59e0b", bg:"rgba(245,158,11,0.1)",  tab:"registrations" as Tab },
    { label:"Total Businesses",value:businesses.length,   icon:Store,        col:"#3b82f6", bg:"rgba(59,130,246,0.1)", tab:"businesses" as Tab },
    { label:"Active Notices",  value:notices.length,      icon:Megaphone,    col:"#8b5cf6", bg:"rgba(139,92,246,0.1)", tab:"notices" as Tab },
    { label:"Approved",        value:approved,            icon:CheckCircle2, col:"#10b981", bg:"rgba(16,185,129,0.1)", tab:"registrations" as Tab },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s,i)=>(
          <motion.button key={s.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
            onClick={()=>setTab(s.tab)}
            className="card p-5 text-left hover:shadow-lg transition-shadow group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
              style={{backgroundColor:s.bg}}>
              <s.icon size={18} style={{color:s.col}}/>
            </div>
            <p className="text-2xl font-bold font-display" style={{color:"var(--text)"}}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{color:"var(--text-3)"}}>{s.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Recent registrations */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{color:"var(--text)"}}>Recent Registrations</h3>
          <button onClick={()=>setTab("registrations")}
            className="text-xs font-semibold flex items-center gap-1" style={{color:"var(--green-mid)"}}>
            View all <ChevronRight size={13}/>
          </button>
        </div>
        {registrations.length === 0 ? (
          <div className="text-center py-8" style={{color:"var(--text-3)"}}>
            <Users size={32} className="mx-auto mb-2 opacity-25"/>
            <p className="text-sm">No registrations yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {registrations.slice(-5).reverse().map((r)=>(
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{backgroundColor:"var(--bg-alt,var(--bg))"}}>
                <div>
                  <p className="text-sm font-semibold" style={{color:"var(--text)"}}>{r.bName}</p>
                  <p className="text-xs" style={{color:"var(--text-3)"}}>{r.oName} · {r.category}</p>
                </div>
                <StatusBadge status={r.status}/>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="card p-5">
        <h3 className="font-bold mb-4" style={{color:"var(--text)"}}>Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label:"Add Business",  icon:Store,     tab:"businesses"    as Tab, col:"#3b82f6" },
            { label:"Add Notice",    icon:Megaphone, tab:"notices"       as Tab, col:"#8b5cf6" },
            { label:"Add Hospital",  icon:HeartPulse,tab:"health"        as Tab, col:"#ef4444" },
            { label:"Members",       icon:Users,     tab:"members"       as Tab, col:"#7c3aed" },
            { label:"Pending",       icon:Clock,     tab:"registrations" as Tab, col:"#10b981" },
            { label:"Settings",      icon:Settings,  tab:"settings"      as Tab, col:"#6b7280" },
          ].map((a)=>(
            <motion.button key={a.label} whileTap={{scale:0.96}} onClick={()=>setTab(a.tab)}
              className="flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium transition-all hover:shadow-md"
              style={{backgroundColor:"var(--bg-alt,var(--bg))",color:"var(--text-2)",border:"1px solid var(--border)"}}>
              <a.icon size={15} style={{color:a.col}}/> {a.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── REGISTRATIONS ─────────────────────────────────────────────────────────────

function RegistrationsSection() {
  const { registrations, approveRegistration, rejectRegistration, saveRegistrations } = useData();
  const [filter, setFilter] = useState<"pending"|"approved"|"rejected"|"all">("pending");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<Registration|null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve"|"reject"|null>(null);

  const counts = {
    all: registrations.length,
    pending:  registrations.filter(r=>r.status==="pending").length,
    approved: registrations.filter(r=>r.status==="approved").length,
    rejected: registrations.filter(r=>r.status==="rejected").length,
  };

  const list = registrations
    .filter(r=>filter==="all"||r.status===filter)
    .filter(r=>!search||r.bName?.toLowerCase().includes(search.toLowerCase())||r.oName?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime());

  const confirm = (action: "approve"|"reject") => {
    if (!sel) return;
    if (action === "approve") approveRegistration(sel.id, reviewNote);
    else rejectRegistration(sel.id, reviewNote);
    setSel(prev=>prev?{...prev,status:action==="approve"?"approved":"rejected"}:null);
    setConfirmAction(null);
    setReviewNote("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["pending","all","approved","rejected"] as const).map(f=>(
            <motion.button key={f} whileTap={{scale:0.95}} onClick={()=>setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background:filter===f?"linear-gradient(135deg,var(--green),var(--green-mid))":"var(--bg-alt,var(--bg))",
                color:filter===f?"white":"var(--text-2)",
                border:`1px solid ${filter===f?"transparent":"var(--border)"}`,
              }}>
              {f} ({counts[f]})
            </motion.button>
          ))}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:"var(--text-3)"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            className="pl-8 pr-3 py-2 rounded-xl text-sm border outline-none"
            style={{backgroundColor:"var(--bg)",borderColor:"var(--border)",color:"var(--text)",width:180}}/>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {list.length === 0 && (
            <div className="card text-center py-12" style={{color:"var(--text-3)"}}>
              <ClipboardList size={32} className="mx-auto mb-2 opacity-25"/>
              <p className="text-sm">No registrations</p>
            </div>
          )}
          {list.map((r,i)=>(
            <motion.button key={r.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
              onClick={()=>{setSel(r);setReviewNote(r.reviewNote||"");}}
              className="w-full text-left card p-4 transition-all hover:shadow-md"
              style={sel?.id===r.id?{boxShadow:"0 0 0 2px var(--green-mid)"}:{}}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-sm" style={{color:"var(--text)"}}>{r.bName||"Unnamed"}</p>
                <StatusBadge status={r.status}/>
              </div>
              <p className="text-xs" style={{color:"var(--text-3)"}}>{r.category} · {r.oName}</p>
              <p className="text-xs mt-0.5" style={{color:"var(--text-3)"}}>{new Date(r.at).toLocaleDateString("en-IN")}</p>
            </motion.button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {sel ? (
            <motion.div key={sel.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="card p-5 sticky top-4">
              <div className="flex items-start justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-lg font-bold font-display" style={{color:"var(--text)"}}>{sel.bName}</h3>
                  <p className="text-sm" style={{color:"var(--text-3)"}}>{sel.category}</p>
                </div>
                <StatusBadge status={sel.status}/>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5 mb-4">
                {[
                  ["Business Address",sel.address],["Phone",sel.phone],["Timing",sel.timing||"—"],
                  ["Owner",sel.oName],["Owner Phone",sel.oPhone],["Email",sel.email||"—"],
                  ["Aadhaar (masked)","XXXX XXXX "+sel.aadhaar?.slice(-4)],
                  ["Submitted",new Date(sel.at).toLocaleString("en-IN")],
                ].map(([k,v])=>v&&(
                  <div key={k} className="rounded-xl p-3" style={{backgroundColor:"var(--bg-alt,var(--bg))"}}>
                    <p className="text-[10px] mb-0.5 font-semibold uppercase tracking-wide" style={{color:"var(--text-3)"}}>{k}</p>
                    <p className="text-sm font-medium" style={{color:"var(--text)"}}>{v}</p>
                  </div>
                ))}
              </div>

              {sel.desc && (
                <div className="rounded-xl p-3 mb-4" style={{backgroundColor:"rgba(201,146,42,0.06)",border:"1px solid rgba(201,146,42,0.15)"}}>
                  <p className="text-xs font-semibold mb-1" style={{color:"var(--gold)"}}>Description</p>
                  <p className="text-sm" style={{color:"var(--text-2)"}}>{sel.desc}</p>
                </div>
              )}

              {/* Review note */}
              <div className="mb-4">
                <FField label="Review Note (optional — sent to applicant)" value={reviewNote}
                  onChange={setReviewNote} ph="Add a note for the applicant…" as="textarea" rows={2}/>
              </div>

              {/* Preview button */}
              <motion.button whileTap={{scale:0.97}} onClick={()=>setShowPreview(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold mb-3 border transition-colors"
                style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
                <Eye size={14}/> Preview on Website
              </motion.button>

              {sel.status==="pending" && (
                <div className="flex gap-3">
                  <motion.button whileTap={{scale:0.97}} onClick={()=>setConfirmAction("approve")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white green-gradient">
                    <CheckCircle2 size={14}/> Approve
                  </motion.button>
                  <motion.button whileTap={{scale:0.97}} onClick={()=>setConfirmAction("reject")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{backgroundColor:"#dc2626"}}>
                    <XCircle size={14}/> Reject
                  </motion.button>
                </div>
              )}
              {sel.status!=="pending" && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold`}
                  style={sel.status==="approved"
                    ?{backgroundColor:"rgba(22,163,74,0.1)",color:"#16a34a"}
                    :{backgroundColor:"rgba(220,38,38,0.1)",color:"#dc2626"}}>
                  {sel.status==="approved"?<CheckCircle2 size={15}/>:<XCircle size={15}/>}
                  {sel.status==="approved"?"Verified — listed with Panchayat Verified badge":"Registration rejected"}
                  {sel.reviewNote && <span className="ml-auto text-xs opacity-70">Note: {sel.reviewNote}</span>}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="card flex items-center justify-center h-64" style={{color:"var(--text-3)"}}>
              <div className="text-center">
                <Eye size={32} className="mx-auto mb-3 opacity-25"/>
                <p className="text-sm">Select a registration to review</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && sel && (
        <Modal title="Preview — How it looks on Website" onClose={()=>setShowPreview(false)}>
          <p className="text-xs mb-4" style={{color:"var(--text-3)"}}>This is exactly how the business card will appear in the directory after approval.</p>
          <BizPreviewCard b={{...sel,name:sel.bName,nameHi:sel.bNameHi,owner:sel.oName,verified:true,rating:4.0,description:sel.desc}}/>
          {sel.status==="pending" && (
            <div className="mt-4 flex gap-3">
              <motion.button whileTap={{scale:0.97}} onClick={()=>{setShowPreview(false);setConfirmAction("approve");}}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white green-gradient">
                Looks Good — Approve
              </motion.button>
              <motion.button whileTap={{scale:0.97}} onClick={()=>setShowPreview(false)}
                className="px-5 py-3 rounded-xl text-sm font-semibold border"
                style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
                Go Back
              </motion.button>
            </div>
          )}
        </Modal>
      )}

      {/* Confirm Modal */}
      {confirmAction && sel && (
        <Modal title={confirmAction==="approve"?"Confirm Approval":"Confirm Rejection"} onClose={()=>setConfirmAction(null)}>
          <div className={`p-4 rounded-xl mb-4`}
            style={confirmAction==="approve"
              ?{backgroundColor:"rgba(22,163,74,0.08)",border:"1px solid rgba(22,163,74,0.2)"}
              :{backgroundColor:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.2)"}}>
            <p className="font-semibold mb-1" style={{color:"var(--text)"}}>{sel.bName}</p>
            <p className="text-sm" style={{color:"var(--text-3)"}}>Owner: {sel.oName} · {sel.category}</p>
          </div>
          {confirmAction==="approve" && (
            <p className="text-sm mb-4" style={{color:"var(--text-2)"}}>
              This business will be <strong>listed in the directory with a Panchayat Verified badge</strong>. Please confirm all details are correct.
            </p>
          )}
          {confirmAction==="reject" && (
            <p className="text-sm mb-4" style={{color:"var(--text-2)"}}>
              This application will be <strong>rejected</strong>. The applicant will not be listed in the directory.
            </p>
          )}
          {reviewNote && (
            <div className="p-3 rounded-xl mb-4 text-sm" style={{backgroundColor:"var(--bg-alt,var(--bg))",color:"var(--text-2)"}}>
              <strong>Note to applicant:</strong> {reviewNote}
            </div>
          )}
          <div className="flex gap-3">
            <motion.button whileTap={{scale:0.97}} onClick={()=>confirm(confirmAction)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{background:confirmAction==="approve"?"linear-gradient(135deg,var(--green),var(--green-mid))":"#dc2626"}}>
              {confirmAction==="approve"?"Yes, Approve":"Yes, Reject"}
            </motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>setConfirmAction(null)}
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
              Cancel
            </motion.button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── BUSINESSES ─────────────────────────────────────────────────────────────────

function BusinessesSection() {
  const { businesses, saveBusinesses } = useData();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add"|"edit"|"preview"|null>(null);
  const [editTarget, setEditTarget] = useState<Business|null>(null);
  const [previewTarget, setPreviewTarget] = useState<Business|null>(null);
  const [confirmDel, setConfirmDel] = useState<string|null>(null);
  const emptyForm: Omit<Business,"id"> = { name:"",nameHi:"",category:"",owner:"",phone:"",address:"",timing:"",description:"",rating:4.0,verified:false };
  const [form, setForm] = useState<Omit<Business,"id">>(emptyForm);
  const sf = (k:keyof typeof form) => (v:string|boolean|number) => setForm(p=>({...p,[k]:v}));

  const filtered = businesses.filter(b=>
    !search||b.name.toLowerCase().includes(search.toLowerCase())||b.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setEditTarget(null); setModal("add"); };
  const openEdit = (b:Business) => { setForm({...b}); setEditTarget(b); setModal("edit"); };
  const save = () => {
    if (!form.name||!form.category||!form.phone) return;
    if (editTarget) {
      saveBusinesses(businesses.map(b=>b.id===editTarget.id?{...form,id:editTarget.id}:b));
    } else {
      saveBusinesses([...businesses,{...form,id:uid()}]);
    }
    setModal(null);
  };
  const del = (id:string) => { saveBusinesses(businesses.filter(b=>b.id!==id)); setConfirmDel(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:"var(--text-3)"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search businesses…"
            className="pl-8 pr-3 py-2 rounded-xl text-sm border outline-none"
            style={{backgroundColor:"var(--bg)",borderColor:"var(--border)",color:"var(--text)",width:220}}/>
        </div>
        <motion.button whileTap={{scale:0.97}} onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white green-gradient">
          <Plus size={15}/> Add Business
        </motion.button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b,i)=>(
          <motion.div key={b.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
            className="card p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{backgroundColor:"rgba(120,53,15,0.1)"}}>
                {CAT_ICONS[b.category]||"🏪"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate" style={{color:"var(--text)"}}>{b.name}</p>
                <p className="text-xs" style={{color:"var(--text-3)"}}>{b.category}</p>
              </div>
              {b.verified && <Shield size={13} style={{color:"var(--green-mid)",flexShrink:0}}/>}
            </div>
            <div className="text-xs space-y-1" style={{color:"var(--text-3)"}}>
              <div className="flex gap-1.5"><Phone size={11} style={{flexShrink:0}}/>{b.phone}</div>
              <div className="flex gap-1.5"><MapPin size={11} style={{flexShrink:0}}/>{b.address}</div>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <motion.button whileTap={{scale:0.95}} onClick={()=>{setPreviewTarget(b);setModal("preview");}}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border"
                style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
                <Eye size={11}/> Preview
              </motion.button>
              <motion.button whileTap={{scale:0.95}} onClick={()=>openEdit(b)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border"
                style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
                <Pencil size={11}/> Edit
              </motion.button>
              <motion.button whileTap={{scale:0.95}} onClick={()=>setConfirmDel(b.id)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border"
                style={{borderColor:"rgba(220,38,38,0.3)",color:"#dc2626"}}>
                <Trash2 size={12}/>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(modal==="add"||modal==="edit") && (
        <Modal title={modal==="add"?"Add New Business":"Edit Business"} onClose={()=>setModal(null)} wide>
          <div className="grid sm:grid-cols-2 gap-4">
            <FField label="Business Name" value={form.name} onChange={sf("name")} ph="Sharma General Store" req/>
            <FField label="Hindi Name" value={form.nameHi} onChange={sf("nameHi")} ph="शर्मा जनरल स्टोर"/>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text-2)"}}>Category<span className="text-red-500">*</span></label>
              <select value={form.category} onChange={e=>sf("category")(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{backgroundColor:"var(--bg)",borderColor:"var(--border)",color:"var(--text)"}}>
                <option value="">Select…</option>
                {BIZ_CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <FField label="Owner Name" value={form.owner} onChange={sf("owner")} ph="Ramesh Sharma"/>
            <FField label="Phone" value={form.phone} onChange={sf("phone")} ph="+91 98XXXXXXXX" type="tel" req/>
            <FField label="Address" value={form.address} onChange={sf("address")} ph="Main Market, Dehrian" req/>
            <FField label="Timing" value={form.timing} onChange={sf("timing")} ph="9AM–8PM (Closed Sunday)"/>
            <div className="flex items-center gap-3 pt-4">
              <button onClick={()=>sf("verified")(!form.verified)}
                className="flex items-center gap-2 text-sm font-medium" style={{color:"var(--text)"}}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all`}
                  style={{borderColor:form.verified?"var(--green-mid)":"var(--border)",backgroundColor:form.verified?"var(--green-mid)":"transparent"}}>
                  {form.verified&&<Check size={11} color="white"/>}
                </div>
                Panchayat Verified
              </button>
            </div>
          </div>
          <div className="mt-4">
            <FField label="Description" value={form.description} onChange={sf("description")} ph="Products/services offered…" as="textarea"/>
          </div>
          <div className="flex gap-3 mt-5">
            <motion.button whileTap={{scale:0.97}} onClick={save}
              disabled={!form.name||!form.category||!form.phone}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white green-gradient disabled:opacity-40">
              <Save size={14}/> {modal==="add"?"Add Business":"Save Changes"}
            </motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>setModal(null)}
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
              Cancel
            </motion.button>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {modal==="preview" && previewTarget && (
        <Modal title="Business Card Preview" onClose={()=>setModal(null)}>
          <p className="text-xs mb-4" style={{color:"var(--text-3)"}}>This is how the card appears in the directory.</p>
          <BizPreviewCard b={previewTarget}/>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <Modal title="Delete Business?" onClose={()=>setConfirmDel(null)}>
          <p className="text-sm mb-4" style={{color:"var(--text-2)"}}>This will permanently remove the business from the directory.</p>
          <div className="flex gap-3">
            <motion.button whileTap={{scale:0.97}} onClick={()=>del(confirmDel)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{backgroundColor:"#dc2626"}}>
              Yes, Delete
            </motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>setConfirmDel(null)}
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{borderColor:"var(--border)",color:"var(--text-2)"}}>
              Cancel
            </motion.button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── HEALTH ─────────────────────────────────────────────────────────────────────

function HealthSection() {
  const { hospitals, ashaWorkers, janAushadhi, saveHospitals, saveAshaWorkers, saveJanAushadhi } = useData();
  const [hTab, setHTab] = useState<HealthTab>("hospitals");
  const [modal, setModal] = useState<"add"|"edit"|null>(null);
  const [editId, setEditId] = useState<string|null>(null);
  const [confirmDel, setConfirmDel] = useState<string|null>(null);

  // Hospital form
  const [hForm, setHForm] = useState({ name:"",type:"",address:"",phone:"",emergency:"",timing:"",services:"",distance:"" });
  const sh = (k:keyof typeof hForm) => (v:string) => setHForm(p=>({...p,[k]:v}));

  // ASHA form
  const [aForm, setAForm] = useState({ name:"",village:"",phone:"",services:"" });
  const sa = (k:keyof typeof aForm) => (v:string) => setAForm(p=>({...p,[k]:v}));

  // Jan form
  const [jForm, setJForm] = useState({ name:"",address:"",timing:"",note:"",phone:"" });
  const sj = (k:keyof typeof jForm) => (v:string) => setJForm(p=>({...p,[k]:v}));

  const openAdd = () => {
    setEditId(null);
    if(hTab==="hospitals") setHForm({name:"",type:"",address:"",phone:"",emergency:"",timing:"",services:"",distance:""});
    else if(hTab==="asha") setAForm({name:"",village:"",phone:"",services:""});
    else setJForm({name:"",address:"",timing:"",note:"",phone:""});
    setModal("add");
  };
  const openEdit = (item: any) => {
    setEditId(item.id);
    if(hTab==="hospitals") setHForm({...item,services:item.services.join(", ")});
    else if(hTab==="asha") setAForm({...item,services:item.services.join(", ")});
    else setJForm({...item});
    setModal("edit");
  };

  const save = () => {
    if(hTab==="hospitals"){
      const newH: Hospital = {...hForm,id:editId||uid(),services:hForm.services.split(",").map(s=>s.trim()).filter(Boolean)};
      saveHospitals(editId?hospitals.map(h=>h.id===editId?newH:h):[...hospitals,newH]);
    } else if(hTab==="asha"){
      const newA: ASHAWorker = {...aForm,id:editId||uid(),services:aForm.services.split(",").map(s=>s.trim()).filter(Boolean)};
      saveAshaWorkers(editId?ashaWorkers.map(a=>a.id===editId?newA:a):[...ashaWorkers,newA]);
    } else {
      const newJ: JanAushadhi = {...jForm,id:editId||uid()};
      saveJanAushadhi(editId?janAushadhi.map(j=>j.id===editId?newJ:j):[...janAushadhi,newJ]);
    }
    setModal(null);
  };
  const del = (id:string) => {
    if(hTab==="hospitals") saveHospitals(hospitals.filter(h=>h.id!==id));
    else if(hTab==="asha") saveAshaWorkers(ashaWorkers.filter(a=>a.id!==id));
    else saveJanAushadhi(janAushadhi.filter(j=>j.id!==id));
    setConfirmDel(null);
  };

  const tabs: {k:HealthTab;l:string;icon:React.ReactNode;items:any[]}[] = [
    {k:"hospitals",l:"Hospitals",icon:<Building2 size={14}/>,items:hospitals},
    {k:"asha",l:"ASHA Workers",icon:<UserCheck size={14}/>,items:ashaWorkers},
    {k:"jan",l:"Jan Aushadhi",icon:<Pill size={14}/>,items:janAushadhi},
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t=>(
          <motion.button key={t.k} whileTap={{scale:0.95}} onClick={()=>setHTab(t.k)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background:hTab===t.k?"linear-gradient(135deg,#1e3a5f,#2d5986)":"var(--bg-alt,var(--bg))",
              color:hTab===t.k?"white":"var(--text-2)",
              border:`1px solid ${hTab===t.k?"transparent":"var(--border)"}`,
            }}>
            {t.icon} {t.l} ({t.items.length})
          </motion.button>
        ))}
        <motion.button whileTap={{scale:0.97}} onClick={openAdd}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white green-gradient">
          <Plus size={14}/> Add {hTab==="hospitals"?"Hospital":hTab==="asha"?"ASHA Worker":"Store"}
        </motion.button>
      </div>

      <div className="space-y-3">
        {tabs.find(t=>t.k===hTab)!.items.map((item:any,i:number)=>(
          <motion.div key={item.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
            className="card p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{background:"linear-gradient(135deg,#1e3a5f,#2d5986)"}}>
              {hTab==="hospitals"?"🏥":hTab==="asha"?"👩‍⚕️":"💊"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm" style={{color:"var(--text)"}}>{item.name}</p>
                  {hTab==="hospitals" && <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{backgroundColor:"rgba(59,130,246,0.1)",color:"#3b82f6"}}>{item.type}</span>}
                  {hTab==="asha" && <p className="text-xs" style={{color:"var(--text-3)"}}>{item.village}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <motion.button whileTap={{scale:0.95}} onClick={()=>openEdit(item)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center border"
                    style={{borderColor:"var(--border)",color:"var(--text-3)"}}>
                    <Pencil size={12}/>
                  </motion.button>
                  <motion.button whileTap={{scale:0.95}} onClick={()=>setConfirmDel(item.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center border"
                    style={{borderColor:"rgba(220,38,38,0.3)",color:"#dc2626"}}>
                    <Trash2 size={12}/>
                  </motion.button>
                </div>
              </div>
              <div className="mt-2 text-xs space-y-0.5" style={{color:"var(--text-3)"}}>
                {item.address && <div className="flex gap-1.5"><MapPin size={10} style={{flexShrink:0}}/>{item.address}</div>}
                {item.phone && <div className="flex gap-1.5"><Phone size={10} style={{flexShrink:0}}/>{item.phone}</div>}
                {item.timing && <div className="flex gap-1.5"><Clock size={10} style={{flexShrink:0}}/>{item.timing}</div>}
                {item.note && <div className="flex gap-1.5"><Info size={10} style={{flexShrink:0}}/>{item.note}</div>}
                {item.services?.length>0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.services.slice(0,4).map((s:string)=>(
                      <span key={s} className="px-2 py-0.5 rounded-full text-[10px]" style={{backgroundColor:"rgba(27,67,50,0.08)",color:"var(--green)"}}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {tabs.find(t=>t.k===hTab)!.items.length===0 && (
          <div className="card text-center py-12" style={{color:"var(--text-3)"}}>
            <HeartPulse size={32} className="mx-auto mb-2 opacity-25"/>
            <p className="text-sm">No {hTab==="hospitals"?"hospitals":hTab==="asha"?"ASHA workers":"stores"} added yet</p>
          </div>
        )}
      </div>

      {/* Hospital Modal */}
      {modal && hTab==="hospitals" && (
        <Modal title={modal==="add"?"Add Hospital":"Edit Hospital"} onClose={()=>setModal(null)} wide>
          <div className="grid sm:grid-cols-2 gap-4">
            <FField label="Hospital Name" value={hForm.name} onChange={sh("name")} req ph="Civil Hospital Jawalamukhi"/>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text-2)"}}>Type<span className="text-red-500">*</span></label>
              <select value={hForm.type} onChange={e=>sh("type")(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{backgroundColor:"var(--bg)",borderColor:"var(--border)",color:"var(--text)"}}>
                <option value="">Select…</option>
                {HOSP_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <FField label="Phone" value={hForm.phone} onChange={sh("phone")} ph="01970-222001" type="tel"/>
            <FField label="Emergency No." value={hForm.emergency} onChange={sh("emergency")} ph="01970-222002" type="tel"/>
            <FField label="Timing" value={hForm.timing} onChange={sh("timing")} ph="24×7 Emergency | OPD: 9AM–2PM"/>
            <FField label="Distance from Dehrian" value={hForm.distance} onChange={sh("distance")} ph="3 km from Dehrian"/>
            <div className="sm:col-span-2">
              <FField label="Address" value={hForm.address} onChange={sh("address")} ph="Near Bus Stand, Jawalamukhi"/>
            </div>
            <div className="sm:col-span-2">
              <FField label="Services (comma separated)" value={hForm.services} onChange={sh("services")} ph="OPD, Emergency, Surgery, Maternity"/>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <motion.button whileTap={{scale:0.97}} onClick={save}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white green-gradient">
              <Save size={14}/> Save
            </motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>setModal(null)}
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{borderColor:"var(--border)",color:"var(--text-2)"}}>Cancel</motion.button>
          </div>
        </Modal>
      )}

      {/* ASHA Modal */}
      {modal && hTab==="asha" && (
        <Modal title={modal==="add"?"Add ASHA Worker":"Edit ASHA Worker"} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <FField label="Name" value={aForm.name} onChange={sa("name")} req ph="Smt. Sunita Devi"/>
            <FField label="Village / Ward" value={aForm.village} onChange={sa("village")} ph="Dehrian (Ward 1)"/>
            <FField label="Phone" value={aForm.phone} onChange={sa("phone")} ph="+91 98XXXXXXXX" type="tel"/>
            <FField label="Services (comma separated)" value={aForm.services} onChange={sa("services")} ph="Maternal Health, Vaccination, Home Visits"/>
          </div>
          <div className="flex gap-3 mt-5">
            <motion.button whileTap={{scale:0.97}} onClick={save}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white green-gradient">
              <Save size={14}/> Save
            </motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>setModal(null)}
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{borderColor:"var(--border)",color:"var(--text-2)"}}>Cancel</motion.button>
          </div>
        </Modal>
      )}

      {/* Jan Aushadhi Modal */}
      {modal && hTab==="jan" && (
        <Modal title={modal==="add"?"Add Jan Aushadhi Store":"Edit Store"} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <FField label="Store Name" value={jForm.name} onChange={sj("name")} req ph="Jan Aushadhi Kendra"/>
            <FField label="Phone" value={jForm.phone} onChange={sj("phone")} ph="01970-XXXXXX" type="tel"/>
            <FField label="Address" value={jForm.address} onChange={sj("address")} ph="Near Civil Hospital, Jawalamukhi"/>
            <FField label="Timing" value={jForm.timing} onChange={sj("timing")} ph="9AM–8PM (Mon–Sat)"/>
            <FField label="Note" value={jForm.note} onChange={sj("note")} ph="Generic medicines up to 90% cheaper"/>
          </div>
          <div className="flex gap-3 mt-5">
            <motion.button whileTap={{scale:0.97}} onClick={save}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white green-gradient">
              <Save size={14}/> Save
            </motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>setModal(null)}
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{borderColor:"var(--border)",color:"var(--text-2)"}}>Cancel</motion.button>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Delete?" onClose={()=>setConfirmDel(null)}>
          <p className="text-sm mb-4" style={{color:"var(--text-2)"}}>This will permanently remove this entry from the health directory.</p>
          <div className="flex gap-3">
            <motion.button whileTap={{scale:0.97}} onClick={()=>del(confirmDel)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{backgroundColor:"#dc2626"}}>Delete</motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>setConfirmDel(null)}
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{borderColor:"var(--border)",color:"var(--text-2)"}}>Cancel</motion.button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── NOTICES ────────────────────────────────────────────────────────────────────

function NoticesSection() {
  const { notices, saveNotices } = useData();
  const [modal, setModal] = useState<"add"|"edit"|"preview"|null>(null);
  const [editId, setEditId] = useState<string|null>(null);
  const [confirmDel, setConfirmDel] = useState<string|null>(null);
  const [form, setForm] = useState({ title:"", body:"", date:"", urgent:false });
  const sf = (k:keyof typeof form) => (v:string|boolean) => setForm(p=>({...p,[k]:v}));

  const openAdd = () => { setForm({title:"",body:"",date:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}),urgent:false}); setEditId(null); setModal("add"); };
  const openEdit = (n:Notice) => { setForm({...n}); setEditId(n.id); setModal("edit"); };
  const save = () => {
    if(!form.title||!form.body) return;
    if(editId) {
      saveNotices(notices.map(n=>n.id===editId?{...form,id:editId}:n));
    } else {
      saveNotices([{...form,id:uid()},...notices]);
    }
    setModal(null);
  };
  const del = (id:string) => { saveNotices(notices.filter(n=>n.id!==id)); setConfirmDel(null); };
  const toggleUrgent = (id:string) => saveNotices(notices.map(n=>n.id===id?{...n,urgent:!n.urgent}:n));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{color:"var(--text-3)"}}>{notices.length} notice{notices.length!==1?"s":""} active on homepage</p>
        <motion.button whileTap={{scale:0.97}} onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white green-gradient">
          <Plus size={15}/> Add Notice
        </motion.button>
      </div>

      <div className="space-y-3">
        {notices.map((n,i)=>(
          <motion.div key={n.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
            className="card p-4" style={{borderLeft:`4px solid ${n.urgent?"#ef4444":"var(--green-mid)"}`}}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{backgroundColor:n.urgent?"rgba(239,68,68,0.1)":"rgba(27,67,50,0.08)"}}>
                {n.urgent?<AlertTriangle size={14} color="#ef4444"/>:<CheckCircle2 size={14} style={{color:"var(--green-mid)"}}/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-0.5">
                  <p className="font-semibold text-sm flex-1" style={{color:"var(--text)"}}>{n.title}</p>
                  {n.urgent && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 shrink-0">URGENT</span>}
                </div>
                <p className="text-xs leading-relaxed" style={{color:"var(--text-2)"}}>{n.body}</p>
                <p className="text-xs mt-1.5" style={{color:"var(--text-3)"}}>{n.date}</p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <motion.button whileTap={{scale:0.95}} onClick={()=>{setModal("preview");setEditId(n.id);}}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{borderColor:"var(--border)",color:"var(--text-3)"}}>
                  <Eye size={11}/>
                </motion.button>
                <motion.button whileTap={{scale:0.95}} onClick={()=>openEdit(n)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{borderColor:"var(--border)",color:"var(--text-3)"}}>
                  <Pencil size={11}/>
                </motion.button>
                <motion.button whileTap={{scale:0.95}} onClick={()=>toggleUrgent(n.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border"
                  style={{borderColor:n.urgent?"rgba(239,68,68,0.3)":"var(--border)",color:n.urgent?"#ef4444":"var(--text-3)"}}>
                  <AlertTriangle size={11}/>
                </motion.button>
                <motion.button whileTap={{scale:0.95}} onClick={()=>setConfirmDel(n.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{borderColor:"rgba(220,38,38,0.3)",color:"#dc2626"}}>
                  <Trash2 size={11}/>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
        {notices.length===0 && (
          <div className="card text-center py-12" style={{color:"var(--text-3)"}}>
            <Megaphone size={32} className="mx-auto mb-2 opacity-25"/>
            <p className="text-sm">No notices yet</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modal==="add"||modal==="edit") && (
        <Modal title={modal==="add"?"Add Notice":"Edit Notice"} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <FField label="Title" value={form.title} onChange={sf("title")} req ph="Gram Sabha Meeting — 30 April"/>
            <FField label="Body" value={form.body} onChange={sf("body")} req ph="Details about the notice…" as="textarea" rows={3}/>
            <FField label="Date" value={form.date} onChange={sf("date")} ph="Apr 30, 2025"/>
            <button onClick={()=>sf("urgent")(!form.urgent)} className="flex items-center gap-2.5 text-sm font-medium" style={{color:"var(--text)"}}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all`}
                style={{borderColor:form.urgent?"#ef4444":"var(--border)",backgroundColor:form.urgent?"#ef4444":"transparent"}}>
                {form.urgent&&<Check size={11} color="white"/>}
              </div>
              Mark as Urgent
            </button>
          </div>
          <div className="flex gap-3 mt-5">
            <motion.button whileTap={{scale:0.97}} onClick={save}
              disabled={!form.title||!form.body}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white green-gradient disabled:opacity-40">
              <Save size={14}/> {modal==="add"?"Publish Notice":"Save Changes"}
            </motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>setModal(null)}
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{borderColor:"var(--border)",color:"var(--text-2)"}}>Cancel</motion.button>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {modal==="preview" && editId && (()=>{
        const n = notices.find(x=>x.id===editId);
        if(!n) return null;
        return (
          <Modal title="Notice Preview — Homepage View" onClose={()=>setModal(null)}>
            <p className="text-xs mb-4" style={{color:"var(--text-3)"}}>This is how the notice appears on the homepage.</p>
            <div className="card p-4 sm:p-5" style={{borderLeft:`4px solid ${n.urgent?"#ef4444":"var(--green-mid)"}`}}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{backgroundColor:n.urgent?"rgba(239,68,68,0.1)":"rgba(27,67,50,0.08)"}}>
                  {n.urgent?<AlertTriangle size={14} color="#ef4444"/>:<CheckCircle2 size={14} style={{color:"var(--green-mid)"}}/>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm" style={{color:"var(--text)"}}>{n.title}</p>
                    {n.urgent&&<span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold">URGENT</span>}
                  </div>
                  <p className="text-sm" style={{color:"var(--text-2)"}}>{n.body}</p>
                  <p className="text-xs mt-2" style={{color:"var(--text-3)"}}>{n.date}</p>
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

      {confirmDel && (
        <Modal title="Delete Notice?" onClose={()=>setConfirmDel(null)}>
          <p className="text-sm mb-4" style={{color:"var(--text-2)"}}>This notice will be removed from the homepage.</p>
          <div className="flex gap-3">
            <motion.button whileTap={{scale:0.97}} onClick={()=>del(confirmDel)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{backgroundColor:"#dc2626"}}>Delete</motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>setConfirmDel(null)}
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{borderColor:"var(--border)",color:"var(--text-2)"}}>Cancel</motion.button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── SETTINGS ───────────────────────────────────────────────────────────────────

function SettingsSection() {
  const { panchayatInfo, villageStats, savePanchayatInfo, saveVillageStats } = useData();
  const [info, setInfo] = useState(panchayatInfo);
  const [stats, setStats] = useState(villageStats);
  const [pass, setPass] = useState({ current:"", next:"", confirm:"" });
  const [saved, setSaved] = useState<string|null>(null);
  const si = (k:keyof PanchayatInfo) => (v:string) => setInfo(p=>({...p,[k]:v}));
  const ss = (k:keyof VillageStats) => (v:string) => setStats(p=>({...p,[k]:v}));

  const saveInfo = () => { savePanchayatInfo(info); setSaved("info"); setTimeout(()=>setSaved(null),2000); };
  const saveStats = () => { saveVillageStats(stats); setSaved("stats"); setTimeout(()=>setSaved(null),2000); };
  const changePass = () => {
    const stored = localStorage.getItem(ADMIN_PASS_KEY)||DEFAULT_PASS;
    if(pass.current!==stored) { alert("Current password is incorrect"); return; }
    if(pass.next!==pass.confirm) { alert("New passwords don't match"); return; }
    if(pass.next.length<6) { alert("Password must be at least 6 characters"); return; }
    localStorage.setItem(ADMIN_PASS_KEY, pass.next);
    setPass({current:"",next:"",confirm:""});
    setSaved("pass"); setTimeout(()=>setSaved(null),2000);
  };

  const SavedBadge = ({key2}:{key2:string}) => saved===key2 ? (
    <motion.span initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{backgroundColor:"rgba(22,163,74,0.1)",color:"#16a34a"}}>
      <CheckCircle2 size={12}/> Saved!
    </motion.span>
  ) : null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Panchayat Info */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{color:"var(--text)"}}>Panchayat Information</h3>
          <SavedBadge key2="info"/>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <FField label="Gram Pradhan Name" value={info.pradhan} onChange={si("pradhan")} ph="Shri Ramesh Kumar"/>
          <FField label="Secretary Name" value={info.secretary} onChange={si("secretary")} ph="Shri Suresh Sharma"/>
          <FField label="Office Phone" value={info.phone} onChange={si("phone")} ph="01970-XXXXXX" type="tel"/>
          <FField label="Email" value={info.email} onChange={si("email")} ph="panchayat.dehrian@hp.gov.in" type="email"/>
          <div className="sm:col-span-2">
            <FField label="Office Address" value={info.address} onChange={si("address")} ph="GP Dehrian, Jawalamukhi, Kangra, HP — 176031"/>
          </div>
        </div>
        <motion.button whileTap={{scale:0.97}} onClick={saveInfo}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white green-gradient">
          <Save size={14}/> Save Panchayat Info
        </motion.button>
      </div>

      {/* Village Stats */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold" style={{color:"var(--text)"}}>Village Statistics</h3>
            <p className="text-xs mt-0.5" style={{color:"var(--text-3)"}}>Shown on homepage</p>
          </div>
          <SavedBadge key2="stats"/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FField label="Total Villagers" value={stats.villagers} onChange={ss("villagers")} ph="847"/>
          <FField label="Businesses" value={stats.businesses} onChange={ss("businesses")} ph="32+"/>
          <FField label="Govt Schemes" value={stats.schemes} onChange={ss("schemes")} ph="16+"/>
          <FField label="Emergency Lines" value={stats.emergency} onChange={ss("emergency")} ph="6"/>
        </div>
        <motion.button whileTap={{scale:0.97}} onClick={saveStats}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white green-gradient">
          <Save size={14}/> Save Stats
        </motion.button>
      </div>

      {/* Change Password */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{color:"var(--text)"}}>Change Admin Password</h3>
          <SavedBadge key2="pass"/>
        </div>
        <div className="space-y-4">
          <FField label="Current Password" value={pass.current} onChange={v=>setPass(p=>({...p,current:v}))} type="password" ph="••••••••"/>
          <FField label="New Password" value={pass.next} onChange={v=>setPass(p=>({...p,next:v}))} type="password" ph="Min 6 characters"/>
          <FField label="Confirm New Password" value={pass.confirm} onChange={v=>setPass(p=>({...p,confirm:v}))} type="password" ph="Repeat new password"/>
        </div>
        <motion.button whileTap={{scale:0.97}} onClick={changePass}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{background:"linear-gradient(135deg,#7c3aed,#a855f7)"}}>
          <Lock size={14}/> Update Password
        </motion.button>
      </div>
    </div>
  );
}

// ── MEMBERS SECTION ───────────────────────────────────────────────────────────

const DESIGNATIONS = ["Gram Pradhan","Up-Pradhan","Gram Sachiv","Gram Sewak","Ward Panch"];
const DESIG_EMOJI: Record<string,string> = { "Gram Pradhan":"🏛️","Up-Pradhan":"⭐","Gram Sachiv":"📋","Gram Sewak":"🌾","Ward Panch":"🏘️" };

function MembersSection() {
  const { members, saveMembers } = useData();
  const emptyForm = { name:"", nameHi:"", designation:"Ward Panch", ward:"", phone:"" };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string|null>(null);
  const [saved, setSaved] = useState(false);

  const flash = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  const submit = () => {
    if (!form.name.trim()) return;
    if (editId) {
      saveMembers(members.map(m => m.id===editId ? { ...m, ...form } : m));
    } else {
      saveMembers([...members, { id: uid(), ...form }]);
    }
    setForm(emptyForm); setEditId(null); flash();
  };

  const remove = (id: string) => saveMembers(members.filter(m=>m.id!==id));
  const startEdit = (m: PanchayatMember) => { setForm({ name:m.name, nameHi:m.nameHi, designation:m.designation, ward:m.ward, phone:m.phone }); setEditId(m.id); };
  const cancel = () => { setForm(emptyForm); setEditId(null); };

  const groups = DESIGNATIONS.map(d => ({ d, items: members.filter(m=>m.designation===d) })).filter(g=>g.items.length>0);

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{color:"var(--text)"}}>{editId ? "Edit Member" : "Add Panchayat Member"}</h3>
          {saved && <span className="text-xs font-semibold text-green-500 flex items-center gap-1"><Check size={12}/> Saved</span>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <FField label="Name (English)" req value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} ph="Full name"/>
          <FField label="नाम (हिंदी)" value={form.nameHi} onChange={v=>setForm(p=>({...p,nameHi:v}))} ph="हिंदी में नाम"/>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text-2)"}}>Designation <span className="text-red-500">*</span></label>
            <select value={form.designation} onChange={e=>setForm(p=>({...p,designation:e.target.value}))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{backgroundColor:"var(--bg)",border:"1px solid var(--border)",color:"var(--text)"}}>
              {DESIGNATIONS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {form.designation === "Ward Panch" && (
            <FField label="Ward" value={form.ward} onChange={v=>setForm(p=>({...p,ward:v}))} ph="e.g. Ward 1"/>
          )}
          <FField label="Phone Number" value={form.phone} onChange={v=>setForm(p=>({...p,phone:v}))} ph="+91 XXXXX XXXXX" type="tel"/>
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{scale:0.97}} onClick={submit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{background:"linear-gradient(135deg,#1B4332,#2D6A4F)"}}>
            <Save size={14}/> {editId ? "Update Member" : "Add Member"}
          </motion.button>
          {editId && (
            <button onClick={cancel} className="px-4 py-2.5 rounded-xl text-sm font-medium border"
              style={{color:"var(--text-2)",borderColor:"var(--border)"}}>Cancel</button>
          )}
        </div>
      </div>

      {/* Members list by designation */}
      {groups.map(({d, items}) => (
        <div key={d} className="card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{color:"var(--text)"}}>
            <span className="text-xl">{DESIG_EMOJI[d]||"👤"}</span> {d}
            <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full" style={{backgroundColor:"rgba(27,67,50,0.1)",color:"var(--green)"}}>{items.length}</span>
          </h3>
          <div className="space-y-3">
            {items.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{borderColor:"var(--border)"}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{backgroundColor:"rgba(27,67,50,0.06)"}}>
                  {DESIG_EMOJI[m.designation]||"👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{color:"var(--text)"}}>{m.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {m.nameHi && <p className="text-xs font-hindi" style={{color:"var(--text-3)"}}>{m.nameHi}</p>}
                    {m.ward && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{backgroundColor:"rgba(124,58,237,0.1)",color:"#7c3aed"}}>{m.ward}</span>}
                    {m.phone && <span className="text-xs flex items-center gap-1" style={{color:"var(--text-3)"}}><Phone size={10}/>{m.phone}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={()=>startEdit(m)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50"
                    style={{color:"#3b82f6"}}><Pencil size={13}/></button>
                  <button onClick={()=>remove(m.id)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                    style={{color:"#dc2626"}}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {members.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-semibold" style={{color:"var(--text)"}}>No members added yet</p>
          <p className="text-sm mt-1" style={{color:"var(--text-3)"}}>Add Pradhan, Up-Pradhan, Sachiv and Ward Panchs above</p>
        </div>
      )}
    </div>
  );
}

// ── MAIN ADMIN PAGE ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { registrations } = useData();
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pending = registrations.filter(r=>r.status==="pending").length;

  const login = () => {
    const stored = (typeof window!=="undefined"&&localStorage.getItem(ADMIN_PASS_KEY))||DEFAULT_PASS;
    if(pass===stored) { setAuthed(true); setErr(false); }
    else setErr(true);
  };

  const navItems: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key:"overview",       label:"Overview",        icon:<LayoutDashboard size={17}/> },
    { key:"registrations",  label:"Registrations",   icon:<ClipboardList size={17}/>,  badge:pending },
    { key:"businesses",     label:"Businesses",      icon:<Store size={17}/> },
    { key:"health",         label:"Health",          icon:<HeartPulse size={17}/> },
    { key:"notices",        label:"Notices",         icon:<Megaphone size={17}/> },
    { key:"members",        label:"Members",         icon:<Users size={17}/> },
    { key:"settings",       label:"Settings",        icon:<Settings size={17}/> },
  ];

  const tabTitles: Record<Tab,string> = {
    overview:"Dashboard Overview", registrations:"Business Registrations",
    businesses:"Business Directory", health:"Health Directory",
    notices:"Notice Board", members:"Panchayat Members", settings:"Settings",
  };

  // ── Login screen ──

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{background:"linear-gradient(160deg,#041A0C,#1B4332)"}}>
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <motion.div animate={{y:[0,-6,0]}} transition={{duration:3,repeat:Infinity}}
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center gold-gradient shadow-xl">
            <Lock size={26} color="#1B4332"/>
          </motion.div>
          <h1 className="text-2xl font-bold text-white font-display">Admin Dashboard</h1>
          <p className="text-xs font-hindi mt-1" style={{color:"rgba(255,255,255,0.4)"}}>पंचायत प्रशासन पैनल</p>
        </div>
        <div className="glass-dark rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-white/70 block mb-2">Admin Password</label>
            <input type="password" placeholder="Enter password" value={pass}
              onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
              className="input"
              style={{backgroundColor:"rgba(255,255,255,0.07)",color:"white",borderColor:err?"#dc2626":"rgba(255,255,255,0.12)"}}/>
            {err && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle size={11}/> Incorrect password</p>}
          </div>
          <motion.button whileTap={{scale:0.97}} onClick={login}
            className="w-full py-3.5 rounded-xl font-semibold text-sm gold-gradient"
            style={{color:"#1B4332"}}>
            Login to Admin Panel
          </motion.button>
          <p className="text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Default: {DEFAULT_PASS}</p>
        </div>
      </motion.div>
    </div>
  );

  // ── Dashboard ──

  return (
    <div className="flex h-screen overflow-hidden" style={{backgroundColor:"var(--bg-alt,#f0f2f5)"}}>

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col h-full overflow-y-auto"
        style={{backgroundColor:"#041A0C",borderRight:"1px solid rgba(255,255,255,0.06)"}}>
        {/* Logo */}
        <div className="p-5 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center gold-gradient">
              <Shield size={16} color="#1B4332"/>
            </div>
            <div>
              <p className="text-sm font-bold text-white font-display">GramConnect</p>
              <p className="text-[10px] tracking-widest uppercase" style={{color:"rgba(255,255,255,0.3)"}}>Admin Panel</p>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item)=>(
            <motion.button key={item.key} whileTap={{scale:0.97}}
              onClick={()=>setTab(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left relative"
              style={{
                backgroundColor:tab===item.key?"rgba(201,146,42,0.15)":"transparent",
                color:tab===item.key?"#E8B84B":"rgba(255,255,255,0.55)",
              }}>
              <span style={{color:tab===item.key?"#E8B84B":"rgba(255,255,255,0.4)"}}>{item.icon}</span>
              {item.label}
              {item.badge ? (
                <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{backgroundColor:"#ef4444"}}>
                  {item.badge}
                </span>
              ) : null}
            </motion.button>
          ))}
        </nav>
        {/* Logout */}
        <div className="p-3 border-t" style={{borderColor:"rgba(255,255,255,0.06)"}}>
          <motion.button whileTap={{scale:0.97}} onClick={()=>setAuthed(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{color:"rgba(255,255,255,0.35)"}}>
            <LogOut size={16}/> Logout
          </motion.button>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-40 lg:hidden" style={{backgroundColor:"rgba(0,0,0,0.5)"}}
              onClick={()=>setSidebarOpen(false)}/>
            <motion.aside initial={{x:-240}} animate={{x:0}} exit={{x:-240}}
              transition={{duration:0.25,ease:"easeOut"}}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 flex flex-col lg:hidden"
              style={{backgroundColor:"#041A0C"}}>
              <div className="p-5 border-b flex items-center justify-between" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center gold-gradient">
                    <Shield size={16} color="#1B4332"/>
                  </div>
                  <p className="text-sm font-bold text-white font-display">Admin Panel</p>
                </div>
                <button onClick={()=>setSidebarOpen(false)} style={{color:"rgba(255,255,255,0.4)"}}>
                  <X size={18}/>
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item)=>(
                  <button key={item.key}
                    onClick={()=>{setTab(item.key);setSidebarOpen(false);}}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left relative"
                    style={{backgroundColor:tab===item.key?"rgba(201,146,42,0.15)":"transparent",color:tab===item.key?"#E8B84B":"rgba(255,255,255,0.55)"}}>
                    <span style={{color:tab===item.key?"#E8B84B":"rgba(255,255,255,0.4)"}}>{item.icon}</span>
                    {item.label}
                    {item.badge?<span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{backgroundColor:"#ef4444"}}>{item.badge}</span>:null}
                  </button>
                ))}
              </nav>
              <div className="p-3 border-t" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                <button onClick={()=>setAuthed(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" style={{color:"rgba(255,255,255,0.35)"}}>
                  <LogOut size={16}/> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b"
          style={{backgroundColor:"var(--bg)",borderColor:"var(--border)",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(true)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center"
              style={{color:"var(--text-2)"}}>
              <Menu size={18}/>
            </button>
            <div>
              <h1 className="font-bold text-sm sm:text-base" style={{color:"var(--text)"}}>{tabTitles[tab]}</h1>
              <p className="text-xs hidden sm:block" style={{color:"var(--text-3)"}}>Dehrian Gram Panchayat</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pending > 0 && (
              <motion.button whileTap={{scale:0.95}} onClick={()=>setTab("registrations")}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{backgroundColor:"rgba(239,68,68,0.1)",color:"#dc2626",border:"1px solid rgba(239,68,68,0.2)"}}>
                <Bell size={13}/> {pending} pending
              </motion.button>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{background:"linear-gradient(135deg,#C9922A,#E8B84B)",color:"#1B4332"}}>A</div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
              exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
              {tab==="overview"       && <OverviewSection setTab={setTab}/>}
              {tab==="registrations"  && <RegistrationsSection/>}
              {tab==="businesses"     && <BusinessesSection/>}
              {tab==="health"         && <HealthSection/>}
              {tab==="notices"        && <NoticesSection/>}
              {tab==="members"        && <MembersSection/>}
              {tab==="settings"       && <SettingsSection/>}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
