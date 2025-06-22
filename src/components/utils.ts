// src/lib/utils.ts

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// `cn()` merges Tailwind classes conditionally and handles duplicates
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
