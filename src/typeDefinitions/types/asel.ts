import type { EdstWindow } from "types/edstWindow";
import type { AclRowField } from "types/acl/aclRowField";
import type { DepRowField } from "types/dep/depRowField";
import type { PlanRowField } from "types/planRowField";
import type { AircraftId } from "types/aircraftId";

export type Asel = {
  aircraftId: AircraftId;
  window: EdstWindow;
  field: AclRowField | DepRowField | PlanRowField;
};
