import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const LVEFCategorySchema = z.enum([
  "normal", // >= 55%
  "mildly_reduced", // 40–54%
  "severely_reduced", // < 40%
]);

// Confirmed from studies.json — two statuses present
export const StudyStatusSchema = z.enum(["pending", "reviewed"]);

// ---------------------------------------------------------------------------
// Core domain schema — field names confirmed against studies.json
// ---------------------------------------------------------------------------

export const StudySchema = z.object({
  id: z.string(),
  patientName: z.string(),
  patientId: z.string(), // format: "P-XXXXX"
  studyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // "YYYY-MM-DD"
  indication: z.string(),
  lvef: z.number().int().min(0).max(100), // integer %, e.g. 67
  status: StudyStatusSchema,
  thumbnailUrl: z.string().url(),
});

// studies.json is a flat array — the route handler wraps it into { studies, total }
export const RawStudiesSchema = z.array(StudySchema);

// Shape returned by GET /api/studies
export const StudiesResponseSchema = z.object({
  studies: z.array(StudySchema),
  total: z.number(),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types — never written by hand
// ---------------------------------------------------------------------------

export type Study = z.infer<typeof StudySchema>;
export type StudiesResponse = z.infer<typeof StudiesResponseSchema>;
export type LVEFCategory = z.infer<typeof LVEFCategorySchema>;
export type StudyStatus = z.infer<typeof StudyStatusSchema>;

// ---------------------------------------------------------------------------
// Pure domain helpers
// ---------------------------------------------------------------------------

export function getLVEFCategory(lvef: number): LVEFCategory {
  if (lvef >= 55) return "normal";
  if (lvef >= 40) return "mildly_reduced";
  return "severely_reduced";
}

export const LVEF_CATEGORY_LABELS: Record<LVEFCategory, string> = {
  normal: "Normal (≥55%)",
  mildly_reduced: "Mildly Reduced (40–54%)",
  severely_reduced: "Severely Reduced (<40%)",
};

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
};
