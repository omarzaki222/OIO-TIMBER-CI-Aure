import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { AuthProvider } from "@/hooks/auth-context";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "OIO Studio",
    template: "%s · OIO Studio",
  },
  description: "OIO Wood & Timber atelier administration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} font-sans min-h-screen bg-oio-cream text-oio-ink`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
