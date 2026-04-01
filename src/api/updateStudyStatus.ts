import { UpdateStudyStatusResponseSchema } from "@/lib/schemas/study.schema";
import type { StudyStatus } from "@/types";

export const updateStudyStatus = async (
  id: string,
  status: StudyStatus,
): Promise<{ id: string; status: StudyStatus }> => {
  const res = await fetch(`/api/studies/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update study status");

  const data: unknown = await res.json();
  return UpdateStudyStatusResponseSchema.parse(data);
};
