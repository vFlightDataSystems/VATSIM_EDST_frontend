
export interface EdstEntry {
  cid?: string;
  callsign?: string;
  route?: string;
  _route?: string;
  route_data?: Array<any>;
  _route_data?: Array<any>;
  altitude?: string;
  type?: string;
  equipment?: string;
  flightplan?: any;
  dep?: string;
  dest?: string;
  acl_status?: number;
  dep_status?: number;
  previous_route?: any;
  acl_highlighted?: boolean;
  dep_highlighted?: boolean;
  beacon?: string;
  spa?: number | null;
  minutes_away?: number;
  reference_fix?: any;
}

export interface EdstPreferredRoute {
  eligible?: boolean;
  route: string;
  route_data?: Array<any>;
  aar_amendment_route_string?: string;
  dest?: string;
}