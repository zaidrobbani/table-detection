import axios from "axios";
import { API_TIMEOUT_MS, BASE_API_URL } from "@/lib/env";

/**
 * Klien axios untuk backend FastAPI.
 * Content-Type sengaja tidak diset: untuk FormData axios/browser mengisi
 * `multipart/form-data` beserta boundary-nya sendiri.
 */
export const axiosPublic = axios.create({
  baseURL: BASE_API_URL,
  timeout: API_TIMEOUT_MS,
});
