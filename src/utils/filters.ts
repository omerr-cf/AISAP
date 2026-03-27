// Pure filter predicates for Study domain — no React, no side effects
import type { LVEFFilter, Study, StudyFilters } from "@/types";
import { getLVEFCategory } from "@/types";
import { allPass, type Predicate } from "@/utils/fp";

// ---------------------------------------------------------------------------
// Individual predicates
// ---------------------------------------------------------------------------

export const byName = (query: string): Predicate<Study> => {
  const q = query.trim().toLowerCase();
  return (study) => !q || study.patientName.toLowerCase().includes(q);
};

export const byLVEF =
  (category: LVEFFilter): Predicate<Study> =>
  (study) =>
    category === "all" || getLVEFCategory(study.lvef) === category;

// ---------------------------------------------------------------------------
// Composed filter — single pass over the array
// ---------------------------------------------------------------------------

export const filterStudies = (
  studies: ReadonlyArray<Study>,
  filters: Readonly<StudyFilters>,
): ReadonlyArray<Study> =>
  studies.filter(allPass(byName(filters.query), byLVEF(filters.lvef)));
