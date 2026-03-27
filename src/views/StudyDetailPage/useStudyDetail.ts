"use client";

import { STUDIES_QUERY_KEY, useStudies } from "@/query/studiesQuery";
import type { StudiesResponse, Study } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export const useStudyDetail = (id: string) => {
  const queryClient = useQueryClient();

  const cached = queryClient.getQueryData<StudiesResponse>(STUDIES_QUERY_KEY);
  const cachedStudy = cached?.studies.find((s: Study) => s.id === id);

  const { data, isLoading, isError, error } = useStudies();
  const study = cachedStudy ?? data?.studies.find((s) => s.id === id);

  return {
    study,
    isLoading: !cachedStudy && isLoading,
    isError,
    error,
    notFound: !isLoading && !study,
  };
};
