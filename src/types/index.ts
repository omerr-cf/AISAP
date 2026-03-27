// Single import boundary for all domain types.
// Components import from here — never directly from lib/schemas.

export type {
  LVEFCategory,
  StudiesResponse,
  Study,
  StudyStatus,
} from "@/lib/schemas/study.schema";

export {
  getLVEFCategory,
  LVEF_CATEGORY_LABELS,
  STUDY_STATUS_LABELS,
} from "@/lib/schemas/study.schema";

// ---------------------------------------------------------------------------
// UI-only types — not part of the API schema
// ---------------------------------------------------------------------------

import type { LVEFCategory, Study } from "@/lib/schemas/study.schema";

export type LVEFFilter = LVEFCategory | "all";

export type StudyCardProps = Readonly<{
  study: Study;
  onClick?: (id: string) => void;
}>;

export type PaginationState = Readonly<{
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}>;

export type StudyFilters = Readonly<{
  query: string;
  lvef: LVEFFilter;
}>;
