// ─── ZOD SCHEMA — SINGLE SOURCE OF TRUTH ─────────────────────────────────────
// All TypeScript types for Study data are INFERRED from these schemas via
// z.infer<typeof …>. We never write types by hand alongside schemas because they
// would drift: the schema validates runtime values; the type covers compile time.
// Keeping them as one thing eliminates an entire class of bugs.
//
// HOW TO DEBUG ZOD ERRORS AT RUNTIME:
//   • .parse(data)       — throws ZodError on invalid data (used in production)
//   • .safeParse(data)   — returns { success, data } | { success: false, error }
//                          (use this in tests or when you want to inspect errors)
//
// Example — trigger and inspect a parse error in a browser/Node console:
//   import { StudySchema } from "@/lib/schemas/study.schema";
//   const result = StudySchema.safeParse({ id: 1 }); // id should be string
//   if (!result.success) console.log(result.error.issues);
//   // → [{ code: "invalid_type", expected: "string", received: "number", path: ["id"] }]
//
// HOW TO MOCK A VALID STUDY IN TESTS:
//   const mockStudy: Study = {
//     id: "1", patientName: "Test Patient", patientId: "P-00001",
//     studyDate: "2025-01-15", indication: "Chest pain", lvef: 60,
//     status: "pending", thumbnailUrl: "https://picsum.photos/seed/test/150/150",
//   };
// ──────────────────────────────────────────────────────────────────────────────

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

// Shape returned by PATCH /api/studies/[id]/status
export const UpdateStudyStatusResponseSchema = z.object({
  id: z.string(),
  status: StudyStatusSchema,
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types — never written by hand
// ---------------------------------------------------------------------------

export type Study = z.infer<typeof StudySchema>;
export type StudiesResponse = z.infer<typeof StudiesResponseSchema>;
export type LVEFCategory = z.infer<typeof LVEFCategorySchema>;
export type StudyStatus = z.infer<typeof StudyStatusSchema>;
