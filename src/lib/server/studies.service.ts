import {
  RawStudiesSchema,
  type StudiesResponse,
} from "@/lib/schemas/study.schema";
import { promises as fs } from "fs";
import path from "path";

export const getStudies = async (): Promise<StudiesResponse> => {
  const filePath = path.join(process.cwd(), "data", "studies.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const studies = RawStudiesSchema.parse(JSON.parse(raw));
  return { studies, total: studies.length };
};
