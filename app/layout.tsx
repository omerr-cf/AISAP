// ─── WHY THIS FILE HAS NO "use client" ────────────────────────────────────────
// layout.tsx is intentionally a Server Component (no "use client" directive).
// This lets Next.js handle fonts + metadata at build/request time on the server,
// before any JavaScript reaches the browser. Adding "use client" would break
// `export const metadata` (server-only API) and disable font optimisation.
// All client-side state (React Query, i18n) lives inside <Providers>, which IS
// a Client Component — keeping the boundary at exactly the right level.
// ──────────────────────────────────────────────────────────────────────────────

import { Providers } from "@/shared/layout/Providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Next.js downloads these fonts at build time and self-hosts them.
// No runtime request to fonts.google.com → faster, more private, works offline.
// The `variable` option injects a CSS custom property (--font-geist-sans) that
// Tailwind's `font-sans` utility picks up via globals.css @theme.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// `export const metadata` is a Next.js Server Component convention.
// Next.js reads this at build/request time and injects <title> + <meta> tags
// into the HTML <head> — no JavaScript needed, which benefits SEO and crawlers.
export const metadata: Metadata = {
  title: "AISAP | Echo Study Review",
  description: "Echocardiography study review dashboard",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  // suppressHydrationWarning suppresses React's "text content did not match"
  // warning on <html>/<body>. Browser extensions (e.g. LastPass, Grammarly) and
  // i18n strings can add attributes after SSR, causing harmless mismatches.
  // Only suppress on root shell elements — never inside data-bearing components.
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Providers is a Client Component boundary. Everything inside it
            (React Query cache, i18n, devtools) runs client-side only. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
