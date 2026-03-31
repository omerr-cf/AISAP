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
    refetch,
  } = useQuery({
    // Using the SAME query key as useStudies (list page).
    // React Query's cache is keyed by queryKey. Because we use STUDIES_QUERY_KEY
    // here too, this query SHARES the same cache entry as the study list.
    //
    // Consequence: if the user navigated from the list, the cache is already warm
    // and `select` runs immediately — zero HTTP calls for the detail view.
    // If the user opens this URL directly (cold cache), React Query fetches the
    // full list once, then `select` derives the single study from it. Either way,
    // there is only ever ONE network request for studies in the entire session.
    queryKey: STUDIES_QUERY_KEY,
    queryFn: fetchStudies,
    // `select` transforms the cached response into what this component needs.
    // React Query memoises the selector — it only re-runs if the underlying
    // cache data or the selector function reference changes.
    select: (res) => res.studies.find((s) => s.id === id),
    // Static dataset from disk — no automatic refetch window.
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    study,
    isLoading,
    isError,
    error,
    refetch,
    // notFound is only true once loading AND error are both resolved (false).
    // Without the `!isError` guard, a failed fetch would set study=undefined AND
    // notFound=true simultaneously, causing two error messages to render.
    notFound: !isLoading && !isError && !study,
  };
};
