import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a valid Date or null. Never throws.
 */
export function toValidDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null
  const date = value instanceof Date ? value : new Date(value as string | number)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Safely format a date string/Date. Returns `fallback` for invalid/missing values.
 * Never throws "Invalid time value".
 */
export function safeFormatDate(
  value: unknown,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  fallback = "N/A",
): string {
  const date = toValidDate(value)
  if (!date) return fallback
  try {
    return date.toLocaleDateString("en-US", options)
  } catch {
    return fallback
  }
}

/**
 * Safely format a date+time. Returns `fallback` for invalid/missing values.
 */
export function safeFormatDateTime(value: unknown, fallback = "N/A"): string {
  const date = toValidDate(value)
  if (!date) return fallback
  try {
    return date.toLocaleString("en-US")
  } catch {
    return fallback
  }
}

/**
 * Safely format a relative time (e.g. "3 hours ago").
 * Returns `fallback` for invalid/missing values. Never throws.
 */
export function safeFormatDistanceToNow(value: unknown, fallback = "recently"): string {
  const date = toValidDate(value)
  if (!date) return fallback
  try {
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return fallback
  }
}

/**
 * Download a file and save it under the given filename (with extension).
 * Cloudinary raw uploads were historically stored without an extension, so a
 * plain link/window.open saved an extension-less, "unreadable" file. Fetching
 * as a blob and using the anchor `download` attribute restores the original
 * filename and extension for both old and new files.
 */
export async function downloadFile(fileUrl: string, fileName?: string): Promise<void> {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) throw new Error(`Download failed (${response.status})`)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = objectUrl
    anchor.download = fileName || fileUrl.split("/").pop() || "download"
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
  } catch {
    // Fallback: let the browser handle it directly
    window.open(fileUrl, "_blank")
  }
}

/**
 * Always returns an array. Useful before `.map()` on possibly-undefined API data.
 */
export function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}
