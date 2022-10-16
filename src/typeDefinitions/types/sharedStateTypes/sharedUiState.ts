import { EdstWindow } from "../../enums/edstWindow";
import { Asel } from "../asel";
import { AclState } from "../../../redux/slices/aclSlice";
import { DepState } from "../../../redux/slices/depSlice";
import { GpdState } from "../../../redux/slices/gpdSlice";
import { PlanState } from "../../../redux/slices/planSlice";
import { Nullable } from "../../utility-types";

export type SharedUiState = {
  acl: AclState;
  dep: DepState;
  gpd: GpdState;
  plansDisplay: PlanState;
  openWindows: EdstWindow[];
  asel: Nullable<Asel>;
};
