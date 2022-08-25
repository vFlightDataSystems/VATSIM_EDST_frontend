import { ApiPreferentialDepartureRoute } from "./apiTypes/apiPreferentialDepartureRoute";
import { ApiPreferentialArrivalRoute } from "./apiTypes/apiPreferentialArrivalRoute";
import { ApiPreferentialDepartureArrivalRoute } from "./apiTypes/apiPreferentialDepartureArrivalRoute";

export type EdstPreferentialRoute =
  | (ApiPreferentialDepartureRoute & { routeType: "pdr" })
  | (ApiPreferentialArrivalRoute & { routeType: "par" })
  | (ApiPreferentialDepartureArrivalRoute & { routeType: "pdar" });
