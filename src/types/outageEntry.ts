import type { OutageType } from "types/outageType";

export class OutageEntry {
  constructor(id: string, message: string, outageType: OutageType = "serviceDown", canDelete = false) {
    this.message = message;
    this.id = id;
    this.outageType = outageType;
    this.canDelete = canDelete;
  }

  message = "";

  id = "";

  outageType: OutageType = "serviceDown";

  canDelete = false;

  acknowledged = false;
}
