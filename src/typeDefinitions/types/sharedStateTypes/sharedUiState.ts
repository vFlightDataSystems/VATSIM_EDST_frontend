import { SharedAclState } from "./sharedAclState";
import { SharedDepState } from "./sharedDepState";
import { SharedPlansDisplayState } from "./sharedPlansDisplayState";
import { SharedGpdState } from "./sharedGpdState";
import { EdstWindow } from "../../enums/edstWindow";
import { Asel } from "../asel";

export class SharedUiState {
  acl = new SharedAclState();

  dep = new SharedDepState();

  gpd = new SharedGpdState();

  plansDisplay = new SharedPlansDisplayState();

  openWindows: EdstWindow[] = [];

  asel: Asel | null = null;
}
