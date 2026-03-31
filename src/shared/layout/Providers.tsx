"use client";

// ─── WHY "use client" HERE ────────────────────────────────────────────────────
// Providers uses useState and creates a QueryClient, which are client-only APIs.
// Marking it "use client" creates a Client Component boundary: everything INSIDE
// Providers becomes client-side, but layout.tsx (its parent) stays a Server
// Component. This is the standard Next.js App Router pattern — the root layout
// stays server-rendered for metadata + fonts; the interactive shell is isolated
// inside a single Client Component wrapper.
// ──────────────────────────────────────────────────────────────────────────────

import i18n from "@/lib/i18n/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense, useState } from "react";
import { I18nextProvider } from "react-i18next";

/** Matches document background so the first paint does not flash white during Suspense. */
const HydrationFallback = () => (
  <div className="min-h-screen w-full flex-1 bg-surface" aria-hidden />
);

export const Providers = ({
  children,
}: {
  readonly children: React.ReactNode;
}) => {
  // ─── WHY QueryClient is inside useState, not a module-level const ─────────
  // Wrong approach:  const queryClient = new QueryClient()  ← module-level
  //
  // In Next.js with SSR, module-level variables are shared across ALL requests
  // on the same server process. User A's cached study data could bleed into
  // User B's response — a data-leak bug in multi-user apps.
  //
  // Correct approach: useState(() => new QueryClient())
  //   • The factory function `() => new QueryClient()` runs ONCE per React tree.
  //   • On the server: each incoming request gets a fresh, isolated QueryClient.
  //   • On the client: useState ignores the factory after first mount, so only
  //     one client is created for the browser session — no unnecessary re-creation.
  //   • Passing the factory to useState (not the instance) also avoids creating
  //     the object during SSR and then immediately throwing it away.
  // ──────────────────────────────────────────────────────────────────────────
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // staleTime: Infinity — tells React Query never to consider cached
            // data stale, so it will never fire a background refetch automatically.
            // Correct for this app: studies.json is static; there is nothing new to fetch.
            staleTime: Infinity,
            // gcTime: Infinity — prevents the cache entry from being garbage-collected
            // after a component unmounts. The detail page relies on the list cache
            // being warm; without this, navigating back would re-fetch unnecessarily.
            gcTime: Infinity,
            // retry: 1 — if the single /api/studies call fails, try once more
            // before surfacing the error state to the user.
            retry: 1,
          },
        },
      }),
  );

  // ─── PROVIDER ORDER matters ──────────────────────────────────────────────
  // I18nextProvider wraps QueryClientProvider so that any component rendered
  // by React Query (e.g. ErrorState, EmptyState) can also call useTranslation().
  // Reversing the order would make i18n unavailable inside query-managed UI.
  //
  // Suspense wraps {children} to satisfy Next.js App Router: any component that
  // calls useSearchParams() must be wrapped in a Suspense boundary, or Next.js
  // will throw during SSR. The HydrationFallback prevents a white flash while
  // the client hydrates (matches the dark page background).
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<HydrationFallback />}>{children}</Suspense>
        {/* DevTools panel only bundled in development — stripped from production build. */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </I18nextProvider>
  );
};
