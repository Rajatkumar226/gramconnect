import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import InstallPrompt from "@/components/InstallPrompt";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GramConnect — Dehrian Panchayat",
  description: "Official digital portal for Dehrian Panchayat, Jawalamukhi, Kangra, Himachal Pradesh — Notices, Schemes, Health, Emergency & Business Directory.",
  keywords: "Dehrian Panchayat, Jawalamukhi, Kangra, Himachal Pradesh, GramConnect, government schemes",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={`${jakarta.variable} ${playfair.variable}`}>
      <body style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans Devanagari', sans-serif" }}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <LoginModal />
            <main className="page-content">{children}</main>
            <Footer />
            <BottomNav />
            <InstallPrompt />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
