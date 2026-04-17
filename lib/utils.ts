import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function sanitizeFilename(input: string): string {
  return input.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 64);
}
