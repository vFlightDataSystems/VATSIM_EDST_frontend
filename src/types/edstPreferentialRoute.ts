import { ApiPreferentialDepartureRoute } from "./apiPreferentialDepartureRoute";
import { ApiPreferentialArrivalRoute } from "./apiPreferentialArrivalRoute";
import { ApiPreferentialDepartureArrivalRoute } from "./apiPreferentialDepartureArrivalRoute";

export type EdstPreferentialRoute =
  | (ApiPreferentialDepartureRoute & { routeType: "pdr" })
  | (ApiPreferentialArrivalRoute & { routeType: "par" })
  | (ApiPreferentialDepartureArrivalRoute & { routeType: "pdar" });
