import type { ApiAdaptedDepartureRoute } from "types/apiTypes/apiAdaptedDepartureRoute";
import type { ApiAdaptedArrivalRoute } from "types/apiTypes/apiAdaptedArrivalRoute";
import type { ApiAdaptedDepartureArrivalRoute } from "types/apiTypes/apiAdaptedDepartureArrivalRoute";

export type EdstAdaptedRoute =
  | (ApiAdaptedDepartureRoute & { routeType: "adr" })
  | (ApiAdaptedArrivalRoute & { routeType: "aar" })
  | (ApiAdaptedDepartureArrivalRoute & { routeType: "adar" });
