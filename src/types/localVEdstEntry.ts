import { AclRouteDisplayOption } from "../enums/aclRouteDisplayOption";

export type LocalVEdstEntry = {
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
  scratchpadHeading: string | null;
  // heading assigned in the scratchpad
  scratchpadSpeed: string | null;
  showFreeText: boolean;
  voiceType?: string;
  aclDisplay: boolean;
  aclDeleted: boolean;
  depDisplay: boolean;
  depDeleted: boolean;
  keep: boolean;
  cpdlcCapable: boolean;
  assignedSpeed: string | null;
  assignedHeading: string | null;
  interimAltitude: number | null;
  previousRoute: string | null;
};
