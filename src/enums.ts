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

export enum windowEnum {
  more,
  acl,
  dep,
  plansDisplay,
  planOptions,
  sortMenu,
  toolsMenu,
  messageComposeArea,
  messageResponseArea,
  altitudeMenu,
  routeMenu,
  prevRouteMenu,
  speedMenu,
  headingMenu,
  holdMenu,
  cancelHoldMenu,
  templateMenu,
  status,
  outage,
  graphicPlanDispay,
  metar,
  ua,
  sigmets,
  notams,
  generalInfo, // general info
  adsb,
  sat,
  msg,
  wind,
  altimeter,
  fel,
  cpdlcHist,
  cpdlcMsgOut
}