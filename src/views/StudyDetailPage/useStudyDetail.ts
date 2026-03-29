"use client";

import { fetchStudies } from "@/api/studies";
import { STUDIES_QUERY_KEY } from "@/query/studiesQuery";
import { useQuery } from "@tanstack/react-query";

export const useStudyDetail = (id: string) => {
  const {
    data: study,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: STUDIES_QUERY_KEY,
    queryFn: fetchStudies,
    select: (res) => res.studies.find((s) => s.id === id),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    study,
    isLoading,
    isError,
    error,
    notFound: !isLoading && !study,
  };
};
