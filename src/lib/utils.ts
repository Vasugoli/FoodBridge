import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Server-safe HTML sanitizer.
 * Strips all HTML/script tags and encodes dangerous characters so that
 * user-supplied strings cannot inject markup when echoed back to clients.
 * Does NOT require jsdom / DOMPurify and works on any Node.js version.
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") return "";
  return input
    // Remove script/style contents entirely
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // Strip all remaining HTML tags
    .replace(/<[^>]*>/g, "")
    // Encode remaining dangerous characters
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}
