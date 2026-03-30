"use client";

// All React Query definitions for the studies domain live here.
// Separating query keys + hooks from generic hooks keeps src/hooks/ clean.
import { fetchStudies } from "@/api/studies";
import { useQuery } from "@tanstack/react-query";

export const STUDIES_QUERY_KEY = ["studies"] as const;

export const useStudies = () =>
  useQuery({
    queryKey: STUDIES_QUERY_KEY,
    queryFn: fetchStudies,
    // Dataset is static (bundled JSON); keep it fresh forever in-session unless refetched manually.
    staleTime: Infinity,
    gcTime: Infinity,
  });
