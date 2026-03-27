"use client";

import { Button } from "@/shared/ui/Button";
import { useTranslation } from "react-i18next";

interface ErrorStateProps {
  readonly message?: string;
  readonly onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center gap-4 py-16 text-center"
      role="alert"
    >
      <span className="text-4xl text-lvef-severe" aria-hidden="true">
        ⚠
      </span>
      <p className="text-content-secondary max-w-sm">
        {message ?? t("common.error")}
      </p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
};
