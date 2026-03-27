import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand";
  className?: string;
}

export const Badge = ({
  children,
  variant = "default",
  className,
}: BadgeProps) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variant === "brand" && "bg-brand/10 text-brand",
      variant === "default" && "bg-surface-border text-content-secondary",
      className,
    )}
  >
    {children}
  </span>
);
