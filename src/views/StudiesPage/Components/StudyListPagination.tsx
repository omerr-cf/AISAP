"use client";

import { Button } from "@/shared/ui/Button";
import { getPaginationItems } from "@/utils/pagination";
import { useTranslation } from "react-i18next";

interface StudyListPaginationProps {
  readonly safePage: number;
  readonly totalPages: number;
  readonly setPage: (page: number) => void;
}

export const StudyListPagination = ({
  safePage,
  totalPages,
  setPage,
}: StudyListPaginationProps) => {
  const { t } = useTranslation();
  const pageItems = getPaginationItems(safePage, totalPages);

  return (
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
  );
};
