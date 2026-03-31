"use client";

// ─── WHY URL PARAMS INSTEAD OF useState FOR FILTERS ──────────────────────────
// Filter state lives in the URL (?q=john&lvef=normal&page=2) rather than in
// React state. Benefits:
//  • Shareable / bookmarkable — a clinician can paste a filtered URL to a colleague
//  • Survives hard refresh — filters are not lost on F5
//  • Browser back/forward navigates through filter history naturally
// ──────────────────────────────────────────────────────────────────────────────

import { useDebounce } from "@/hooks/useDebounce";
import type { LVEFFilter, StudyFilters } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const useStudyFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── THE searchParamsRef TRICK ────────────────────────────────────────────
  // Problem: if we listed `searchParams` as a dependency of `updateQueryParams`
  // (the useCallback below), the chain would be:
  //   searchParams changes → updateQueryParams recreates → effect re-runs
  //   → router.replace fires → searchParams changes → … (infinite loop)
  //
  // Solution: store the latest searchParams in a ref. The ref is always current
  // (the bare useEffect updates it every render) but is NOT a reactive dependency,
  // so it doesn't trigger the recreation loop.
  // ──────────────────────────────────────────────────────────────────────────
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  });

  // searchInput drives the visible <input> value (controlled component).
  // debouncedSearch is what we actually write to the URL — waits 300 ms after
  // the user stops typing to avoid a router.replace on every keystroke.
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Parse all URL params in one place so every consumer reads the same values.
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const filters: StudyFilters = {
    query: (searchParams.get("q") ?? "").trim().toLowerCase(),
    lvef: (searchParams.get("lvef") ?? "all") as LVEFFilter,
  };

  // updateQueryParams is stable (depends only on `router` which never changes).
  // It reads the CURRENT params via ref at call time — not from the closure —
  // so it always merges on top of the latest URL state.
  // Passing null for a key removes it from the URL (keeps URLs clean).
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>): void => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) params.delete(key);
        else params.set(key, value);
      });
      const next = params.toString();
      const current = searchParamsRef.current.toString();
      // Short-circuit: if the params string is identical, skip router.replace
      // to avoid pushing a duplicate history entry and triggering a re-render.
      if (next === current) return;
      router.replace(`/studies?${next}`, { scroll: false });
    },
    [router],
  );

  // ─── queueMicrotask EXPLANATION ───────────────────────────────────────────
  // Why not just call updateQueryParams directly in the effect?
  // During the initial hydration render, React processes all effects synchronously.
  // Calling router.replace inside an effect during hydration can conflict with
  // Next.js's own URL reconciliation, causing a flicker or a double-render.
  // queueMicrotask defers the call until after the current paint cycle,
  // making the URL write safe to execute post-hydration.
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      const currentQ = (params.get("q") ?? "").trim();
      const nextQ = debouncedSearch.trim();
      if (currentQ === nextQ) return;
      updateQueryParams({ q: debouncedSearch || null, page: "1" });
    });
  }, [debouncedSearch, updateQueryParams]);

  // Reset page to 1 whenever a filter changes — prevents "page 5 of 2 pages" state.
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
