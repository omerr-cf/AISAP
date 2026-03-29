import {
  RawStudiesSchema,
  type StudiesResponse,
} from "@/lib/schemas/study.schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const GET = async (): Promise<
  NextResponse<StudiesResponse | { error: string }>
> => {
  try {
    const filePath = path.join(process.cwd(), "data", "studies.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const studies = RawStudiesSchema.parse(JSON.parse(raw));
    return NextResponse.json({ studies, total: studies.length });
  } catch (err) {
    console.error("[GET /api/studies]", err);
    return NextResponse.json(
      { error: "Failed to load studies" },
      { status: 500 },
    );
  }
};
