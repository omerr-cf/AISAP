"use client";

import { Header } from "@/shared/layout/Header";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Spinner } from "@/shared/ui/Spinner";
import { toErrorMessage } from "@/utils/error";
import { clsx } from "clsx";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { StudyDetail } from "./StudyDetail";
import { useStudyDetail } from "./useStudyDetail";

interface StudyDetailPageProps {
  readonly id: string;
}

export const StudyDetailPage = ({ id }: StudyDetailPageProps) => {
  const { t } = useTranslation();
  const { study, isLoading, isError, error, notFound, refetch } =
    useStudyDetail(id);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/studies"
          className={clsx(
            "mb-6 inline-flex items-center justify-center rounded-lg font-medium transition-colors",
            "text-content-secondary hover:bg-surface-card hover:text-content-primary",
            "px-3 py-1.5 text-xs",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          )}
          aria-label={t("study.backToStudies")}
        >
          {t("study.backToStudies")}
        </Link>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner className="w-8 h-8" aria-label={t("common.loading")} />
          </div>
        )}
        {isError && (
          <ErrorState
            message={toErrorMessage(error) ?? t("study.loadError")}
            onRetry={() => void refetch()}
          />
        )}
        {notFound && <ErrorState message={t("study.notFound")} />}
        {study && <StudyDetail study={study} />}
      </main>
    </div>
  );
};
