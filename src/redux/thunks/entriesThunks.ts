import { RootThunkAction } from "../store";
import { addEntryToAcl, addEntryToDep } from "../slices/entrySlice";
import { setAsel } from "../slices/appSlice";
import { convertBeaconCodeToString } from "../../lib";
import { EdstWindow } from "../../enums/edstWindow";
import { AclRowField } from "../../enums/aclRowField";
import { DepRowField } from "../../enums/depRowField";

function addEntryThunk(fid: string, window: EdstWindow): RootThunkAction {
  return (dispatch, getState) => {
    const { entries } = getState();
    const aircraftId = Object.values(entries ?? {})?.find(
      e => String(e?.cid) === fid || String(e?.aircraftId) === fid || convertBeaconCodeToString(e.assignedBeaconCode) === fid
    )?.aircraftId;
    if (aircraftId) {
      switch (window) {
        case EdstWindow.ACL:
          dispatch(addEntryToAcl(aircraftId));
          dispatch(setAsel({ aircraftId, field: AclRowField.FID, window: EdstWindow.ACL }));
          break;
        case EdstWindow.DEP:
          dispatch(addEntryToDep(aircraftId));
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
