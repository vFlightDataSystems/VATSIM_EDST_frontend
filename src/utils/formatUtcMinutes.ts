import { mod } from "./mod";

/**
 * given a number, representing minutes elapsed after midnight, give the corresponding UTC string HHMM format
 * @param minutes - minutes after midnight
 * @returns {string} - UTC time string in HHMM format
 */
export function formatUtcMinutes(minutes: number): string {
  return (
    Math.trunc(mod(minutes / 60, 24))
      .toString()
      .padStart(2, "0") + Math.trunc(mod(minutes, 60)).toString().padStart(2, "0")
  );
}
