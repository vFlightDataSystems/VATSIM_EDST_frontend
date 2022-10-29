import type { ApiPreferentialDepartureRoute } from "./apiTypes/apiPreferentialDepartureRoute";
import type { ApiPreferentialArrivalRoute } from "./apiTypes/apiPreferentialArrivalRoute";
import type { ApiPreferentialDepartureArrivalRoute } from "./apiTypes/apiPreferentialDepartureArrivalRoute";

export type EdstPreferentialRoute =
  | (ApiPreferentialDepartureRoute & { routeType: "pdr" })
  | (ApiPreferentialArrivalRoute & { routeType: "par" })
  | (ApiPreferentialDepartureArrivalRoute & { routeType: "pdar" });
