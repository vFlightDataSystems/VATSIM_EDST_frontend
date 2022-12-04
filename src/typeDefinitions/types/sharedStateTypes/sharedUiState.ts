import type { EdstWindow } from "types/edstWindow";
import type { AclState } from "~redux/slices/aclSlice";
import type { DepState } from "~redux/slices/depSlice";
import type { GpdState } from "~redux/slices/gpdSlice";
import type { PlanState } from "~redux/slices/planSlice";
import type { Asel } from "types/asel";
import type { Nullable } from "types/utility-types";

export type SharedUiState = {
  acl: AclState;
  dep: DepState;
  gpd: GpdState;
  plansDisplay: PlanState;
  openWindows: EdstWindow[];
  asel: Nullable<Asel>;
};
