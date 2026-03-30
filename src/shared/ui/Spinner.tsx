"use client";

import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

interface SpinnerProps {
  readonly className?: string;
  readonly "aria-label"?: string;
}

export const Spinner = ({
  className,
  "aria-label": ariaLabel,
}: SpinnerProps) => {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-label={ariaLabel ?? t("common.loading")}
      className={clsx(
        "animate-spin rounded-full border-2 border-surface-border border-t-brand",
        "w-5 h-5",
        className,
      )}
    />
  );
};
