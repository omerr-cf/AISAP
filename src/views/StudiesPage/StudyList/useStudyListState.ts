"use client";

import { useStudies } from "@/query/studiesQuery";
import { isStudyMatch } from "@/utils/filters";
import { computePagination } from "@/utils/pagination";
import { useStudyFilters } from "@/views/StudiesPage/StudyFilters/useStudyFilters";


export const useStudyListState = () => {
  const { filters, page, setPage } = useStudyFilters();
  const { data, isLoading, isError, error } = useStudies();

  const studies = data?.studies.filter(isStudyMatch(filters)) ?? [];

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
    safePage,
    totalPages,
    setPage,
  };
};
