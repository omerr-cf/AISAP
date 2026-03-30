import {
  StudiesResponseSchema,
  type StudiesResponse,
} from "@/lib/schemas/study.schema";

export const fetchStudies = async (): Promise<StudiesResponse> => {
  const res = await fetch("/api/studies");
  if (!res.ok) {
    throw new Error("Failed to load studies");
  }
  const data: unknown = await res.json();
  return StudiesResponseSchema.parse(data);
};
