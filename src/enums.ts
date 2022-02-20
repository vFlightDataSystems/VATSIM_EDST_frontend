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
  boundary_time = "Boundary Time",
  conflict_status = "Conflict Status",
  conflict_time = "Conflict Time",
  destination = "Destination",
  sector_by_sector = "Sector-by-Sector",
  origin = "Origin",
  p_time = "P Time"
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
  cpdlc_hist,
  cpdlc_msg_out
}

export enum windowEnum {
  more,
  acl,
  dep,
  plansDisplay,
  planOptions,
  sortMenu,
  edstMca,
  edstMra,
  altitudeMenu,
  routeMenu,
  prevRouteMenu,
  speedMenu,
  headingMenu,
  holdMenu,
  cancelHoldMenu,
  templateMenu,
  edstStatus,
  edstOutage,
  gpd,
  wx,
  ua,
  sigmets,
  notams,
  gi, // general info
  adsb,
  sat,
  msg,
  wind,
  altimeter,
  fel,
  cpdlc_hist,
  cpdlc_msg_out
}