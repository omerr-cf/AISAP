import { format } from "date-fns";

// Append T00:00:00 to avoid timezone shifts when parsing YYYY-MM-DD strings
export const formatStudyDate = (
  dateStr: string,
  fmt: string = "MMM d, yyyy",
): string => format(new Date(`${dateStr}T00:00:00`), fmt);

export const formatStudyDateLong = (dateStr: string): string =>
  formatStudyDate(dateStr, "MMMM d, yyyy");
