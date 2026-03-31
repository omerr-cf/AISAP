"use client";

import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { toErrorMessage } from "@/utils/error";
import { useTranslation } from "react-i18next";
import { StudyCard } from "./StudyCard";
import { StudyListPagination } from "./StudyListPagination";
import { StudyListSkeleton } from "./StudyListSkeleton";
import { useStudyListState } from "./useStudyListState";

/** Matches loaded list + optional pagination row so height does not jump when data arrives. */
const LIST_SHELL = "flex min-h-[34rem] flex-col";

export const StudyList = () => {
  const { t } = useTranslation();
  const {
    pageStudies,
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
  } = useStudyListState();

  if (isLoading) {
    return <StudyListSkeleton shellClass={LIST_SHELL} />;
  }

  if (isError) {
    return (
      <div className={`${LIST_SHELL} justify-center`}>
        <ErrorState
          message={toErrorMessage(error) ?? t("studies.loadError")}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (pageStudies.length === 0) {
    return (
      <div className={`${LIST_SHELL} justify-center`}>
        <EmptyState message={t("studies.noResults")} />
      </div>
    );
  }

  return (
    <div className={LIST_SHELL}>
      <p className="mb-3 text-xs text-content-muted">
        {t("studies.showing", {
          from: start + 1,
          to: Math.min(end, total),
          total,
        })}
      </p>

      <div className="flex flex-col gap-3">
        {pageStudies.map((study) => (
          <StudyCard key={study.id} {...study} />
        ))}
      </div>

      {totalPages > 1 ? (
        <StudyListPagination
          safePage={safePage}
          totalPages={totalPages}
          setPage={setPage}
        />
      ) : (
        <div className="mt-6 h-10 flex-shrink-0" aria-hidden />
      )}
    </div>
  );
};
