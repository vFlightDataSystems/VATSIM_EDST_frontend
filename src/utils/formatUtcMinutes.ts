import { mod } from "~/utils/mod";
import { getUtcMinutesAfterMidnight } from "~/utils/getUtcMinutesAfterMidnight";

/**
 * given a number, representing minutes elapsed after midnight, give the corresponding UTC string HHMM format
 * @param minutes - minutes after midnight
 * @returns {string} - UTC time string in HHMM format
 */
export function formatUtcMinutes(minutes?: number): string {
  const mins = minutes ?? getUtcMinutesAfterMidnight();
  return (
    Math.trunc(mod(mins / 60, 24))
      .toString()
      .padStart(2, "0") + Math.trunc(mod(mins, 60)).toString().padStart(2, "0")
  );
}
