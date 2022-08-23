import { AclRouteDisplayOption } from "../enums/aclRouteDisplayOption";

export class LocalVEdstEntry {
  freeTextContent = "";

  // -1: not acknowledged, 0: acknowledged but not on frequency, 1: on frequency
  vciStatus: -1 | 0 | 1 = -1;

  // -1: not acknowledged, 0: acknowledged but not checked, 1: verified
  depStatus: -1 | 0 | 1 = -1;

  aclHighlighted = false;

  depHighlighted = false;

  // what data to display in ACL route column
  aclRouteDisplay: AclRouteDisplayOption | null = null;

  remarksChecked = false;

  spa = false;

  // minutes until entering the sector's airspace (will be negative if already inside)
  boundaryTime = 0;

  // if not null, number represents timestamp when pendingRemoval status was activated
  pendingRemoval: number | null = null;

  // speed assigned in the scratchpad
  scratchpadHeading: string | null = null;

  // heading assigned in the scratchpad
  scratchpadSpeed: string | null = null;

  showFreeText = false;

  voiceType?: string;

  aclDisplay = false;

  aclDeleted = false;

  depDisplay = false;

  depDeleted = false;

  keep = false;

  cpdlcCapable = false;

  assignedSpeed: string | null = null;

  assignedHeading: string | null = null;

  interimAltitude: number | null = null;

  previousRoute: string | null = null;
}
