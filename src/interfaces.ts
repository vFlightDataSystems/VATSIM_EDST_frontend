export interface EdstEntryProps {
    cid: string;
    callsign: string;
    route: string;
    _route?: string;
    routes?: Array<any>;
    route_data?: Array<any>;
    _route_data?: Array<any>;
    previous_route?: any;
    altitude: string;
    interim?: number;
    type: string;
    equipment: string;
    aar_list?: Array<any>;
    _aar_list?: Array<any>;
    flightplan: any;
    dep?: string;
    dest?: string;
    dep_info?: any;
    dest_info?: any;
    acl_status?: number;
    dep_status?: number;
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
    minutes_away?: number;
    reference_fix?: any;
    update_time: number;
    pending_removal?: number | null;
    show_hold_info?: any;
    hold_data?: any;
    scratch_hdg?: {scratchpad: boolean, val: string};
    scratch_spd?: {scratchpad: boolean, val: string};
    free_text?: string;
    remarks_checked?: boolean
    cleared_direct?: {frd: string, fix: string};
}

export interface EdstPreferredRouteProps {
    eligible?: boolean;
    route: string;
    route_data?: Array<any>;
    aar_amendment_route_string?: string;
    dest?: string;
}

export interface AselProps {
    cid: string,
    field: string,
    window: string
}