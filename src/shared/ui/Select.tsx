import { clsx } from "clsx";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className, children, ...props }: SelectProps) => (
  <select
    className={clsx(
      "rounded-lg bg-surface-card border border-surface-border",
      "px-3 py-2 text-sm text-content-primary",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-transparent",
      "transition-colors cursor-pointer",
      className,
    )}
    {...props}
  >
    {children}
  </select>
);
