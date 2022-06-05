export type EdstWindow =
  | EdstWindow.ACL
  | EdstWindow.DEP
  | EdstWindow.GPD
  | EdstWindow.PLANS_DISPLAY
  | EdstWindow.MESSAGE_COMPOSE_AREA
  | EdstWindow.MESSAGE_RESPONSE_AREA
  | EdstWindow.STATUS
  | EdstWindow.OUTAGE
  | EdstWindow.METAR
  | EdstWindow.UA
  | EdstWindow.SIGMETS
  | EdstWindow.NOTAMS
  | EdstWindow.GI
  | EdstWindow.ADSB
  | EdstWindow.SAT
  | EdstWindow.MSG
  | EdstWindow.WIND
  | EdstWindow.ALTIMETER
  | EdstWindow.FEL
  | EdstWindow.MORE
  | EdstWindow.CPDLC_HIST
  | EdstWindow.CPDLC_MSG
  // MENUS
  | EdstWindow.PLAN_OPTIONS
  | EdstWindow.SORT_MENU
  | EdstWindow.TOOLS_MENU
  | EdstWindow.ALTITUDE_MENU
  | EdstWindow.ROUTE_MENU
  | EdstWindow.PREV_ROUTE_MENU
  | EdstWindow.SPEED_MENU
  | EdstWindow.HEADING_MENU
  | EdstWindow.HOLD_MENU
  | EdstWindow.CANCEL_HOLD_MENU
  | EdstWindow.TEMPLATE_MENU
  | EdstWindow.EQUIPMENT_TEMPLATE_MENU
  | EdstWindow.GPD_MAP_OPTIONS_MENU;

export namespace EdstWindow {
  // EDST WINDOWS
  export const ACL = Symbol("ACL");
  export type ACL = typeof ACL;
  export const DEP = Symbol("DEP");
  export type DEP = typeof DEP;
  export const GPD = Symbol("GPD");
  export type GPD = typeof GPD;
  export const PLANS_DISPLAY = Symbol("PLANS_DISPLAY");
  export type PLANS_DISPLAY = typeof PLANS_DISPLAY;
  export const MESSAGE_COMPOSE_AREA = Symbol("MESSAGE_COMPOSE_AREA");
  export type MESSAGE_COMPOSE_AREA = typeof MESSAGE_COMPOSE_AREA;
  export const MESSAGE_RESPONSE_AREA = Symbol("MESSAGE_RESPONSE_AREA");
  export type MESSAGE_RESPONSE_AREA = typeof MESSAGE_RESPONSE_AREA;
  export const STATUS = Symbol("STATUS");
  export type STATUS = typeof STATUS;
  export const OUTAGE = Symbol("OUTAGE");
  export type OUTAGE = typeof OUTAGE;
  export const METAR = Symbol("METAR");
  export type METAR = typeof METAR;
  export const UA = Symbol("UA");
  export type UA = typeof UA;
  export const SAT = Symbol("SAT");
  export type SAT = typeof SAT;
  export const SIGMETS = Symbol("SIGMETS");
  export type SIGMETS = typeof SIGMETS;
  export const NOTAMS = Symbol("NOTAMS");
  export type NOTAMS = typeof NOTAMS;
  export const GI = Symbol("GI");
  export type GI = typeof GI;
  export const ADSB = Symbol("ADSB");
  export type ADSB = typeof ADSB;
  export const MSG = Symbol("MSG");
  export type MSG = typeof MSG;
  export const WIND = Symbol("WIND");
  export type WIND = typeof WIND;
  export const ALTIMETER = Symbol("ALTIMETER");
  export type ALTIMETER = typeof ALTIMETER;
  export const FEL = Symbol("FEL");
  export type FEL = typeof FEL;
  export const MORE = Symbol("MORE");
  export type MORE = typeof MORE;
  export const CPDLC_HIST = Symbol("CPDLC_HIST");
  export type CPDLC_HIST = typeof CPDLC_HIST;
  export const CPDLC_MSG = Symbol("CPDLC_MSG");
  export type CPDLC_MSG = typeof CPDLC_MSG;

