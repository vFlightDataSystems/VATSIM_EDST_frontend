import type { EdstWindow } from "enums/edstWindow";
import type { AclState } from "~redux/slices/aclSlice";
import type { DepState } from "~redux/slices/depSlice";
import type { GpdState } from "~redux/slices/gpdSlice";
import type { PlanState } from "~redux/slices/planSlice";
import type { Asel } from "../asel";
import type { Nullable } from "../utility-types";

export type SharedUiState = {
  acl: AclState;
  dep: DepState;
  gpd: GpdState;
  plansDisplay: PlanState;
  openWindows: EdstWindow[];
  asel: Nullable<Asel>;
};
