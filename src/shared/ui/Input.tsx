import { clsx } from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={clsx(
      "w-full rounded-lg bg-surface-card border border-surface-border",
      "px-3 py-2 text-sm text-content-primary placeholder:text-content-muted",
      "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
      "transition-colors",
      className,
    )}
    {...props}
  />
);
