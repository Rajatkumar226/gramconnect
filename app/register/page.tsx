"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Upload, ChevronRight, User, Store, FileText, AlertCircle, Check } from "lucide-react";

const steps = ["Business Info", "Owner Details", "Documents", "Review"];
const categories = ["Grocery & Kirana", "Medical & Pharmacy", "Dairy & Milk", "Hardware & Electronics", "Food & Restaurant", "Tailoring & Clothing", "Mobile & Repair", "Agriculture & Nursery", "Automobile & Repair", "Education & Coaching", "Beauty & Salon", "Other"];

type Form = {
  bName: string; bNameHi: string; category: string; address: string; phone: string; timing: string; desc: string;
  oName: string; oPhone: string; aadhaar: string; email: string;
  docAadhaar: boolean; docResidence: boolean; docCharacter: boolean;
  agree: boolean;
};

const init: Form = { bName: "", bNameHi: "", category: "", address: "", phone: "", timing: "", desc: "", oName: "", oPhone: "", aadhaar: "", email: "", docAadhaar: false, docResidence: false, docCharacter: false, agree: false };

function Field({ label, hi, ph, type = "text", req, val, set }: { label: string; hi?: string; ph: string; type?: string; req?: boolean; val: string; set: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--text)" }}>
        {label} {hi && <span className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>({hi})</span>}
        {req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input type={type} placeholder={ph} value={val} onChange={(e) => set(e.target.value)} className="input" />
    </div>
  );
}

