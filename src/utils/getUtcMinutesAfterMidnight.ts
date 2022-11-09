/**
 *
 * @param date optional date to use, otherwise a new Date object is created, so the current time will be returned
 */
export function getUtcMinutesAfterMidnight(date?: Date) {
  const now = date ?? new Date();
  return now.getUTCHours() * 60 + now.getUTCMinutes();
}
