"use client";

import { Skeleton } from "@/shared/ui/Skeleton";
import { useTranslation } from "react-i18next";

interface StudyListSkeletonProps {
  readonly shellClass: string;
}

export const StudyListSkeleton = ({ shellClass }: StudyListSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <div className={shellClass} aria-label={t("common.loading")}>
      <div className="mb-3">
        <Skeleton className="h-4 w-48 max-w-full rounded" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {/* Reserve space for pagination row */}
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
};
