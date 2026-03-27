import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    aria-hidden="true"
    className={clsx(
      "animate-pulse rounded-xl bg-surface-card border border-surface-border",
      className,
    )}
  />
);
