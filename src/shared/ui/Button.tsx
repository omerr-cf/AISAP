import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      variant === "primary" && "bg-brand text-surface hover:bg-brand-dim",
      variant === "ghost" &&
        "text-content-secondary hover:text-content-primary hover:bg-surface-card",
      size === "md" && "px-4 py-2 text-sm",
      size === "sm" && "px-3 py-1.5 text-xs",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
