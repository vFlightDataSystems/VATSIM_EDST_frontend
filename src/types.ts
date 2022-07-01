import { Position } from "@turf/turf";

// flightplan data
export type Flightplan = {
  aircraftId: string;
  cid: string;
  altitude: string;
  assignedBeaconCode: number | null;
  departure: string;
  destination: string;
  alternate: string;
  route: string;
  equipment: string;
  estimatedDepartureTime: number;
  actualDepartureTime: number;
  fuelHours: number;
  fuelMinutes: number;
  hoursEnroute: number;
  minutesEnroute: number;
  isIfr: boolean;
  pilotCid: string;
  remarks: string;
  revision: string;
  speed: number;
};

export type DerivedFlightplanData = {
  formattedRoute: string; // formatted route string
  routeFixes: RouteFix[];
  currentRoute: string; // shortened route string, starting at the next inbound fix
  currentRouteFixes?: RouteFix[];
};

export type AircraftTrack = {
  aircraftId: string;
  altitudeAgl: number;
  altitudeTrue: number;
  groundSpeed: number;
  location: {
    lat: number;
    lon: number;
  };
  typeCode: string;
  interimAltitude?: number;
  lastUpdated?: number;
};

export type AirportInfo = {
  artcc: string;
  code: string;
  icao: string;
  lat: number;
  lon: number;
};

export type PreferentialArrivalRoute = {
  destination: string;
  amendment: string;
  triggeredFix: string;
  eligible: boolean;
  rnavRequired: boolean;
  truncatedRoute: string;
  order: number;
  routeGroups: string[];
};

export type PreferentialDepartureRoute = {
  departure: string;
  amendment: string;
  triggeredFix: string;
  eligible: boolean;
  rnavRequired: boolean;
  truncatedRoute: string;
  order: number;
  routeGroups: string[];
};

export type PreferentialDepartureArrivalRoute = {
  route: string;
  departure: string;
  destination: string;
  eligible: boolean;
  rnavRequired: boolean;
  order: number;
  routeGroups: string[];
};

// TODO: type all `any` types
// local data for a single EDST entry
export type LocalVEdstEntry = {
  depInfo: AirportInfo | null;
  destInfo: AirportInfo | null;
  nasSuffix: string | null;
  preferentialDepartureRoutes: PreferentialDepartureRoute[];
  preferentialDepartureArrivalRoutes: PreferentialDepartureArrivalRoute[];
  preferentialArrivalRoutes: PreferentialArrivalRoute[];
  freeTextContent: string;
  vciStatus: number; // vci status (-1: not acknowledged, 0: acknowledged but not on frequency, 1: on frequency)
  depStatus: number; // departure flightplan status (-1: not acknowledged, 0: acknowledged but not checked, 1: verified)
  aclHighlighted?: boolean;
  depHighlighted?: boolean;
  aclRouteDisplay?: string | null; // for toggling remarks
  remarksChecked?: boolean; // whether remarks have been checked or not
  spa: boolean; // SPA indicator
  boundaryTime: number; // minutes until entering the sector's airspace (will be negative if already inside)
  pendingRemoval?: number | null; // if not null, number represents timestamp when pendingRemoval status was activated
  scratchHdg?: string; // speed assigned in the scratchpad
  scratchSpd?: string; // heading assigned in the scratchpad
  showFreeText?: boolean; // boolean whether to display the free text row or not
  voiceType?: string; // voice type in VATSIM flightplan, /v/ by default
  aclDisplay: boolean;
  aclDeleted: boolean;
  depDisplay: boolean;
  depDeleted: boolean;
  uplinkEligible?: boolean;
  holdData: Record<string, any> | null;
  assignedSpeed?: string;
  assignedHeading?: string;
  interimAltitude?: number;
  previousRoute?: string;
};

// type for a single EDST entry
export type LocalEdstEntry = Flightplan & DerivedFlightplanData & LocalVEdstEntry;

// TODO: make type an enum
export type Fix = {
  name: string;
  type: string;
  waypoint_id: string;
  lat: string | number;
  lon: string | number;
};

// TODO: make type an enum
export type AirwayFix = {
  airway: string; // TODO: eventually remove this
  wpt: string;
  type: string;
  sequence: string;
  lat: string | number;
  lon: string | number;
};

export type RouteFix = {
  name: string;
  pos: Position;
  dist?: number;
  minutesAtFix?: number;
};

export type Navaid = {
  navaid_id: string;
  type: string;
  name: string;
  lat: string;
  lon: string;
  artcc_low: string;
  artcc_high: string;
};

export type EdstPreferentialRoute =
  | (PreferentialDepartureRoute & { routeType: "pdr" })
  | (PreferentialArrivalRoute & { routeType: "par" })
  | (PreferentialDepartureArrivalRoute & { routeType: "pdar" });

export type WindowPosition = {
  x: number;
  y: number;
  w?: number;
  h?: number;
};

export type SectorData = {
  geometry: { coordinates: Position[][]; type: string };
  properties: {
    alt_low?: string;
    alt_high?: string;
    id: string;
  };
};

export type Plan = {
  aircraftId: string;
  callsign: string;
  planData: Record<string, any>;
  msg: string;
};

export type EramConfiguration = {
  sectorId: string;
};

export type ControllerPosition = {
  callsign: string;
  eramConfiguration: EramConfiguration | null;
  frequency: number;
  id: string;
  name: string;
  radioName: string;
};

export type SessionInfo = {
  id: string;
  artccId: string;
  facilityId: string;
  positionId: string;
  isActive: boolean;
  position: ControllerPosition;
};
