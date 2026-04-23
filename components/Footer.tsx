"use client";
import Link from "next/link";
import { Leaf, Phone, MapPin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="hidden md:block" style={{ backgroundColor: "#041A0C", color: "white" }}>
      <div className="divider-gold" />
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #C9922A, #E8B84B)" }}>
                <Leaf size={19} color="#1B4332" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xl font-bold font-display">GramConnect</p>
                <p className="text-xs tracking-widest uppercase" style={{ color: "var(--sage)" }}>Dehrian Panchayat</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              Connecting Dehrian with government services, local businesses, and emergency support — digitally.
            </p>
            <p className="mt-3 text-xs font-hindi" style={{ color: "rgba(255,255,255,0.3)" }}>
              डेहरियाँ ग्राम पंचायत · जवालामुखी · कांगड़ा · हिमाचल प्रदेश
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#C9922A" }}>Quick Links</p>
            <ul className="space-y-2.5">
              {[
                ["/yojnaen","Sarkari Yojnaen"],
                ["/health","Health Directory"],
                ["/emergency","Emergency Contacts"],
                ["/directory","Business Directory"],
                ["/register","Register Business"],
                ["/admin","Admin Panel"],
              ].map(([href,label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#E8B84B"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#C9922A" }}>Contact</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: "var(--sage)" }} />
                GP Dehrian, Jawalamukhi, Kangra, HP — 176031
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                <Phone size={14} className="shrink-0" style={{ color: "var(--sage)" }} />
                Panchayat Office
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                <Mail size={14} className="shrink-0" style={{ color: "var(--sage)" }} />
                panchayat.dehrian@hp.gov.in
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-gold mt-10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
          <p>© 2025 GramConnect · Dehrian Panchayat. All rights reserved.</p>
          <p>Powered by Digital India · NIC Himachal Pradesh</p>
        </div>
      </div>
    </footer>
  );
}
