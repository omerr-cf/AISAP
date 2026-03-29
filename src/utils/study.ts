// Domain helpers and UI constants for the Study entity.
// Kept separate from lib/schemas so the schema file is pure Zod/types.
import type { LVEFCategory, StudyStatus } from "@/lib/schemas/study.schema";

export const getLVEFCategory = (lvef: number): LVEFCategory => {
  if (lvef >= 55) return "normal";
  if (lvef >= 40) return "mildly_reduced";
  return "severely_reduced";
};

export const LVEF_CATEGORY_LABELS: Record<LVEFCategory, string> = {
  normal: "Normal (≥55%)",
  mildly_reduced: "Mildly Reduced (40–54%)",
  severely_reduced: "Severely Reduced (<40%)",
};

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
};
