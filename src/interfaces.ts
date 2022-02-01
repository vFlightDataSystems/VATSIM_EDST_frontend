
// interface for a single EDST entry
export interface EdstEntryProps {
  previous_route_data?: Array<any>; // fixes for latest previous route
  cid: string; // 3 character unique identifier within EDST
  callsign: string; // aircraft callsign
  route: string; // route string parsed by EDST
  _route?: string; // shortened route string, starting at the next inbound fix
  routes?: Array<any>;
  route_data: Array<any>;
  _route_data?: Array<any>;
  previous_route?: any;
  altitude: string;
  interim?: number;
  type: string;
  equipment: string;
  aar_list?: Array<any>; // preferred arrival routes
  _aar_list?: Array<any> | null; // preferred arrival routes processed by the frontend
  flightplan: any; // VATSIM flightplan data plus ground speed and position (lon/lat)
  dep: string; // departure airport ICAO code
  dest: string; // destination airport ICAO code
  dep_info?: any; // additional data about departure airport like local code, lon/lat, ARTCC of jurisdiction (if available)
  dest_info?: any; // additional data about destination airport like local code, lon/lat, ARTCC of jurisdiction (if available)
  acl_status: number; // vci status (-1: not acknowledged, 0: acknowledged but not on frequency, 1: on frequency)
  dep_status: number; // departure flightplan status (-1: not acknowledged, 0: acknowledged but not checked, 1: verified)
  acl_highlighted?: boolean;
  dep_highlighted?: boolean;
  acl_route_display?: string; // for toggling remarks
  adr: Array<any>; // adapted departure routes proposed by EDST
  adar: Array<any>; // adapted departure-arrival routes proposed by EDST
  beacon: string; // assigned beacon code
  remarks: string; // remarks string
  spd?: string; // assigned speed
  hdg?: string; // assigned heading
  spa?: number | null; // SPA indicator (number indicates position in the list)
  boundary_time: number; // minutes until entering the sector's airspace (will be negative if already inside)
  reference_fix?: any; // current FRD
  update_time: number; // last time the entry was updated in EDST
  pending_removal?: number | null; // if not null, number represents timestamp when pending_removal status was activated
  hold_data?: any; // assigned hold instructions
  scratch_hdg?: string; // speed assigned in the scratchpad
  scratch_spd?: string; // heading assigned in the scratchpad
  free_text_content?: string; // free text content
  free_text?: boolean; // boolean whether to display the free text row or not
  remarks_checked?: boolean; // whether remarks have been checked or not
  voice_type?: string; // voice type in VATSIM flightplan, /v/ by default
  cleared_direct?: { frd: string, fix: string }; // if cleared direct to somewhere, this will contain the FRD and the fix the aircraft was cleared to
}

export interface FixProps {
  name: string;
  pos: [number, number];
  dist?: number;
}

export interface EdstPreferredRouteProps {
  eligible?: boolean;
  route: string;
  route_data?: Array<any>;
  aar_amendment_route_string?: string;
  dest?: string;
}

export interface AselProps {
  cid: string;
  field: string;
  window: string | null;
}

export interface SectorDataProps {
  geometry: { coordinates: Array<[any, any]>, type: string };
  properties: {
    alt_low?: string;
    alt_high?: string;
    id: string;
  };
}

export interface PlanDataProps {
  cid: string;
  callsign: string;
  plan_data: any;
  msg: string;
}

export interface SortDataProps {
  acl: { name: string, sector: boolean },
  dep: { name: string, sector?: boolean }
}

export interface EdstWindowProps {
  pos: {x: number, y: number, w?: number, h?: number};
  asel: AselProps;
  closeWindow: () => void;
}