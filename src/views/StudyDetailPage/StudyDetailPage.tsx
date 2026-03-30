"use client";

import { Header } from "@/shared/layout/Header";
import { Button } from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Spinner } from "@/shared/ui/Spinner";
import { toErrorMessage } from "@/utils/error";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { StudyDetail } from "./StudyDetail";
import { useStudyDetail } from "./useStudyDetail";

interface StudyDetailPageProps {
  readonly id: string;
}

export const StudyDetailPage = ({ id }: StudyDetailPageProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { study, isLoading, isError, error, notFound, refetch } =
    useStudyDetail(id);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6"
          aria-label={t("study.backToStudies")}
        >
          {t("study.backToStudies")}
        </Button>

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
