"use client";

import { useDebounce } from "@/hooks/useDebounce";
import type { LVEFFilter, StudyFilters } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";


export const useStudyFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ref keeps the latest searchParams readable inside callbacks without
  // making it a useCallback dependency — breaks the searchParams → recreate
  // → effect → router.replace → searchParams → ... infinite loop.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  });

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

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
      router.replace(`/studies?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    updateQueryParams({ q: debouncedSearch || null, page: "1" });
  }, [debouncedSearch, updateQueryParams]);

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
