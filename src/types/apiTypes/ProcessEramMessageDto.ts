export enum EramPositionType {
  RSide,
  DSide
}

export interface EramMessageElement {
  token?: string | null;
  targetAircraftId?: string | null;
  trackAircraftId?: string | null;
}

export type ProcessEramMessageDto = {
  source: EramPositionType | null;
  elements: EramMessageElement[];
  invertNumericKeypad: boolean;
};