import { clsx } from "clsx";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => (
  <div
    role="status"
    aria-label="Loading"
    className={clsx(
      "animate-spin rounded-full border-2 border-surface-border border-t-brand",
      "w-5 h-5",
      className,
    )}
  />
);
