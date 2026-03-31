"use client";

import { useUpdateStudyStatus } from "@/query/useUpdateStudyStatus";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Spinner } from "@/shared/ui/Spinner";
import { toErrorMessage } from "@/utils/error";
import { useTranslation } from "react-i18next";
import { LVEFSection } from "./Components/LVEFSection";
import { PatientInfoSection } from "./Components/PatientInfoSection";
import { StudyInfoSection } from "./Components/StudyInfoSection";
import { useStudyDetail } from "./useStudyDetail";

interface StudyDetailProps {
  readonly id: string;
}

export const StudyDetail = ({ id }: StudyDetailProps) => {
  const { t } = useTranslation();
  const { study, isLoading, isError, error, notFound, refetch } =
    useStudyDetail(id);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateStudyStatus();

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" aria-label={t("common.loading")} />
      </div>
    );

  if (isError)
    return (
      <ErrorState
        message={toErrorMessage(error) ?? t("study.loadError")}
        onRetry={() => void refetch()}
      />
    );

  if (notFound) return <ErrorState message={t("study.notFound")} />;

  const { patientName, patientId, studyDate, indication, lvef, status } =
    study!;

  return (
    <div className="flex flex-col gap-6">
      <PatientInfoSection patientName={patientName} patientId={patientId} />
      <StudyInfoSection
        studyDate={studyDate}
        indication={indication}
        status={status}
        isUpdating={isUpdating}
        onStatusUpdate={(s) => updateStatus({ id, status: s })}
      />
      <LVEFSection lvef={lvef} />
    </div>
  );
};
