"use client";

import { Header } from "@/shared/layout/Header";
import { clsx } from "clsx";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { StudyDetail } from "./StudyDetails/StudyDetail";

interface StudyDetailPageProps {
  readonly id: string;
}

export const StudyDetailPage = ({ id }: StudyDetailPageProps) => {
  const { t } = useTranslation();

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
        <StudyDetail id={id} />
      </main>
    </div>
  );
};
