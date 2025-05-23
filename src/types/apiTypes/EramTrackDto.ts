export interface GeoPoint
{
  lat: number;
  lon: number;
}

export enum EramTrackStatus
{
  Active = 'Active',
  Coasting = 'Coasting',
  Frozen = 'Frozen'
}

export interface TrackOwner
{
  callsign: string,
  facilityId?: string,
  subset?: number,
  sectorId?: string,
  ownerType: string
}

export enum VoiceType
{
  Unknown = "Unknown",
  Full = "Full",
  ReceiveOnly = "ReceiveOnly",
  TextOnly = "TextOnly",
}

export interface EramPointout
{
  id: string;
    from: string;
    to: string;
    isAcknowledged: boolean;
    isRecipientSuppressed: boolean;
    isRSideCleared: boolean;
    isDSideCleared: boolean;
    readonly isCleared: boolean;
}

export interface EramTrackDto
{
    aircraftId: string;
    isCorrelated: boolean;
    status: EramTrackStatus;
    owner: TrackOwner;
    location: GeoPoint;
    altitude?: number;
    reachedAssignedAltitude: boolean;
    groundSpeed?: number;
    groundTrack?: number;
    voiceType: VoiceType;
    handoffPeer?: TrackOwner;
    pointouts: EramPointout[];
    recentHandoffPeer?: TrackOwner;
    recentHandoffWasForced: boolean;
    controllerEnteredAltitude?: number;
    localInterimAltitude?: number;
    interimAltitude?: number;
    procedureAltitude?: number;
    scratchpad?: string;
    assignedHeading?: string;
    assignedSpeed?: string;
    onFrequencySectorIds: string[];

    // Computed properties
    readonly isCoasting: boolean;
    readonly isFrozen: boolean;
}
