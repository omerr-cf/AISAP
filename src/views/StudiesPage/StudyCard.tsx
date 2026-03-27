"use client";

import { LVEFBadge } from "@/shared/studies/LVEFBadge";
import { Badge } from "@/shared/ui/Badge";
import type { Study } from "@/types";
import { formatStudyDate } from "@/utils/date";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface StudyCardProps {
  readonly study: Study;
  readonly onClick: (id: string) => void;
}

export const StudyCard = ({ study, onClick }: StudyCardProps) => {
  const { t } = useTranslation();
  const formattedDate = formatStudyDate(study.studyDate);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(study.id)}
      onKeyDown={(e) => e.key === "Enter" && onClick(study.id)}
      aria-label={`Study for ${study.patientName}, ${formattedDate}`}
      className="group cursor-pointer rounded-xl border border-surface-border bg-surface-card p-4 transition-all hover:border-brand/40 hover:shadow-[0_0_0_1px_#7bf26c33] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface"
    >
      <div className="flex items-start gap-4">
        <Image
          src={study.thumbnailUrl}
          alt=""
          aria-hidden="true"
          width={48}
          height={48}
          className="h-12 w-12 rounded-lg object-cover bg-surface-border flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="font-semibold text-content-primary group-hover:text-brand transition-colors truncate">
                {study.patientName}
              </p>
              <p className="text-xs text-content-muted">{study.patientId}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <LVEFBadge lvef={study.lvef} />
              <Badge variant={study.status === "pending" ? "brand" : "default"}>
                {t(`status.${study.status}`)}
              </Badge>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-content-secondary">
            <span>{formattedDate}</span>
            <span className="text-surface-border" aria-hidden="true">
              ·
            </span>
            <span>{study.indication}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
