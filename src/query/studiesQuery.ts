"use client";

import { fetchStudies } from "@/api/studies";
import { useQuery } from "@tanstack/react-query";

// STUDIES_QUERY_KEY is the cache identity for every studies query in the app.
// Both useStudies (list) and useStudyDetail (detail) use THIS same key, so they
// share one cache entry. When the list page fetches, the detail page gets the
// data for free — and vice versa. `as const` prevents the array from being
// widened to `string[]`, keeping the type as the literal tuple `["studies"]`.
export const STUDIES_QUERY_KEY = ["studies"] as const;

export const useStudies = () =>
  useQuery({
    queryKey: STUDIES_QUERY_KEY,
    queryFn: fetchStudies,
    // Static dataset requires no background re-fetching; refetch only via explicit retry.
    staleTime: Infinity,
    gcTime: Infinity,
  });
