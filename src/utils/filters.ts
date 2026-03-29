// Pure filter predicates for Study domain — no React, no side effects
import type { Study, StudyFilters } from "@/types";
import { getLVEFCategory } from "@/utils/study";

export type Predicate<T> = (item: T) => boolean;

// ---------------------------------------------------------------------------
// Composed filter — single pass with early exit per study
// ---------------------------------------------------------------------------

export const isStudyMatch =
  (filters: Readonly<StudyFilters>): Predicate<Study> =>
  (study): boolean => {
    const { query, lvef } = filters;

    const nameMatches =
      !query || study.patientName.toLowerCase().includes(query);
    if (!nameMatches) return false;

    const lvefMatches = lvef === "all" || getLVEFCategory(study.lvef) === lvef;
    if (!lvefMatches) return false;

    return true;
  };
