"use client";

import { LVEFBadge } from "@/shared/studies/LVEFBadge";
import { Badge } from "@/shared/ui/Badge";
import { Field } from "@/shared/ui/Field";
import { Section } from "@/shared/ui/Section";
import type { Study } from "@/types";
import { getLVEFCategory } from "@/types";
import { formatStudyDateLong } from "@/utils/date";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

interface StudyDetailProps {
  readonly study: Study;
}

export const StudyDetail = ({ study }: StudyDetailProps) => {
  const { t } = useTranslation();
  const formattedDate = formatStudyDateLong(study.studyDate);
  const lvefCategory = getLVEFCategory(study.lvef);

  return (
    <div className="flex flex-col gap-6">
      <Section title={t("study.patientInfo")}>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("study.name")}>{study.patientName}</Field>
          <Field label={t("study.patientId")}>{study.patientId}</Field>
        </div>
      </Section>

      <Section title={t("study.studyInfo")}>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("study.date")}>{formattedDate}</Field>
          <Field label={t("study.indication")}>{study.indication}</Field>
          <Field label={t("study.status")}>
            <Badge variant={study.status === "pending" ? "brand" : "default"}>
              {t(`status.${study.status}`)}
            </Badge>
          </Field>
        </div>
      </Section>

      <Section title={t("study.lvefSection")}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl font-bold text-content-primary">
            {study.lvef}%
          </span>
          <LVEFBadge lvef={study.lvef} />
        </div>
        <div
          className="h-2.5 rounded-full bg-surface-border overflow-hidden"
          aria-hidden="true"
        >
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500",
              lvefCategory === "normal" && "bg-lvef-normal",
              lvefCategory === "mildly_reduced" && "bg-lvef-mild",
              lvefCategory === "severely_reduced" && "bg-lvef-severe",
            )}
            style={{ width: `${study.lvef}%` }}
            role="progressbar"
            aria-valuenow={study.lvef}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`LVEF: ${study.lvef}%`}
          />
        </div>
      </Section>
    </div>
  );
};
