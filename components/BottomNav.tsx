"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Heart, Phone, Store } from "lucide-react";

const items = [
  { href: "/", icon: Home, label: "Home", hi: "होम" },
  { href: "/yojnaen", icon: FileText, label: "Yojnaen", hi: "योजना" },
  { href: "/health", icon: Heart, label: "Health", hi: "स्वास्थ्य" },
  { href: "/emergency", icon: Phone, label: "Emergency", hi: "आपातकाल", red: true },
  { href: "/directory", icon: Store, label: "Directory", hi: "व्यापार" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        backgroundColor: "var(--nav-bg)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map(({ href, icon: Icon, label, hi, red }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center flex-1 py-2.5 gap-0.5 transition-all duration-200 active:scale-95"
            style={{
              color: active
                ? (red ? "#f87171" : "#E8B84B")
                : "rgba(255,255,255,0.45)",
              backgroundColor: active ? "rgba(255,255,255,0.04)" : "transparent",
            }}
          >
            <div className="relative">
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                color={red ? (active ? "#f87171" : "rgba(248,113,113,0.5)") : undefined}
              />
              {active && (
                <span
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: red ? "#f87171" : "#E8B84B" }}
                />
              )}
            </div>
            <span className="text-[9px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
