// PATCH /api/studies/[id]/status
// Updates the status of a single study in the in-memory override store.
// The override persists for the lifetime of the server process and is applied
// by GET /api/studies on every subsequent list fetch.
import { StudyStatusSchema } from "@/lib/schemas/study.schema";
import { setStatusOverride } from "@/lib/statusStore";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateStatusBody = z.object({
  status: StudyStatusSchema,
});

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> => {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const { status } = UpdateStatusBody.parse(body);

    setStatusOverride(id, status);

    return NextResponse.json({ id, status });
  } catch (err) {
    console.error("[PATCH /api/studies/[id]/status]", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
};
