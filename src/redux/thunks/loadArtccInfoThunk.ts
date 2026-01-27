import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "~redux/store";
import { fetchArtccInfo } from "~/api/vNasDataApi";
import { setArtccInfo } from "~redux/slices/positionSlice";
import { envSelector } from "~redux/slices/authSlice";

export const loadArtccInfoThunk = createAsyncThunk<void, string, { state: RootState }>(
  "position/loadArtccInfo",
  async (artccId, { dispatch, getState }) => {
    const state = getState();
    const env = envSelector(state);

    if (!env?.apiBaseUrl) {
      throw new Error("API base URL not available");
    }

    try {
      // Fetch our ARTCC info
      const artccInfo = await fetchArtccInfo(env.apiBaseUrl, artccId);

      if (!artccInfo) {
        throw new Error(`Failed to fetch ARTCC info for ${artccId}`);
      }

      // Fetch neighboring facility NAS IDs
      const neighboringNasIds: Record<string, string> = {};

      await Promise.all(
        artccInfo.facility.neighboringFacilityIds.map(async (neighborId) => {
          try {
            const neighborInfo = await fetchArtccInfo(env.apiBaseUrl, neighborId);
            if (neighborInfo) {
              neighboringNasIds[neighborId] = neighborInfo.facility.eramConfiguration.nasId;
            }
          } catch (error) {
            console.warn(`Failed to fetch NAS ID for ${neighborId}:`, error);
          }
        })
      );

      dispatch(
        setArtccInfo({
          artccId,
          nasId: artccInfo.facility.eramConfiguration.nasId,
          neighboringFacilityIds: artccInfo.facility.neighboringFacilityIds,
          neighboringNasIds,
        })
      );
    } catch (error) {
      console.error("Failed to load ARTCC info:", error);
    }
  }
);
