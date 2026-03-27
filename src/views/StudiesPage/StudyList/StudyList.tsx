"use client";

import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { StudyCard } from "../StudyCard";
import { useStudyListState } from "./useStudyListState";

export const StudyList = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    pageStudies,
    total,
    start,
    end,
    isLoading,
    isError,
    error,
    safePage,
    totalPages,
    setPage,
  } = useStudyListState();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-label={t("common.loading")}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : t("studies.loadError")
        }
      />
    );
  }

  if (pageStudies.length === 0) {
    return <EmptyState message={t("studies.noResults")} />;
  }

  return (
    <div>
      <p className="text-xs text-content-muted mb-3">
        {t("studies.showing", {
          from: start + 1,
          to: Math.min(end, total),
          total,
        })}
      </p>

      <div className="flex flex-col gap-3">
        {pageStudies.map((study) => (
          <StudyCard
            key={study.id}
            study={study}
            onClick={(id) => router.push(`/studies/${id}`)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-6 flex items-center justify-center gap-1"
          aria-label="Pagination"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(safePage - 1)}
            disabled={safePage <= 1}
            aria-label={t("pagination.prev")}
          >
            {t("pagination.prev")}
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === safePage ? "primary" : "ghost"}
              size="sm"
              onClick={() => setPage(p)}
              aria-current={p === safePage ? "page" : undefined}
              aria-label={t("pagination.pageLabel", { page: p })}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(safePage + 1)}
            disabled={safePage >= totalPages}
            aria-label={t("pagination.next")}
          >
            {t("pagination.next")}
          </Button>
        </nav>
      )}
    </div>
  );
};
