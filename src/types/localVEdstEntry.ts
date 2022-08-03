import { ApiAirportInfo } from "./apiTypes/apiAirportInfo";
import { ApiPreferentialDepartureRoute } from "./apiTypes/apiPreferentialDepartureRoute";
import { ApiPreferentialDepartureArrivalRoute } from "./apiTypes/apiPreferentialDepartureArrivalRoute";
import { ApiPreferentialArrivalRoute } from "./apiTypes/apiPreferentialArrivalRoute";
import { AclRouteDisplayOption } from "../enums/aclRouteDisplayOption";

export type LocalVEdstEntry = {
  depInfo: ApiAirportInfo | null;
  destInfo: ApiAirportInfo | null;
  preferentialDepartureRoutes: ApiPreferentialDepartureRoute[];
  preferentialDepartureArrivalRoutes: ApiPreferentialDepartureArrivalRoute[];
  preferentialArrivalRoutes: ApiPreferentialArrivalRoute[];
  freeTextContent: string;
  // -1: not acknowledged, 0: acknowledged but not on frequency, 1: on frequency
  vciStatus: -1 | 0 | 1;
  // -1: not acknowledged, 0: acknowledged but not checked, 1: verified
  depStatus: -1 | 0 | 1;
  aclHighlighted: boolean;
  depHighlighted: boolean;
  // what data to display in ACL route column
  aclRouteDisplay: AclRouteDisplayOption | null;
  remarksChecked: boolean;
  spa: boolean;
  // minutes until entering the sector's airspace (will be negative if already inside)
  boundaryTime: number;
  // if not null, number represents timestamp when pendingRemoval status was activated
  pendingRemoval: number | null;
  // speed assigned in the scratchpad
  scratchHdg: string | null;
  // heading assigned in the scratchpad
  scratchSpd: string | null;
  showFreeText: boolean;
  voiceType?: string;
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
