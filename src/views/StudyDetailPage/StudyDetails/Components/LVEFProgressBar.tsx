"use client";

import type { LVEFProgressBarProps } from "@/types";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

export const LVEFProgressBar = ({
  lvef,
  lvefCategory,
}: LVEFProgressBarProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="h-2.5 rounded-full bg-surface-border overflow-hidden"
      role="progressbar"
      aria-valuenow={lvef}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={t("study.lvefProgress", { value: lvef })}
      aria-label={t("study.lvefProgress", { value: lvef })}
    >
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-500",
          lvefCategory === "normal" && "bg-lvef-normal",
          lvefCategory === "mildly_reduced" && "bg-lvef-mild",
          lvefCategory === "severely_reduced" && "bg-lvef-severe",
        )}
        style={{ width: `${lvef}%` }}
        aria-hidden="true"
      />
    </div>
  );
};
