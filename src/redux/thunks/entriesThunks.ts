import { EdstWindow } from "enums/edstWindow";
import { AclRowField } from "enums/acl/aclRowField";
import { DepRowField } from "enums/dep/depRowField";
import { convertBeaconCodeToString } from "~/utils/stringManipulation";
import { setAsel } from "../slices/appSlice";
import type { RootThunkAction } from "../store";

function addEntryThunk(fid: string, window: EdstWindow): RootThunkAction {
  return (dispatch, getState) => {
    const { entries } = getState();
    const aircraftId = Object.values(entries ?? {})?.find(
      (e) => e.cid === fid || e.aircraftId === fid || convertBeaconCodeToString(e.assignedBeaconCode) === fid
    )?.aircraftId;
    if (aircraftId) {
      switch (window) {
        case EdstWindow.ACL:
          dispatch(
            setAsel({
              aircraftId,
              field: AclRowField.FID,
              window: EdstWindow.ACL,
            })
          );
          break;
        case EdstWindow.DEP:
          dispatch(
            setAsel({
              aircraftId,
              field: DepRowField.FID,
              window: EdstWindow.DEP,
            })
          );
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
