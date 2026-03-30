"use client";

import i18n from "@/lib/i18n/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense, useState } from "react";
import { I18nextProvider } from "react-i18next";

/** Matches document background so the first paint does not flash white during Suspense. */
const HydrationFallback = () => (
  <div
    className="min-h-screen w-full flex-1 bg-surface"
    aria-hidden
  />
);

export const Providers = ({
  children,
}: {
  readonly children: React.ReactNode;
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            gcTime: Infinity,
            retry: 1,
          },
        },
      }),
  );

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<HydrationFallback />}>{children}</Suspense>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </I18nextProvider>
  );
};
