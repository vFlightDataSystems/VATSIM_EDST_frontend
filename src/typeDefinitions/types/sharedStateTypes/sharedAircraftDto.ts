import { AircraftId } from "../aircraftId";

export class SharedAircraftDto {
  constructor(data: SharedAircraftDto) {
    this.aircraftId = data.aircraftId;
    this.spa = data.spa;
    this.aclDisplay = data.aclDisplay;
    this.aclDeleted = data.aclDeleted;
    this.depDisplay = data.depDisplay;
    this.depDeleted = data.depDeleted;
    this.vciStatus = data.vciStatus;
    this.depStatus = data.depStatus;
    this.aclHighlighted = data.aclHighlighted;
    this.depHighlighted = data.depHighlighted;
    this.freeTextContent = data.freeTextContent;
    this.showFreeText = data.showFreeText;
    this.assignedSpeed = data.assignedSpeed;
    this.assignedHeading = data.assignedHeading;
    this.scratchpadHeading = data.scratchpadHeading;
    this.scratchpadSpeed = data.scratchpadSpeed;
    this.previousRoute = data.previousRoute;
  }

  aircraftId: AircraftId = "";

  spa = false;

  aclDisplay = false;

  aclDeleted = false;

  depDisplay = false;

  depDeleted = false;

  vciStatus: -1 | 0 | 1 = -1;

  depStatus: -1 | 0 | 1 = -1;

  aclHighlighted = false;

  depHighlighted = false;

  assignedSpeed: string | null = null;

  assignedHeading: string | null = null;

  scratchpadHeading: string | null = null;

  scratchpadSpeed: string | null = null;

  previousRoute: string | null = null;

  freeTextContent = "";

  showFreeText = false;
}
