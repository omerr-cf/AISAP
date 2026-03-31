"use client";

import { Header } from "@/shared/layout/Header";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { StudyFilters } from "./Components/StudyFilters/StudyFilters";
import { StudyList } from "./Components/StudyList";

export const StudiesPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-content-primary">
            {t("studies.title")}
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            {t("studies.subtitle")}
          </p>
        </div>
        <div className="mb-6">
          <Suspense>
            <StudyFilters />
          </Suspense>
        </div>
        <Suspense>
          <StudyList />
        </Suspense>
      </main>
    </div>
  );
};
