import { SharedAclState } from "./sharedAclState";
import { SharedDepState } from "./sharedDepState";
import { SharedPlansDisplayState } from "./sharedPlansDisplayState";
import { SharedGpdState } from "./sharedGpdState";

export class SharedUiState {
  acl = new SharedAclState();

  dep = new SharedDepState();

  gpd = new SharedGpdState();

  plansDisplay = new SharedPlansDisplayState();
}
