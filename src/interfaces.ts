export interface EdstEntryProps {
  previous_route_data?: any;
  cid: string;
  callsign: string;
  route: string;
  _route?: string;
  routes?: Array<any>;
  route_data: Array<any>;
  _route_data?: Array<any>;
  previous_route?: any;
  altitude: string;
  interim?: number;
  type: string;
  equipment: string;
  aar_list?: Array<any>;
  _aar_list?: Array<any> | null;
  flightplan: any;
  dep: string;
  dest: string;
  dep_info?: any;
  dest_info?: any;
  acl_status: number;
  dep_status: number;
  acl_highlighted?: boolean;
  dep_highlighted?: boolean;
  acl_route_display?: any;
  adr: Array<any>;
  adar: Array<any>;
  beacon: string;
  remarks: string;
  spd?: string;
  hdg?: string;
  spa?: number | null;
  minutes_away: number;
  reference_fix?: any;
  update_time: number;
  pending_removal?: number | null;
  show_hold_info?: any;
  hold_data?: any;
  scratch_hdg?: string;
  scratch_spd?: string;
  scratchpad?: string;
  free_text?: boolean;
  remarks_checked?: boolean;
  cleared_direct?: { frd: string, fix: string };
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