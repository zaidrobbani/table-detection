import type { AxiosResponse } from "axios";
import { axiosPublic } from "@/lib/axios";
import { isMockApi } from "@/lib/env";
import { tryCatch } from "@/lib/try-catch";
import type {
  CompareResult,
  HealthResponse,
  PostComparePayload,
  PostPredictPayload,
  PredictResult,
} from "./dto";
import { mockCompare, mockHealth, mockPredict } from "./mock";

/** Nama berkas untuk bagian multipart bila Blob tidak punya nama. */
const namaBerkas = (file: Blob) =>
  file instanceof File && file.name ? file.name : "meja.png";

/** Jalankan permintaan axios; lempar ApiError (pesan Indonesia) bila gagal. */
const ambil = async <T>(request: Promise<AxiosResponse<T>>): Promise<T> => {
  const { data, error } = await tryCatch(request);
  if (error) throw error;
  return data.data;
};

export const GetHealth = async (): Promise<HealthResponse> => {
  if (isMockApi()) return mockHealth();
  return ambil(axiosPublic.get<HealthResponse>("/health"));
};

export const PostPredict = async ({
  file,
  model,
}: PostPredictPayload): Promise<PredictResult> => {
  if (isMockApi()) return mockPredict(file, model);
  const form = new FormData();
  form.append("file", file, namaBerkas(file));
  form.append("model", model);
  return ambil(axiosPublic.post<PredictResult>("/predict", form));
};

export const PostCompare = async ({
  file,
}: PostComparePayload): Promise<CompareResult> => {
  if (isMockApi()) return mockCompare(file);
  const form = new FormData();
  form.append("file", file, namaBerkas(file));
  return ambil(axiosPublic.post<CompareResult>("/compare", form));
};
