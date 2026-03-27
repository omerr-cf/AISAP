"use client";

import { useStudies } from "@/query/studiesQuery";
import type { LVEFFilter, Study, StudyFilters } from "@/types";
import { filterStudies } from "@/utils/filters";
import { computePagination } from "@/utils/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface UseStudyListStateReturn {
  readonly pageStudies: ReadonlyArray<Study>;
  readonly total: number;
  readonly start: number;
  readonly end: number;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: unknown;
  readonly safePage: number;
  readonly totalPages: number;
  readonly setPage: (page: number) => void;
}

export const useStudyListState = (): UseStudyListStateReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const filters: StudyFilters = {
    query: searchParams.get("q") ?? "",
    lvef: (searchParams.get("lvef") ?? "all") as LVEFFilter,
  };

  const { data, isLoading, isError, error } = useStudies();

  const studies = useMemo(
    () => (data ? filterStudies(data.studies, filters) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filters.query, filters.lvef],
  );

  const total = studies.length;
  const { totalPages, safePage, start, end } = computePagination(total, page);

  const setPage = (newPage: number): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`/studies?${params.toString()}`);
  };

  return {
    pageStudies: studies.slice(start, end),
    total,
    start,
    end,
    isLoading,
    isError,
    error,
    safePage,
    totalPages,
    setPage,
  };
};
