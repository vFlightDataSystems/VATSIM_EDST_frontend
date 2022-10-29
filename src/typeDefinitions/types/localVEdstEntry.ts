import { RouteDisplayOption } from "../enums/routeDisplayOption";
import { Nullable } from "../utility-types";

export class LocalVEdstEntry {
  freeTextContent = "";

  // -1: not acknowledged, 0: acknowledged but not on frequency, 1: on frequency
  vciStatus: -1 | 0 | 1 = -1;

  // -1: not acknowledged, 0: acknowledged but not checked, 1: verified
  depStatus: -1 | 0 | 1 = -1;

  highlighted = false;

  // what data to display in ACL route column
  routeDisplay: Nullable<RouteDisplayOption> = null;

  remarksChecked = false;

  spa = false;

  // minutes until entering the sector's airspace (will be negative if already inside)
  boundaryTime = 0;

  // if not null, number represents timestamp when pendingRemoval status was activated
  pendingRemoval: Nullable<number> = null;

  // speed assigned in the scratchpad
  scratchpadHeading: Nullable<string> = null;

  // heading assigned in the scratchpad
  scratchpadSpeed: Nullable<string> = null;

  showFreeText = false;

  voiceType?: string;

  deleted = false;

  keep = false;

  cpdlcCapable = false;

  assignedSpeed: Nullable<string> = null;

  assignedHeading: Nullable<string> = null;

  interimAltitude: Nullable<number> = null;

  previousRoute: Nullable<string> = null;
}
