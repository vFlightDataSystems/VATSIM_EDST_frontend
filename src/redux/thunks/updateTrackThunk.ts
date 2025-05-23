import _ from "lodash";
import type { RootThunkAction } from "~redux/store";
import { updateEntry } from "~redux/slices/entrySlice";
import { EramTrackDto } from "~/types/apiTypes/EramTrackDto";
import { sectorIdSelector } from "~/redux/slices/sectorSlice";
import { LocalVEdstEntry } from "types/localVEdstEntry";
import { REMOVAL_TIMEOUT } from "~/utils/constants";

export function updateTrackThunk(target: EramTrackDto): RootThunkAction {
  return (dispatch, getState) => {
    const state = getState();
    const entries = state.entries;
    const mySectorId = sectorIdSelector(state);
    const aircraftIds = Object.keys(entries);

    if (aircraftIds.includes(target.aircraftId)) {
      // Create new LocalVEdstEntry with updated values
      const localData = new LocalVEdstEntry();

      // Set VCI status if aircraft is on our frequency
      if (target.onFrequencySectorIds.includes(mySectorId)) {
        localData.vciStatus = 1;
      } else if (target.onFrequencySectorIds.length === 0 && localData.vciStatus === 1) {
        // If the aircraft is not on any frequency and we previously set VCI status to 1, set it to 0
        localData.vciStatus = 0;
      }

      // Set Ownership status if we own the track
      if (target.owner.sectorId === mySectorId) {
        localData.probe = true;
        localData.owned = true;
      } else {
        // If we don't own the track, set ownership status to false
        localData.probe = false;
        localData.owned = false;
      }

      // Update the entry with new local data
      dispatch(
        updateEntry({
          aircraftId: target.aircraftId,
          data: {
            ...entries[target.aircraftId],
            ...localData,
          },
        })
      );
    }
  };
}

export const deleteTrackThunk =
  (target: string): RootThunkAction =>
  (dispatch, getState) => {
    const state = getState();
    const { entries } = state;
    const now = Date.now();

    const entry = entries[target];
    if (entry) {
      dispatch(
        updateEntry({
          aircraftId: target,
          data: {
            ...entry,
            status: "Active",
            pendingRemoval: now,
            vciStatus: 0,
            owned: false,
            probe: false,
          },
        })
      );
    }
  };
