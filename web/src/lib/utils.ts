import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gabungkan class Tailwind tanpa konflik. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
