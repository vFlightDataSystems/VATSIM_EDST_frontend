import type { ReactNode } from "react";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";
import type { Nullable } from "types/utility-types";
import { clearSession, setSession, vatsimTokenSelector } from "~redux/slices/authSlice";
import { refreshToken } from "~/api/vNasDataApi";
import type { ApiSessionInfoDto } from "types/apiTypes/apiSessionInfoDto";
import { ApiTopic } from "types/apiTypes/apiTopic";
import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";
import { updateFlightplanThunk } from "~redux/thunks/updateFlightplanThunk";
import type { ApiAircraftTrack } from "types/apiTypes/apiAircraftTrack";
import { setMcaRejectMessage } from "~redux/slices/appSlice";
import { setArtccId, setSectorId } from "~redux/slices/sectorSlice";
import { initThunk } from "~redux/thunks/initThunk";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { useSocketConnector } from "hooks/useSocketConnector";
import { VERSION } from "~/utils/constants";
import { clientHubUrl } from "~/config";

const HUB_URL = clientHubUrl;

type HubContextValue = {
  connectHub: () => Promise<void>;
  disconnectHub: () => Promise<void>;
  hubConnection: HubConnection | null;
};

export const HubContext = createContext<HubContextValue>({
  connectHub: Promise.reject,
  disconnectHub: Promise.reject,
  hubConnection: null,
});

export const HubContextProvider = ({ children }: { children: ReactNode }) => {
  const [hubConnected, setHubConnected] = useState(false);
  const dispatch = useRootDispatch();
  const vatsimToken = useRootSelector(vatsimTokenSelector)!;
  const ref = useRef<Nullable<HubConnection>>(null);
  const { disconnectSocket } = useSocketConnector();

  useEffect(() => {
    if (!HUB_URL || !vatsimToken) {
      return;
    }

    const getValidNasToken = async () => {
      // const decodedToken = decodeJwt(nasToken);
      return refreshToken(vatsimToken).then((r) => {
        console.log("Refreshed NAS token");
        return r.data;
      });
    };

    ref.current = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: getValidNasToken,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .build();
  }, [vatsimToken]);

  const connectHub = useCallback(async () => {
    if (!HUB_URL || !vatsimToken || hubConnected || !ref.current) {
      if (hubConnected) {
        throw new Error("ALREADY CONNECTED");
      }
      throw new Error("SOMETHING WENT WRONG");
    }
    const hubConnection = ref.current;
    async function start() {
      hubConnection.onclose(() => {
        dispatch(setArtccId(""));
        dispatch(setSectorId(""));
        console.log("ATC hub disconnected");
      });

      hubConnection.on("HandleSessionStarted", (sessionInfo: ApiSessionInfoDto) => {
        console.log(sessionInfo);
        dispatch(setSession(sessionInfo));
      });

      hubConnection.on("HandleSessionEnded", () => {
        console.log("clearing session");
        dispatch(clearSession());
      });
      hubConnection.on("receiveFlightplan", async (topic: ApiTopic, flightplan: ApiFlightplan) => {
        console.log("received flightplan:", flightplan);
        dispatch(updateFlightplanThunk(flightplan));
      });
      hubConnection.on("receiveFlightplans", async (topic: ApiTopic, flightplans: ApiFlightplan[]) => {
        flightplans.forEach((flightplan) => {
          console.log("received flightplan:", flightplan);
          dispatch(updateFlightplanThunk(flightplan));
        });
      });
      hubConnection.on("receiveAircraft", (aircraft: ApiAircraftTrack[]) => {
        console.log("received aircraft:", aircraft);
        // aircraft.forEach(t => {
        //   dispatch(updateAircraftTrackThunk(t));
        // });
      });

      hubConnection.on("receiveError", (message: string) => {
        dispatch(setMcaRejectMessage(message));
      });

      await hubConnection.start();
      let sessionInfo: ApiSessionInfoDto;
      try {
        sessionInfo = await hubConnection.invoke<ApiSessionInfoDto>("getSessionInfo");
      } catch {
        ref.current?.stop().then(() => setHubConnected(false));
        throw new Error("SESSION NOT FOUND");
      }
      console.log(sessionInfo);
      const primaryPosition = sessionInfo?.positions.slice(0).filter((pos) => pos.isPrimary)?.[0]?.position;
      if (primaryPosition?.eramConfiguration) {
        const artccId = sessionInfo.artccId;
        const sectorId = primaryPosition.eramConfiguration.sectorId;
        dispatch(setArtccId(artccId));
        dispatch(setSectorId(sectorId));
        dispatch(setSession(sessionInfo));
        dispatch(initThunk());
        await hubConnection.invoke<void>("joinSession", {
          sessionId: sessionInfo.id,
          clientName: "vEDST",
          clientVersion: VERSION,
        });
        console.log(`joined session ${sessionInfo.id}`);
        setHubConnected(true);
        hubConnection.invoke<void>("subscribe", new ApiTopic("FlightPlans", sessionInfo.positions[0].facilityId)).catch(() => {
          ref.current?.stop().then(() => setHubConnected(false));
          throw new Error("COULD NOT SUBSCRIBE TO FLIGHTPLANS");
        });
      } else {
        await hubConnection.stop();
        setHubConnected(false);
        throw new Error("NOT SIGNED INTO A CENTER POSITION");
      }
    }

    hubConnection.keepAliveIntervalInMilliseconds = 1000;

    return start();
  }, [dispatch, hubConnected, vatsimToken]);

  const disconnectHub = useCallback(async () => {
    ref.current?.stop()?.then(() => setHubConnected(false));
    disconnectSocket();
  }, [disconnectSocket]);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const contextValue = {
    hubConnection: ref.current,
    connectHub,
    disconnectHub,
  };

  return <HubContext.Provider value={contextValue}>{children}</HubContext.Provider>;
};
