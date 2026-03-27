// FP primitives (pipe, flow, etc.) come from fp-ts — never hand-rolled.
// import { pipe } from 'fp-ts/function'
//
// This file only houses domain-specific combinators that fp-ts doesn't provide.

// allPass: returns true when ALL predicates pass — used for single-pass filtering.
// More efficient than chained .filter() calls (one array iteration, not N).
export type Predicate<T> = (value: T) => boolean;

export const allPass =
  <T>(...predicates: ReadonlyArray<Predicate<T>>) =>
  (value: T): boolean =>
    predicates.every((pred) => pred(value));
