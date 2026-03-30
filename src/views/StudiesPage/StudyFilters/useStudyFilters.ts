"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useHasMounted } from "@/hooks/useHasMounted";
import type { LVEFFilter, StudyFilters } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const useStudyFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ref (not searchParams in deps) avoids router.replace ↔ searchParams churn — infinite navigation loops.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  });

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);
  const hasMounted = useHasMounted();

  // Single source of truth: all URL params parsed in one place.
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const filters: StudyFilters = {
    query: (searchParams.get("q") ?? "").trim().toLowerCase(),
    lvef: (searchParams.get("lvef") ?? "all") as LVEFFilter,
  };

  // Only depends on router (stable). Reads current params via ref at call time.
  // null removes the key, string sets it.
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>): void => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) params.delete(key);
        else params.set(key, value);
      });
      const next = params.toString();
      const current = searchParamsRef.current.toString();
      if (next === current) return;
      router.replace(`/studies?${next}`, { scroll: false });
    },
    [router],
  );

  // Sync typed search to URL only after mount and only when debounced value differs from URL.
  // Avoids router.replace on hydration (was causing multi-pass flicker with useSearchParams).
  useEffect(() => {
    if (!hasMounted) return;
    const params = new URLSearchParams(searchParamsRef.current.toString());
    const currentQ = (params.get("q") ?? "").trim();
    const nextQ = debouncedSearch.trim();
    if (currentQ === nextQ) return;
    updateQueryParams({ q: debouncedSearch || null, page: "1" });
  }, [hasMounted, debouncedSearch, updateQueryParams]);

  const setLVEFFilter = (value: LVEFFilter): void =>
    updateQueryParams({ lvef: value === "all" ? null : value, page: "1" });

  const setPage = (newPage: number): void =>
    updateQueryParams({ page: String(newPage) });

  return {
    filters,
    page,
    searchInput,
    setSearchInput,
    setLVEFFilter,
    setPage,
  };
};
