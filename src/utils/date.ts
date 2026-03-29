import { format, parseISO } from "date-fns";

// Append T00:00:00 so parseISO treats it as local time, not UTC midnight —
// prevents the "date shows as yesterday" bug in negative-offset timezones.
export const formatStudyDate = (dateStr: string, fmt = "MMM d, yyyy"): string =>
  format(parseISO(`${dateStr}T00:00:00`), fmt);

export const formatStudyDateLong = (dateStr: string): string =>
  formatStudyDate(dateStr, "MMMM d, yyyy");
