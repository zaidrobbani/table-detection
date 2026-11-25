import { useMemo } from "react";
import {
  getClahe,
  getConfusion,
  getEksperimenA,
  getFigures,
  getHistory,
  getMetrics,
  getStats,
} from "@/repository/eksperimen/action";

/** Mengumpulkan seluruh data eksperimen lewat action repository. */
const useHasilEksperimenContainer = () => {
  return useMemo(
    () => ({
      metrics: getMetrics(),
      confusion: getConfusion(),
      stats: getStats(),
      history: getHistory(),
      clahe: getClahe(),
      figures: getFigures(),
      eksperimenA: getEksperimenA(),
    }),
    [],
  );
};

export default useHasilEksperimenContainer;
