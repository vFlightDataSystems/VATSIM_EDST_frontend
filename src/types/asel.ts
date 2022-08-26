import { AircraftId } from "../typeDefinitions/types/aircraftId";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";
import { AclRowField } from "../typeDefinitions/enums/acl/aclRowField";
import { DepRowField } from "../typeDefinitions/enums/dep/depRowField";
import { PlanRowField } from "../typeDefinitions/enums/planRowField";

export type Asel = { aircraftId: AircraftId; window: EdstWindow; field: AclRowField | DepRowField | PlanRowField };
