/**
 *
 * @param date optional date to use, otherwise a new Date object is created, so the current time will be returned
 */
export function getUtcMinutesAfterMidnight(date?: Date) {
  const _date = date ?? new Date();
  return _date.getUTCHours() * 60 + _date.getUTCMinutes();
}
