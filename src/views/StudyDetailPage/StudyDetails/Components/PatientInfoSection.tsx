"use client";

import { Field } from "@/shared/ui/Field";
import { Section } from "@/shared/ui/Section";
import { useTranslation } from "react-i18next";

interface PatientInfoSectionProps {
  readonly patientName: string;
  readonly patientId: string;
}

export const PatientInfoSection = ({
  patientName,
  patientId,
}: PatientInfoSectionProps) => {
  const { t } = useTranslation();

  return (
    <Section title={t("study.patientInfo")}>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("study.name")}>{patientName}</Field>
        <Field label={t("study.patientId")}>{patientId}</Field>
      </div>
    </Section>
  );
};
