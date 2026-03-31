// In-memory status overrides — module-level Map shared across all requests on
// one server process. Resets when the container restarts, which is acceptable
// for this demo (no persistent database). In a production system this would
// be a database write.
import type { StudyStatus } from "@/types";

const overrides = new Map<string, StudyStatus>();

export const getStatusOverride = (id: string): StudyStatus | undefined =>
  overrides.get(id);

export const setStatusOverride = (id: string, status: StudyStatus): void => {
  overrides.set(id, status);
};
