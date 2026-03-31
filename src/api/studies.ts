// ─── CLIENT-SIDE API BOUNDARY ─────────────────────────────────────────────────
// This is the ONLY place in the app that talks to the backend.
// React Query calls these functions via queryFn/mutationFn and owns the
// lifecycle (caching, retries, error state).  Components never call these directly.
// ──────────────────────────────────────────────────────────────────────────────

import {
  StudiesResponseSchema,
  type StudiesResponse,
} from "@/lib/schemas/study.schema";

export const fetchStudies = async (): Promise<StudiesResponse> => {
  const res = await fetch("/api/studies");

  // Check HTTP status before parsing. `res.json()` would succeed on a 500
  // response that returns `{ error: "..." }`, which would then fail Zod
  // validation with a confusing "required" error instead of a network error.
  if (!res.ok) {
    throw new Error("Failed to load studies");
  }

  // Type as `unknown`, not `any`. `any` skips type checking entirely.
  // `unknown` forces us to validate before using — exactly what Zod does next.
  const data: unknown = await res.json();

  // Zod parse at the trust boundary. If the server ever returns unexpected
  // shape (schema mismatch, missing field, wrong type), this throws a ZodError
  // with a precise path and message. React Query catches it and sets isError=true.
  // To debug: wrap in StudiesResponseSchema.safeParse(data) to get the full
  // error object without throwing, e.g. in a test or development console.
  return StudiesResponseSchema.parse(data);
};
