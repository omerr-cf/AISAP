"use client";

import { updateStudyStatus } from "@/api/updateStudyStatus";
import type { StudiesResponse, StudyStatus } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { STUDIES_QUERY_KEY } from "./studiesQuery";

export const useUpdateStudyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StudyStatus }) =>
      updateStudyStatus(id, status),

    // Rewrites the cache in place — both list and detail pages see the new
    // status instantly without a refetch.
    onSuccess: ({ id, status }) => {
      queryClient.setQueryData(
        STUDIES_QUERY_KEY,
        (old: StudiesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            studies: old.studies.map((s) =>
              s.id === id ? { ...s, status } : s,
            ),
          };
        },
      );
    },
  });
};
