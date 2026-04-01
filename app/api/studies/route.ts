// ─── HOW NEXT.JS ROUTE HANDLERS WORK ─────────────────────────────────────────
// This file lives at  app/api/studies/route.ts
// Next.js maps file-system path → HTTP endpoint:  GET /api/studies
//
// "Route Handlers" are server-side functions — they run on Node.js, never in the
// browser. Named exports (GET, POST, PUT, DELETE …) correspond to HTTP methods.
// When a client calls  fetch("/api/studies"), Next.js routes the request here.
//
// WHO calls this? Only  src/api/studies.ts  (the client-side fetch function).
// WHEN? Exactly once per session — React Query caches the response permanently
// (staleTime: Infinity) so no second call is ever made unless the user retries
// after an error.
// ──────────────────────────────────────────────────────────────────────────────

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
    // process.cwd() = Next.js project root, both in dev and in the Docker
    // standalone image (/app). This is safer than __dirname (which points to
    // the compiled .next output directory, not the project root).
    const filePath = path.join(process.cwd(), "data", "studies.json");
    const raw = await fs.readFile(filePath, "utf-8");

    // WHY RawStudiesSchema and not StudiesResponseSchema?
    // studies.json is a flat JSON array: [ { id, patientName, … }, … ]
    // RawStudiesSchema = z.array(StudySchema)  ← matches the file on disk.
    // StudiesResponseSchema = { studies: Study[], total: number }  ← the HTTP
    // response shape that the client expects. We build that shape below by
    // wrapping the parsed array. Using the wrong schema here would throw a
    // ZodError at startup because the file doesn't contain a `total` field.
    const studies = RawStudiesSchema.parse(JSON.parse(raw));

    return NextResponse.json({ studies, total: studies.length });
  } catch (err) {
    // Catches both file-system errors (file missing) and ZodError (schema mismatch).
    // The [GET /api/studies] prefix makes this easy to find in server logs.
    console.error("[GET /api/studies]", err);
    return NextResponse.json(
      { error: "Failed to load studies" },
      { status: 500 },
    );
  }
};
