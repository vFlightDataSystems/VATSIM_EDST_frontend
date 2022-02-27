export enum aclRowFieldEnum {
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

export enum depRowFieldEnum {
  p_time,
  fid,
  type,
  alt,
  code,
  route
}

export enum planRowFieldEnum {
  fid
}

export enum sortOptionsEnum {
  acid = "ACID",
  boundaryTime = "Boundary Time",
  conflictStatus = "Conflict Status",
  conflictTime = "Conflict Time",
  destination = "Destination",
  sectorBySector = "Sector-by-Sector",
  origin = "Origin",
  pTime = "P Time"
}

export enum aclAselActionTriggerEnum {
  setVciNeutral,
  toggleHoldInfo
}

export enum depAselActionTriggerEnum {
  setDepStatusNeutral
}

export enum edstHeaderButtonEnum {
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

export enum menuEnum {
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
  templateMenu = "templateMenu"
}

export enum windowEnum {
  more = "more",
  acl = "acl",
  dep = "dep",
  plansDisplay = "plansDisplay",
  messageComposeArea = "messageComposeArea",
  messageResponseArea = "messageResponseArea",
  status = "status",
  outage = "outage",
  graphicPlanDispay = "graphicPlanDispay",
  metar = "metar",
  ua = "ua",
  sigmets = "sigmets",
  notams = "notams",
  generalInfo = "generalInfo", // general info
  adsb = "adsb",
  sat = "sat",
  msg = "msg",
  wind = "wind",
  altimeter = "altimeter",
  fel = "fel",
  cpdlcHist = "cpdlcHist",
  cpdlcMsgOut = "cpdlcMsg"
}