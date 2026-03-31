"use client";

import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Section } from "@/shared/ui/Section";
import type { StudyStatus } from "@/types";
import { formatStudyDateLong } from "@/utils/date";
import { useTranslation } from "react-i18next";

interface StudyInfoSectionProps {
  readonly studyDate: string;
  readonly indication: string;
  readonly status: StudyStatus;
  readonly isUpdating: boolean;
  readonly onStatusUpdate: (status: StudyStatus) => void;
}

export const StudyInfoSection = ({
  studyDate,
  indication,
  status,
  isUpdating,
  onStatusUpdate,
}: StudyInfoSectionProps) => {
  const { t } = useTranslation();
  const formattedDate = formatStudyDateLong(studyDate);
  const nextStatus: StudyStatus = status === "pending" ? "reviewed" : "pending";

  return (
    <Section title={t("study.studyInfo")}>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("study.date")}>{formattedDate}</Field>
        <Field label={t("study.indication")}>{indication}</Field>
        <Field label={t("study.status")}>
          <div className="flex items-center gap-3">
            <Badge variant={status === "pending" ? "brand" : "default"}>
              {t(`status.${status}`)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusUpdate(nextStatus)}
              disabled={isUpdating}
              aria-label={t(
                status === "pending"
                  ? "study.markReviewed"
                  : "study.markPending",
              )}
            >
              {isUpdating
                ? t("study.updating")
                : t(
                    status === "pending"
                      ? "study.markReviewed"
                      : "study.markPending",
                  )}
            </Button>
          </div>
        </Field>
      </div>
    </Section>
  );
};
