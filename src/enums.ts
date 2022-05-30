export enum AclRowField {
  fid,
  pa,
  type,
  alt,
  code,
  hdg,
  spd,
  hold,
  route
}

export enum DepRowField {
  pTime,
  fid,
  type,
  alt,
  code,
  route
}

export enum PlanRowField {
  fid
}

export enum SortOptions {
  acid = "ACID",
  boundaryTime = "Boundary Time",
  conflictStatus = "Conflict Status",
  conflictTime = "Conflict Time",
  destination = "Destination",
  sectorBySector = "Sector-by-Sector",
  origin = "Origin",
  pTime = "P Time"
}

export enum AclAselActionTrigger {
  setVciNeutral,
  toggleHoldInfo
}

export enum DepAselActionTrigger {
  setDepStatusNeutral
}

export enum edstHeaderButton {
  more,
  acl,
  dep,
  gpd,
  wx,
  sig,
  not,
  gi,
  ua,
  keep,
  status,
  outage,
  adsb,
  sat,
  msg,
  wind,
  altim,
  mca,
  mra,
  fel,
  cpdlcHist,
  cpdlcMsgOut
}

export enum EdstMenu {
  planOptions = "planOptions",
  sortMenu = "sortMenu",
  toolsMenu = "toolsMenu",
  altitudeMenu = "altitudeMenu",
  routeMenu = "routeMenu",
  prevRouteMenu = "prevRouteMenu",
  speedMenu = "speedMenu",
  headingMenu = "headingMenu",
  holdMenu = "holdMenu",
  cancelHoldMenu = "cancelHoldMenu",
  templateMenu = "templateMenu",
  equipmentTemplateMenu = "equipmentTemplateMenu",
  gpdMapOptionsMenu = "gpdMapOptionsMenu"
}

export enum EdstWindow {
  more = "more",
  acl = "acl",
  dep = "dep",
  plansDisplay = "plansDisplay",
  messageComposeArea = "messageComposeArea",
  messageResponseArea = "messageResponseArea",
  status = "status",
  outage = "outage",
  graphicPlanDisplay = "graphicPlanDisplay",
  metar = "metar",
  ua = "ua",
  sigmets = "sigmets",
  notams = "notams",
  generalInfo = "generalInfo",
  adsb = "adsb",
  sat = "sat",
  msg = "msg",
  wind = "wind",
  altimeter = "altimeter",
  fel = "fel",
  cpdlcHist = "cpdlcHist",
  cpdlcMsgOut = "cpdlcMsg"
}
