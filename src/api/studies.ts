import {
  StudiesResponseSchema,
  type StudiesResponse,
} from "@/lib/schemas/study.schema";
import axios from "axios";

export const fetchStudies = async (): Promise<StudiesResponse> => {
  const { data } = await axios.get<unknown>("/api/studies");
  return StudiesResponseSchema.parse(data);
};
