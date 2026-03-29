import { getLVEFCategory, LVEF_CATEGORY_LABELS } from "@/utils/study";
import { clsx } from "clsx";

interface LVEFBadgeProps {
  lvef: number;
}

export const LVEFBadge = ({ lvef }: LVEFBadgeProps) => {
  const category = getLVEFCategory(lvef);
  const label = LVEF_CATEGORY_LABELS[category];

  return (
    <span
      title={label}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        category === "normal" && "bg-lvef-normal/15 text-lvef-normal",
        category === "mildly_reduced" && "bg-lvef-mild/15 text-lvef-mild",
        category === "severely_reduced" && "bg-lvef-severe/15 text-lvef-severe",
      )}
    >
      {/* Dot — color is the accent, text label is the primary indicator */}
      <span
        aria-hidden="true"
        className={clsx(
          "inline-block h-1.5 w-1.5 rounded-full",
          category === "normal" && "bg-lvef-normal",
          category === "mildly_reduced" && "bg-lvef-mild",
          category === "severely_reduced" && "bg-lvef-severe",
        )}
      />
      {lvef}% · {label}
    </span>
  );
};