  // EDST MENUS
  export const PLAN_OPTIONS = Symbol("PLAN_OPTIONS");
  export type PLAN_OPTIONS = typeof PLAN_OPTIONS;
  export const SORT_MENU = Symbol("SORT_MENU");
  export type SORT_MENU = typeof SORT_MENU;
  export const TOOLS_MENU = Symbol("TOOLS_MENU");
  export type TOOLS_MENU = typeof TOOLS_MENU;
  export const ALTITUDE_MENU = Symbol("ALTITUDE_MENU");
  export type ALTITUDE_MENU = typeof ALTITUDE_MENU;
  export const ROUTE_MENU = Symbol("ROUTE_MENU");
  export type ROUTE_MENU = typeof ROUTE_MENU;
  export const PREV_ROUTE_MENU = Symbol("PREV_ROUTE_MENU");
  export type PREV_ROUTE_MENU = typeof PREV_ROUTE_MENU;
  export const SPEED_MENU = Symbol("SPEED_MENU");
  export type SPEED_MENU = typeof SPEED_MENU;
  export const HEADING_MENU = Symbol("HEADING_MENU");
  export type HEADING_MENU = typeof HEADING_MENU;
  export const HOLD_MENU = Symbol("HOLD_MENU");
  export type HOLD_MENU = typeof HOLD_MENU;
  export const CANCEL_HOLD_MENU = Symbol("CANCEL_HOLD_MENU");
  export type CANCEL_HOLD_MENU = typeof CANCEL_HOLD_MENU;
  export const TEMPLATE_MENU = Symbol("TEMPLATE_MENU");
  export type TEMPLATE_MENU = typeof TEMPLATE_MENU;
  export const EQUIPMENT_TEMPLATE_MENU = Symbol("EQUIPMENT_TEMPLATE_MENU");
  export type EQUIPMENT_TEMPLATE_MENU = typeof EQUIPMENT_TEMPLATE_MENU;
  export const GPD_MAP_OPTIONS_MENU = Symbol("GPD_MAP_OPTIONS_MENU");
  export type GPD_MAP_OPTIONS_MENU = typeof GPD_MAP_OPTIONS_MENU;
}

export const EDST_MENU_LIST = [
  EdstWindow.PLAN_OPTIONS,
  EdstWindow.SORT_MENU,
  EdstWindow.TOOLS_MENU,
  EdstWindow.ALTITUDE_MENU,
  EdstWindow.ROUTE_MENU,
  EdstWindow.PREV_ROUTE_MENU,
  EdstWindow.SPEED_MENU,
  EdstWindow.HEADING_MENU,
  EdstWindow.HOLD_MENU,
  EdstWindow.CANCEL_HOLD_MENU,
  EdstWindow.TEMPLATE_MENU,
  EdstWindow.EQUIPMENT_TEMPLATE_MENU,
  EdstWindow.GPD_MAP_OPTIONS_MENU
];

export type AclRowField =
  | AclRowField.FID
  | AclRowField.PA
  | AclRowField.TYPE
  | AclRowField.ALT
  | AclRowField.CODE
  | AclRowField.HDG
  | AclRowField.SPD
  | AclRowField.HOLD
  | AclRowField.ROUTE;

export namespace AclRowField {
  export const FID = Symbol("FID");
  export type FID = typeof FID;
  export const PA = Symbol("PA");
  export type PA = typeof PA;
  export const TYPE = Symbol("TYPE");
  export type TYPE = typeof TYPE;
  export const ALT = Symbol("ALT");
  export type ALT = typeof ALT;
  export const CODE = Symbol("CODE");
  export type CODE = typeof CODE;
  export const HDG = Symbol("HDG");
  export type HDG = typeof HDG;
  export const SPD = Symbol("SPD");
  export type SPD = typeof SPD;
  export const HOLD = Symbol("HOLD");
  export type HOLD = typeof HOLD;
  export const ROUTE = Symbol("ROUTE");
  export type ROUTE = typeof ROUTE;
}

