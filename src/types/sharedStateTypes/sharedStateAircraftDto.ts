export type SharedStateAircraftDto = {
  aircraftId: string;
  spa: boolean;
  aclDisplay: boolean;
  aclDeleted: boolean;
  depDisplay: boolean;
  depDeleted: boolean;
  vciStatus: -1 | 0 | 1;
  depStatus: -1 | 0 | 1;
  aclHighlighted: boolean;
  depHighlighted: boolean;
  freeTextContent: string;
  showFreeText: boolean;
};
