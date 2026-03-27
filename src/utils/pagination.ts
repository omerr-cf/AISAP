// Pure pagination computation — no React, no side effects
// pipe comes from fp-ts, not hand-rolled
import { pipe } from "fp-ts/function";

export const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const clamp =
  (min: number, max: number) =>
  (n: number): number =>
    Math.max(min, Math.min(max, n));

const toTotalPages = (total: number): number =>
  Math.max(1, Math.ceil(total / PAGE_SIZE));

// Pipeline: totalItems → totalPages → safe page → { start, end, safePage, totalPages }
export const computePagination = (totalItems: number, page: number) =>
  pipe(
    toTotalPages(totalItems),
    (totalPages) => ({
      totalPages,
      safePage: clamp(1, totalPages)(page),
    }),
    ({ totalPages, safePage }) => ({
      totalPages,
      safePage,
      start: (safePage - 1) * PAGE_SIZE,
      end: safePage * PAGE_SIZE,
    }),
  );
