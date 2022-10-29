import type { EdstWindow } from "enums/edstWindow";
import type { AclRowField } from "enums/acl/aclRowField";
import type { DepRowField } from "enums/dep/depRowField";
import type { PlanRowField } from "enums/planRowField";
import type { AircraftId } from "./aircraftId";

export type Asel = {
  aircraftId: AircraftId;
  window: EdstWindow;
  field: AclRowField | DepRowField | PlanRowField;
};
