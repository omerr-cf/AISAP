"use client";

import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  readonly message?: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-content-muted text-sm">
        {message ?? t("studies.noResults")}
      </p>
    </div>
  );
};
