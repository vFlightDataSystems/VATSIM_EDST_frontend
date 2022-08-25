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

  freeTextContent = "";

  showFreeText = false;
}
