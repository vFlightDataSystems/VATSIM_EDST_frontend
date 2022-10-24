import { RootThunkAction } from "../store";
import { setAsel } from "../slices/appSlice";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { AclRowField } from "../../typeDefinitions/enums/acl/aclRowField";
import { DepRowField } from "../../typeDefinitions/enums/dep/depRowField";
import { convertBeaconCodeToString } from "../../utils/stringManipulation";

function addEntryThunk(fid: string, window: EdstWindow): RootThunkAction {
  return (dispatch, getState) => {
    const { entries } = getState();
    const aircraftId = Object.values(entries ?? {})?.find(
      e => e.cid === fid || e.aircraftId === fid || convertBeaconCodeToString(e.assignedBeaconCode) === fid
    )?.aircraftId;
    if (aircraftId) {
      switch (window) {
        case EdstWindow.ACL:
          dispatch(setAsel({ aircraftId, field: AclRowField.FID, window: EdstWindow.ACL }));
          break;
        case EdstWindow.DEP:
          dispatch(setAsel({ aircraftId, field: DepRowField.FID, window: EdstWindow.DEP }));
          break;
        default:
          break;
      }
    }
  };
}

export function addAclEntryByFid(fid: string) {
  return addEntryThunk(fid, EdstWindow.ACL);
}

export function addDepEntryByFid(fid: string) {
  return addEntryThunk(fid, EdstWindow.DEP);
}
