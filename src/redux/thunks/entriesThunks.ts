import type { EdstWindow } from "types/edstWindow";
import { convertBeaconCodeToString } from "~/utils/stringManipulation";
import { setAsel } from "~redux/slices/appSlice";
import type { RootThunkAction } from "~redux/store";

function addEntryThunk(fid: string, window: EdstWindow): RootThunkAction {
  return (dispatch, getState) => {
    const { entries } = getState();
    const aircraftId = Object.values(entries ?? {})?.find(
      (e) => e.cid === fid || e.aircraftId === fid || convertBeaconCodeToString(e.assignedBeaconCode) === fid
    )?.aircraftId;
    if (aircraftId) {
      switch (window) {
        case "ACL":
          dispatch(
            setAsel({
              aircraftId,
              field: "FID_ACL_ROW_FIELD",
              window: "ACL",
            })
          );
          break;
        case "DEP":
          dispatch(
            setAsel({
              aircraftId,
              field: "FID_DEP_ROW_FIELD",
              window: "DEP",
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
  return addEntryThunk(fid, "ACL");
}

export function addDepEntryByFid(fid: string) {
  return addEntryThunk(fid, "DEP");
}
