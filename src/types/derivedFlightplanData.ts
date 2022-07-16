import { RouteFix } from "./routeFix";

export type DerivedFlightplanData = {
  formattedRoute: string; // formatted route string
  routeFixes: RouteFix[];
  currentRoute: string; // shortened route string, starting at the next inbound fix
  currentRouteFixes?: RouteFix[];
};
