"use client";

import { useStudies } from "@/query/studiesQuery";
import type { Study } from "@/types";
import { isStudyMatch } from "@/utils/filters";
import { computePagination } from "@/utils/pagination";
import { useStudyFilters } from "@/views/StudiesPage/Components/StudyFilters/useStudyFilters";

const EMPTY_STUDIES: readonly Study[] = [];

export const useStudyListState = () => {
  const { filters, page, setPage } = useStudyFilters();
  const { data, isLoading, isError, error, refetch } = useStudies();

  const studies = data?.studies.filter(isStudyMatch(filters)) ?? EMPTY_STUDIES;

  const total = studies.length;
  const { totalPages, safePage, start, end } = computePagination(total, page);

  return {
    pageStudies: studies.slice(start, end),
    total,
    start,
    end,
    isLoading,
    isError,
    error,
    refetch,
    safePage,
    totalPages,
    setPage,
  };
};