function DocUpload({ label, hi, note, done, toggle }: { label: string; hi: string; note: string; done: boolean; toggle: () => void }) {
  return (
    <motion.div whileTap={{ scale: 0.99 }}
      className="rounded-2xl p-4 sm:p-5 cursor-pointer transition-all"
      style={{
        border: `2px dashed ${done ? "var(--green-mid)" : "var(--border)"}`,
        backgroundColor: done ? "rgba(45,106,79,0.06)" : "var(--bg-alt, var(--bg))",
      }}
      onClick={toggle}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
            {label} <span className="text-red-500">*</span>
          </p>
          <p className="text-xs font-hindi mb-0.5" style={{ color: "var(--text-3)" }}>{hi}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{note}</p>
        </div>
        <motion.div whileTap={{ scale: 0.9 }}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold shrink-0 text-white"
          style={{ background: done ? "#16a34a" : "linear-gradient(135deg, var(--green), var(--green-mid))" }}>
          {done ? <><Check size={14} /> Uploaded</> : <><Upload size={14} /> Upload</>}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<Form>(init);
  const set = (k: keyof Form) => (v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const valid = [
    !!(form.bName && form.category && form.address && form.phone),
    !!(form.oName && form.oPhone && form.aadhaar),
    !!(form.docAadhaar && form.docResidence && form.docCharacter),
    form.agree,
  ];

  const submit = () => {
    if (!valid[3]) return;
    const reg = { ...form, id: Date.now(), status: "pending", at: new Date().toISOString() };
    const prev = JSON.parse(localStorage.getItem("gc_regs") || "[]");
    localStorage.setItem("gc_regs", JSON.stringify([...prev, reg]));
    setDone(true);
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{ background: "linear-gradient(160deg, #041A0C, #1B4332)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center gold-gradient shadow-xl">
          <CheckCircle2 size={36} color="#1B4332" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-3 font-display">Application Submitted!</h2>
        <p className="mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          Submitted to <strong style={{ color: "#E8B84B" }}>Dehrian Gram Panchayat</strong>. You will be notified in <strong className="text-white">5–7 working days</strong>.
        </p>
        <div className="glass-dark rounded-2xl p-4 text-left mb-6 space-y-2.5">
          <p className="text-sm font-semibold" style={{ color: "#74C69D" }}>What happens next?</p>
          {["Panchayat office receives your application", "Documents verified — Aadhaar & residence", "Gram Pradhan approves character certificate", "Business listed with 'Panchayat Verified' badge"].map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              <span className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
              {s}
            </div>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => { setDone(false); setStep(0); setForm(init); }}
          className="px-6 py-3 rounded-xl font-semibold text-sm gold-gradient"
          style={{ color: "#1B4332" }}>
          Register Another Business
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="relative py-20 sm:py-24 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #041A0C, #1B4332, #2D6A4F)" }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #C9922A, transparent 50%)" }} />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 font-display">
            Register Your <span className="gold-shimmer">Business</span>
          </h1>
          <p className="text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
            Get listed and earn the <strong style={{ color: "#E8B84B" }}>Panchayat Verified</strong> badge.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 pb-8 sm:pb-20">
        {/* Step indicator */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="-mt-5 mb-5 card p-4 sm:p-5">
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300`}
                  style={i < step ? { background: "linear-gradient(135deg, var(--green), var(--green-mid))", color: "white" }
                    : i === step ? { background: "linear-gradient(135deg, var(--green), var(--green-mid))", color: "white", boxShadow: "0 0 0 4px rgba(45,106,79,0.2)" }
                    : { backgroundColor: "var(--bg-alt, var(--bg))", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block truncate" style={{ color: i === step ? "var(--green)" : "var(--text-3)", fontWeight: i === step ? 600 : 400 }}>{s}</span>
                {i < steps.length - 1 && (
                  <div className="h-px flex-1 mx-1 transition-colors" style={{ backgroundColor: i < step ? "var(--green-mid)" : "var(--border)" }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}
            className="card p-5 sm:p-7"
          >
            {/* STEP 0 */}
            {step === 0 && (
              <div className="space-y-4">
                <SectionHead icon={<Store size={15} color="white" />} title="Business Info" hi="व्यापार की जानकारी" />
                <Field label="Business Name" hi="व्यापार का नाम" ph="e.g. Sharma General Store" req val={form.bName} set={set("bName")} />
                <Field label="Hindi Name" hi="हिंदी में नाम" ph="शर्मा जनरल स्टोर" val={form.bNameHi} set={set("bNameHi")} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Category <span className="text-red-500">*</span></label>
                  <select value={form.category} onChange={(e) => set("category")(e.target.value)} className="input" style={{ cursor: "pointer" }}>
                    <option value="">Select category…</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Field label="Address" hi="पता" ph="Village/Ward, Dehrian" req val={form.address} set={set("address")} />
                <Field label="Phone" hi="फोन" ph="+91 98XXXXXXXX" type="tel" req val={form.phone} set={set("phone")} />
                <Field label="Timing" hi="समय" ph="9AM–8PM (Closed Sunday)" val={form.timing} set={set("timing")} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Description</label>
                  <textarea value={form.desc} onChange={(e) => set("desc")(e.target.value)} placeholder="Products/services you offer…" rows={3}
                    className="input" style={{ resize: "none" }} />
                </div>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <SectionHead icon={<User size={15} color="white" />} title="Owner Details" hi="मालिक की जानकारी" />
                <Field label="Full Name" hi="पूरा नाम" ph="As on Aadhaar" req val={form.oName} set={set("oName")} />
                <Field label="Mobile" hi="मोबाइल" ph="+91 XXXXXXXXXX" type="tel" req val={form.oPhone} set={set("oPhone")} />
                <Field label="Email" ph="example@email.com" type="email" val={form.email} set={set("email")} />
                <Field label="Aadhaar Number" hi="आधार नंबर" ph="XXXX XXXX XXXX" req val={form.aadhaar} set={set("aadhaar")} />
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ backgroundColor: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: "#ca8a04" }} />
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>Aadhaar is collected only for Panchayat identity verification and will not be shown publicly.</p>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <SectionHead icon={<FileText size={15} color="white" />} title="Upload Documents" hi="दस्तावेज़ अपलोड" />
                <p className="text-sm" style={{ color: "var(--text-2)" }}>Upload clear photos or scans (JPG, PNG, PDF). All 3 required.</p>
                <DocUpload label="Aadhaar Card" hi="आधार कार्ड" note="Owner's Aadhaar — both sides" done={form.docAadhaar} toggle={() => set("docAadhaar")(!form.docAadhaar)} />
                <DocUpload label="Residence Proof" hi="निवास प्रमाण" note="Ration card, Voter ID, or HP domicile" done={form.docResidence} toggle={() => set("docResidence")(!form.docResidence)} />
                <DocUpload label="Character Certificate" hi="चरित्र प्रमाण पत्र" note="Issued by Gram Pradhan, Dehrian Panchayat" done={form.docCharacter} toggle={() => set("docCharacter")(!form.docCharacter)} />
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <SectionHead icon={<Shield size={15} color="#1B4332" style={{ color: "#1B4332" }} />} title="Review & Submit" hi="समीक्षा करें" gold />
                <div className="rounded-xl p-4 space-y-2.5 text-sm" style={{ backgroundColor: "var(--bg-alt, var(--bg))", border: "1px solid var(--border)" }}>
                  {[["Business", form.bName], ["Category", form.category], ["Address", form.address], ["Phone", form.phone],
                    ["Owner", form.oName], ["Aadhaar", "XXXX XXXX " + form.aadhaar.slice(-4)]].map(([k, v]) => v && (
                    <div key={k} className="flex gap-2">
                      <span className="shrink-0 w-24" style={{ color: "var(--text-3)" }}>{k}:</span>
                      <span className="font-medium" style={{ color: "var(--text)" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <motion.div whileTap={{ scale: 0.99 }}
                  className="flex items-start gap-3 p-4 rounded-xl cursor-pointer"
                  style={{ backgroundColor: "var(--bg-alt, var(--bg))" }}
                  onClick={() => set("agree")(!form.agree)}>
                  <div className="w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all"
                    style={{ borderColor: form.agree ? "var(--green-mid)" : "var(--border)", backgroundColor: form.agree ? "var(--green-mid)" : "transparent" }}>
                    {form.agree && <Check size={11} color="white" />}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                    I declare all submitted information and documents are genuine. I am a bona fide resident of Dehrian Panchayat.
                  </p>
                </motion.div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-7 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
              {step > 0 ? (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep((s) => s - 1)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ border: "1px solid var(--border)", color: "var(--text-2)", backgroundColor: "var(--bg-alt, var(--bg))" }}>
                  Back
                </motion.button>
              ) : <div />}

              {step < 3 ? (
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => { if (valid[step]) setStep((s) => s + 1); }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{
                    background: valid[step] ? "linear-gradient(135deg, var(--green), var(--green-mid))" : "var(--bg-alt)",
                    opacity: valid[step] ? 1 : 0.5,
                    cursor: valid[step] ? "pointer" : "not-allowed",
                    color: valid[step] ? "white" : "var(--text-3)",
                  }}>
                  Continue <ChevronRight size={15} />
                </motion.button>
              ) : (
                <motion.button whileTap={{ scale: 0.97 }} onClick={submit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: valid[3] ? "linear-gradient(135deg, #C9922A, #E8B84B)" : "var(--bg-alt)",
                    color: valid[3] ? "#1B4332" : "var(--text-3)",
                    opacity: valid[3] ? 1 : 0.5,
                    cursor: valid[3] ? "pointer" : "not-allowed",
                  }}>
                  <Shield size={14} /> Submit for Verification
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SectionHead({ icon, title, hi, gold }: { icon: React.ReactNode; title: string; hi: string; gold?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: gold ? "linear-gradient(135deg, #C9922A, #E8B84B)" : "linear-gradient(135deg, var(--green), var(--green-mid))" }}>
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-base sm:text-lg" style={{ color: "var(--text)" }}>{title}</h2>
        <p className="text-xs font-hindi" style={{ color: "var(--text-3)" }}>{hi}</p>
      </div>
    </div>
  );
}
