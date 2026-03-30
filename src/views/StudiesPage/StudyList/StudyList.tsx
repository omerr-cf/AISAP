"use client";

import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { toErrorMessage } from "@/utils/error";
import { getPaginationItems } from "@/utils/pagination";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { StudyCard } from "../StudyCard";
import { useStudyListState } from "./useStudyListState";

/** Matches loaded list + optional pagination row so height does not jump when data arrives. */
const LIST_SHELL = "flex min-h-[34rem] flex-col";

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
      <div className={LIST_SHELL} aria-label={t("common.loading")}>
        <div className="mb-3">
          <Skeleton className="h-4 w-48 max-w-full rounded" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        {/* Reserve space for pagination row (matches loaded + nav) */}
        <div
          className="mt-6 flex h-10 flex-wrap items-center justify-center gap-1"
          aria-hidden
        >
          <Skeleton className="h-9 w-14 rounded" />
          <Skeleton className="h-9 w-8 rounded" />
          <Skeleton className="h-9 w-8 rounded" />
          <Skeleton className="h-9 w-14 rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${LIST_SHELL} justify-center`}>
        <ErrorState message={toErrorMessage(error) ?? t("studies.loadError")} />
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

  const pageItems = getPaginationItems(safePage, totalPages);

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
          <StudyCard
            key={study.id}
            study={study}
            onClick={(id) => router.push(`/studies/${id}`)}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          className="mt-6 flex h-10 flex-wrap items-center justify-center gap-1"
          aria-label={t("pagination.navLabel")}
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

          {pageItems.map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`e-${idx}`}
                className="px-1.5 text-content-muted select-none"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === safePage ? "primary" : "ghost"}
                size="sm"
                onClick={() => setPage(item)}
                aria-current={item === safePage ? "page" : undefined}
                aria-label={t("pagination.pageLabel", { page: item })}
              >
                {item}
              </Button>
            ),
          )}

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
      ) : (
        <div className="mt-6 h-10 flex-shrink-0" aria-hidden />
      )}
    </div>
  );
};
