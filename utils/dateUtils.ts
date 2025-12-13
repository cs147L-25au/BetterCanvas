// utils/dateUtils.ts

/**
 * Returns a formatted time string (e.g., '3:45 PM') from a Date object.
 * Example:
 *   Input: new Date('2025-12-12T15:45:00')
 *   Output: '3:45 PM'
 */
export function getTimeStringFromDate(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
