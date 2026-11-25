import { useMutation, useQuery } from "@tanstack/react-query";
import { GetHealth, PostCompare, PostPredict } from "./action";
import type {
  CompareResult,
  HealthResponse,
  PostComparePayload,
  PostPredictPayload,
  PredictResult,
} from "./dto";

export const prediksiKeys = {
  all: ["prediksi"] as const,
  health: ["prediksi", "health"] as const,
};

/** Selang polling health selama server belum warm / error. */
export const HEALTH_POLL_MS = 5000;

/**
 * Cek kesiapan server. Polling tiap 5 detik selama belum `warm` atau error,
 * berhenti begitu `warm === true`.
 */
export const useGetHealth = () => {
  return useQuery<HealthResponse, Error>({
    queryKey: prediksiKeys.health,
    queryFn: GetHealth,
    retry: false,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.warm === true ? false : HEALTH_POLL_MS,
  });
};

export const usePredict = () => {
  return useMutation<PredictResult, Error, PostPredictPayload>({
    mutationFn: (payload) => PostPredict(payload),
  });
};

export const useCompare = () => {
  return useMutation<CompareResult, Error, PostComparePayload>({
    mutationFn: (payload) => PostCompare(payload),
  });
};
