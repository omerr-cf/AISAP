"use client";

import { LVEFBadge } from "@/shared/studies/LVEFBadge";
import { Badge } from "@/shared/ui/Badge";
import type { StudyCardProps } from "@/types";
import { formatStudyDate } from "@/utils/date";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export const StudyCard = ({ study }: StudyCardProps) => {
  const { t } = useTranslation();
  const formattedDate = formatStudyDate(study.studyDate);

  return (
    <Link
      href={`/studies/${study.id}`}
      aria-label={`Study for ${study.patientName}, ${formattedDate}`}
      className="group block rounded-xl border border-surface-border bg-surface-card p-4 transition-all hover:border-brand/40 hover:shadow-[0_0_0_1px_#7bf26c33] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <div className="flex items-start gap-4">
        <Image
          src={study.thumbnailUrl}
          alt=""
          aria-hidden="true"
          width={48}
          height={48}
          className="h-12 w-12 flex-shrink-0 rounded-lg bg-surface-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-content-primary transition-colors group-hover:text-brand">
                {study.patientName}
              </p>
              <p className="text-xs text-content-muted">{study.patientId}</p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
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
    </Link>
  );
};
