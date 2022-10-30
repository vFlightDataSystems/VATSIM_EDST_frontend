import type { ApiPreferentialDepartureRoute } from "types/apiTypes/apiPreferentialDepartureRoute";
import type { ApiPreferentialArrivalRoute } from "types/apiTypes/apiPreferentialArrivalRoute";
import type { ApiPreferentialDepartureArrivalRoute } from "types/apiTypes/apiPreferentialDepartureArrivalRoute";

export type EdstPreferentialRoute =
  | (ApiPreferentialDepartureRoute & { routeType: "pdr" })
  | (ApiPreferentialArrivalRoute & { routeType: "par" })
  | (ApiPreferentialDepartureArrivalRoute & { routeType: "pdar" });
