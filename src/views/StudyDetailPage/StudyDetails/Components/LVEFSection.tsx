"use client";

import { LVEFBadge } from "@/shared/studies/LVEFBadge";
import { Section } from "@/shared/ui/Section";
import { getLVEFCategory } from "@/utils/study";
import { useTranslation } from "react-i18next";
import { LVEFProgressBar } from "./LVEFProgressBar";

interface LVEFSectionProps {
  readonly lvef: number;
}

export const LVEFSection = ({ lvef }: LVEFSectionProps) => {
  const { t } = useTranslation();
  const lvefCategory = getLVEFCategory(lvef);

  return (
    <Section title={t("study.lvefSection")}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl font-bold text-content-primary">{lvef}%</span>
        <LVEFBadge lvef={lvef} />
      </div>
      <LVEFProgressBar lvef={lvef} lvefCategory={lvefCategory} />
    </Section>
  );
};
