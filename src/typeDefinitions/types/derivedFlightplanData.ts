import type { RouteFix } from "types/routeFix";

export type DerivedFlightplanData = {
  formattedRoute: string;
  routeFixes: RouteFix[];
  // shortened route string, starting at the next inbound fix
  currentRoute: string;
  // route fixes for currentRoute
  currentRouteFixes?: RouteFix[];
};
