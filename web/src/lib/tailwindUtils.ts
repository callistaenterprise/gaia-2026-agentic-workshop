import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility for merging Tailwind CSS class names conditionally.
// Uses clsx to handle conditional classes and tailwind-merge to resolve
// conflicts between Tailwind utilities (e.g. p-2 vs p-4 — last one wins).
export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
