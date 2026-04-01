// PATCH /api/studies/[id]/status
// Updates a study's status directly in data/studies.json.
// Changes survive page refreshes and server restarts (until the container
// is rebuilt from a fresh image, which resets the file to its baked-in state).
import {
  RawStudiesSchema,
  StudyStatusSchema,
} from "@/lib/schemas/study.schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> => {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const status = StudyStatusSchema.parse(body.status);

    const filePath = path.join(process.cwd(), "data", "studies.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const studies = RawStudiesSchema.parse(JSON.parse(raw));

    const updated = studies.map((s) => (s.id === id ? { ...s, status } : s));
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));

    return NextResponse.json({ id, status });
  } catch (err) {
    console.error("[PATCH /api/studies/[id]/status]", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
};
