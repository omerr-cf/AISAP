import { getStudies } from "@/lib/server/studies.service";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await getStudies();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/studies]", err);
    return NextResponse.json(
      { error: "Failed to load studies" },
      { status: 500 },
    );
  }
};
