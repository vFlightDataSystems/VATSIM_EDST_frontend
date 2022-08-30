import { AircraftId } from "./aircraftId";
import { EdstWindow } from "../enums/edstWindow";
import { AclRowField } from "../enums/acl/aclRowField";
import { DepRowField } from "../enums/dep/depRowField";
import { PlanRowField } from "../enums/planRowField";

export type Asel = { aircraftId: AircraftId; window: EdstWindow; field: AclRowField | DepRowField | PlanRowField };
