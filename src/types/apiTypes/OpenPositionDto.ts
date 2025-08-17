export default interface OpenPositionDto {
  id: string;
  positionId?: string;
  callsign: string;
  frequency?: number;
  isActive: boolean;
  isPrimary: boolean;
  facilityId?: string;
  radarFacilityId?: string;
  caatsAccId?: string;
  facilityName?: string;
  type: PositionType;
  role: PositionRole;
  name: string;
  subset?: number;
  sectorId?: string;
  radioName?: string;
  realName: string;
  primaryHandoffString?: string;
  validHandoffStrings: string[];
}

export enum PositionRole {
  Observer = "Observer",
  Controller = "Controller",
  Student = "Student",
  Instructor = "Instructor",
}

export enum PositionType {
  Artcc = "Artcc",
  NonNas = "NonNas",
  Tracon = "Tracon",
  Atct = "Atct",
  Other = "Other",
}
