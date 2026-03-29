// Returns the error message string if err is an Error instance, otherwise null.
// Used to unwrap unknown catch values before passing to UI components.
export const toErrorMessage = (err: unknown): string | null =>
  err instanceof Error ? err.message : null;
