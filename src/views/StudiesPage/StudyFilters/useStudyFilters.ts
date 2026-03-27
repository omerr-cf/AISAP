"use client";

import { useDebounce } from "@/hooks/useDebounce";
import type { LVEFFilter, StudyFilters } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface UseStudyFiltersReturn {
  readonly filters: StudyFilters;
  readonly searchInput: string;
  readonly setSearchInput: (v: string) => void;
  readonly setLVEFFilter: (v: LVEFFilter) => void;
}

export const useStudyFilters = (): UseStudyFiltersReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  const filters: StudyFilters = {
    query: searchParams.get("q") ?? "",
    lvef: (searchParams.get("lvef") ?? "all") as LVEFFilter,
  };

  // Sync debounced search → URL without a network request
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.replace(`/studies?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const setLVEFFilter = (value: LVEFFilter): void => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("lvef");
    } else {
      params.set("lvef", value);
    }
    params.set("page", "1");
    router.replace(`/studies?${params.toString()}`);
  };

  return { filters, searchInput, setSearchInput, setLVEFFilter };
};
