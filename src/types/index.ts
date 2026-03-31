// Single import boundary for all domain types.
// Components import from here — never directly from lib/schemas.

export type {
  LVEFCategory,
  StudiesResponse,
  Study,
  StudyStatus,
} from "@/lib/schemas/study.schema";

// ---------------------------------------------------------------------------
// UI-only types — not part of the API schema
// ---------------------------------------------------------------------------

import type { LVEFCategory } from "@/lib/schemas/study.schema";

export type LVEFFilter = LVEFCategory | "all";

export type StudyFilters = Readonly<{
  query: string;
  lvef: LVEFFilter;
}>;

export type LVEFProgressBarProps = {
  readonly lvef: number;
  readonly lvefCategory: LVEFCategory;
};