export type DepRowField = DepRowField.FID | DepRowField.P_TIME | DepRowField.TYPE | DepRowField.ALT | DepRowField.CODE | DepRowField.ROUTE;

export namespace DepRowField {
  export const FID = Symbol("FID");
  export type FID = typeof FID;
  export const P_TIME = Symbol("P_TIME");
  export type P_TIME = typeof P_TIME;
  export const TYPE = Symbol("TYPE");
  export type TYPE = typeof TYPE;
  export const ALT = Symbol("ALT");
  export type ALT = typeof ALT;
  export const CODE = Symbol("CODE");
  export type CODE = typeof CODE;
  export const ROUTE = Symbol("ROUTE");
  export type ROUTE = typeof ROUTE;
}

export type PlanRowField = PlanRowField.FID;

export namespace PlanRowField {
  export const FID = Symbol("FID");
  export type FID = typeof FID;
}

export type AclAselActionTrigger = AclAselActionTrigger.SET_VCI_NEUTRAL | AclAselActionTrigger.TOGGLE_HOLD_INFO;

export namespace AclAselActionTrigger {
  export const SET_VCI_NEUTRAL = Symbol("SET_VCI_NEUTRAL");
  export type SET_VCI_NEUTRAL = typeof SET_VCI_NEUTRAL;
  export const TOGGLE_HOLD_INFO = Symbol("TOGGLE_HOLD_INFO");
  export type TOGGLE_HOLD_INFO = typeof TOGGLE_HOLD_INFO;
}

export type DepAselActionTrigger = DepAselActionTrigger.SET_DEP_STATUS_NEUTRAL;

export namespace DepAselActionTrigger {
  export const SET_DEP_STATUS_NEUTRAL = Symbol("SET_DEP_STATUS_NEUTRAL");
  export type SET_DEP_STATUS_NEUTRAL = typeof SET_DEP_STATUS_NEUTRAL;
}

export type SortOptions =
  | SortOptions.ACID
  | SortOptions.BOUNDARY_TIME
  | SortOptions.CONFLICT_STATUS
  | SortOptions.CONFLICT_TIME
  | SortOptions.DESTINATION
  | SortOptions.SECTOR_BY_SECTOR
  | SortOptions.ORIGIN
  | SortOptions.P_TIME;

export namespace SortOptions {
  export const ACID = Symbol("ACID");
  export type ACID = typeof ACID;
  export const BOUNDARY_TIME = Symbol("BOUNDARY_TIME");
  export type BOUNDARY_TIME = typeof BOUNDARY_TIME;
  export const CONFLICT_STATUS = Symbol("CONFLICT_STATUS");
  export type CONFLICT_STATUS = typeof CONFLICT_STATUS;
  export const CONFLICT_TIME = Symbol("CONFLICT_TIME");
  export type CONFLICT_TIME = typeof CONFLICT_TIME;
  export const DESTINATION = Symbol("DESTINATION");
  export type DESTINATION = typeof DESTINATION;
  export const SECTOR_BY_SECTOR = Symbol("SECTOR_BY_SECTOR");
  export type SECTOR_BY_SECTOR = typeof SECTOR_BY_SECTOR;
  export const ORIGIN = Symbol("ORIGIN");
  export type ORIGIN = typeof ORIGIN;
  export const P_TIME = Symbol("P_TIME");
  export type P_TIME = typeof P_TIME;
}

export const SortOptionValues = {
  [SortOptions.ACID]: "ACID",
  [SortOptions.BOUNDARY_TIME]: "Boundary Time",
  [SortOptions.CONFLICT_STATUS]: "Conflict Status",
  [SortOptions.CONFLICT_TIME]: "Conflict Time",
  [SortOptions.DESTINATION]: "Destination",
  [SortOptions.SECTOR_BY_SECTOR]: "Sector-by-Sector",
  [SortOptions.ORIGIN]: "Origin",
  [SortOptions.P_TIME]: "P Time"
};
