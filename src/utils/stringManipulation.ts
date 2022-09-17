export function removeStringFromEnd(str: string, end: string): string {
  return str.endsWith(end) ? str.slice(0, -end.length) : str;
}

export function removeStringFromStart(str: string, start: string): string {
  return str.startsWith(start) ? str.slice(start.length) : str;
}

/**
 * appends upward arrow to string, used for indicating a departure airport in a route
 * @param s
 */
export function appendUpArrowToString(s: string): string {
  return `${s}@`; // @ is uparrow in the font
}

/**
 * appends downward arrow to string, used for indicating a destination airport in a route
 * @param s
 */
export function appendDownArrowToString(s: string): string {
  return `${s}#`; // # is downarrow in the font
}

/**
 * format beacon code into 4 digit octal string
 * @param code
 */
export function convertBeaconCodeToString(code?: number | null): string {
  return String(code ?? 0).padStart(4, "0");
}
