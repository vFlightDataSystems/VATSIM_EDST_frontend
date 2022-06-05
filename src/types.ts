import { Feature, Point, Position } from "@turf/turf";

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
  routeData: RouteFix[];
  currentRoute: string; // shortened route string, starting at the next inbound fix
  currentRouteData?: RouteFix[];
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

// TODO: type all `any` types
// local data for a single EDST entry
export type LocalVEdstEntry = {
  depInfo: AirportInfo | null;
  destInfo: AirportInfo | null;
  nasSuffix: string | null;
  adr?: any[];
  adar?: any[];
  freeTextContent: string;
  aarList?: any[]; // preferred arrival routes
  currentAarList?: any[] | null; // preferred arrival routes processed by the frontend
  vciStatus: number; // vci status (-1: not acknowledged, 0: acknowledged but not on frequency, 1: on frequency)
  depStatus: number; // departure flightplan status (-1: not acknowledged, 0: acknowledged but not checked, 1: verified)
  aclHighlighted?: boolean;
  depHighlighted?: boolean;
  aclRouteDisplay?: string | null; // for toggling remarks
  remarksChecked?: boolean; // whether remarks have been checked or not
  spa: boolean; // SPA indicator
  boundaryTime: number; // minutes until entering the sector's airspace (will be negative if already inside)
  referenceFix?: ReferenceFix | null; // current FRD
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

export type ReferenceFix = {
  waypoint_id: string;
  point: Feature<Point>;
  distance: number;
  bearing: number;
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

export type EdstPreferredRoute = {
  eligible?: boolean;
  routeType?: string;
  route?: string;
  route_data?: RouteFix[];
  amendment?: string;
  departure?: string;
  destination?: string;
};

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
