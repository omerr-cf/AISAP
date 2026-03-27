import {
  StudiesResponseSchema,
  type StudiesResponse,
} from "@/lib/schemas/study.schema";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const fetchStudies = async (): Promise<StudiesResponse> => {
  const { data } = await axios.get<unknown>(`${BASE_URL}/api/studies`);
  return StudiesResponseSchema.parse(data);
};
