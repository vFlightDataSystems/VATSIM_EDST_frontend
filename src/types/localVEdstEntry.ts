import { ApiAirportInfo } from "./apiAirportInfo";
import { ApiPreferentialDepartureRoute } from "./apiPreferentialDepartureRoute";
import { ApiPreferentialDepartureArrivalRoute } from "./apiPreferentialDepartureArrivalRoute";
import { ApiPreferentialArrivalRoute } from "./apiPreferentialArrivalRoute";
import { AclRouteDisplayOption } from "./aclRouteDisplayOption";

export type LocalVEdstEntry = {
  depInfo: ApiAirportInfo | null;
  destInfo: ApiAirportInfo | null;
  preferentialDepartureRoutes: ApiPreferentialDepartureRoute[];
  preferentialDepartureArrivalRoutes: ApiPreferentialDepartureArrivalRoute[];
  preferentialArrivalRoutes: ApiPreferentialArrivalRoute[];
  freeTextContent: string;
  vciStatus: -1 | 0 | 1; // vci status (-1: not acknowledged, 0: acknowledged but not on frequency, 1: on frequency)
  depStatus: -1 | 0 | 1; // departure flightplan status (-1: not acknowledged, 0: acknowledged but not checked, 1: verified)
  aclHighlighted: boolean;
  depHighlighted: boolean;
  aclRouteDisplay: AclRouteDisplayOption | null; // for toggling remarks
  remarksChecked: boolean; // whether remarks have been checked or not
  spa: boolean; // SPA indicator
  boundaryTime: number; // minutes until entering the sector's airspace (will be negative if already inside)
  pendingRemoval: number | null; // if not null, number represents timestamp when pendingRemoval status was activated
  scratchHdg: string | null; // speed assigned in the scratchpad
  scratchSpd: string | null; // heading assigned in the scratchpad
  showFreeText: boolean; // boolean whether to display the free text row or not
  voiceType?: string; // voice type in VATSIM flightplan, /v/ by default
  aclDisplay: boolean;
  aclDeleted: boolean;
  depDisplay: boolean;
  depDeleted: boolean;
  keep: boolean;
  uplinkEligible: boolean;
  assignedSpeed: string | null;
  assignedHeading: string | null;
  interimAltitude: number | null;
  previousRoute: string | null;
};
