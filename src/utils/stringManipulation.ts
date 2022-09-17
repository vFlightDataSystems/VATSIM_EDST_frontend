/**
 *
 * @param route
 * @param dest - destination airport
 * @returns {string} route string with destination removed from end of route
 */
export function removeDestFromRouteString(route: string, dest: string): string {
  if (route.endsWith(dest)) {
    route = route.slice(0, -dest.length);
  }
  return route;
}

export function removeDepFromRouteString(route: string, dep: string): string {
  if (route.startsWith(dep)) {
    route = route.slice(dep.length);
  }
  return route;
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
