import { Feature, Point, Position } from "@turf/turf";

// backend data for a single EDST entry
export type EdstEntry = {
  cid: string; // 3 character unique identifier within EDST
  callsign: string; // aircraft callsign
  route: string; // route string parsed by EDST
  routes?: any[];
  route_data: RouteFix[];
  previous_route?: string;
  previous_route_data?: RouteFix[]; // fixes for latest previous route
  altitude: string;
  interim?: number;
  type: string;
  equipment: string;
  flightplan: any; // VATSIM flightplan data plus ground speed and position (lon/lat)
  dep: string; // departure airport ICAO code
  dest: string; // destination airport ICAO code
  dep_info?: any; // additional data about departure airport like local code, lon/lat, ARTCC of jurisdiction (if
  // available)
  dest_info?: any; // additional data about destination airport like local code, lon/lat, ARTCC of jurisdiction (if
  // available)
  adr: any[]; // adapted departure routes proposed by EDST
  adar: any[]; // adapted departure-arrival routes proposed by EDST
  beacon: string; // assigned beacon code
  remarks: string; // remarks string
  spd?: string; // assigned speed
  hdg?: string; // assigned heading
  update_time: number; // last time the entry was updated in EDST
  hold_data?: any; // assigned hold instructions
  free_text_content?: string; // free text content
  cleared_direct?: { frd: string; fix: string }; // if cleared direct to somewhere, this will contain the FRD and the
  // fix the aircraft was cleared to
};

// local data for a single EDST entry
export type LocalVEdstEntry = {
  currentRoute?: string; // shortened route string, starting at the next inbound fix
  currentRouteData?: (RouteFix & { dist: number })[];
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
};

// type for a single EDST entry
export type LocalEdstEntry = EdstEntry & LocalVEdstEntry;

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
  dep?: string;
  dest?: string;
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

export type PlanQuery = {
  cid: string;
  callsign: string;
  planData: Record<string, any>;
  msg: string;
};
