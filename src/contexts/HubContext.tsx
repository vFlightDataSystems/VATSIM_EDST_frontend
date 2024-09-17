import type { ReactNode } from "react";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";
import type { Nullable } from "types/utility-types";
import { clearSession, envSelector, setSession, vatsimTokenSelector } from "~redux/slices/authSlice";
import { refreshToken } from "~/api/vNasDataApi";
import type { ApiSessionInfoDto } from "types/apiTypes/apiSessionInfoDto";
import { ApiTopic } from "types/apiTypes/apiTopic";
import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";
import { updateFlightplanThunk } from "~redux/thunks/updateFlightplanThunk";
import type { ApiAircraftTrack } from "types/apiTypes/apiAircraftTrack";
import { addOutageMessage, delOutageMessage, setFsdIsConnected } from "~redux/slices/appSlice";
import { setArtccId, setSectorId } from "~redux/slices/sectorSlice";
import { initThunk } from "~redux/thunks/initThunk";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { useSocketConnector } from "hooks/useSocketConnector";
import { VERSION } from "~/utils/constants";
import { OutageEntry } from "types/outageEntry";
import { HubConnectionState } from "@microsoft/signalr/src/HubConnection";
import { plainToInstance } from "class-transformer";

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
  const env = useRootSelector(envSelector);

  useEffect(() => {
    if (!env || !vatsimToken) {
      return;
    }

    const hubUrl = env.clientHubUrl;

    const getValidNasToken = async () => {
      // const decodedToken = decodeJwt(nasToken);
      return refreshToken(env.apiBaseUrl, vatsimToken).then((r) => {
        console.log("Refreshed NAS token");
        return r.data;
      });
    };

    ref.current = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: getValidNasToken,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .build();
  }, [env, vatsimToken]);

  const connectHub = useCallback(async () => {
    if (!env || !vatsimToken || !ref.current) {
      if (ref.current?.state === HubConnectionState.Connected) {
        setHubConnected(true);
        throw new Error("ALREADY CONNECTED");
      }
      setHubConnected(false);
      throw new Error("SOMETHING WENT WRONG");
    }
    const hubConnection = ref.current;
    async function start() {
      hubConnection.onclose(() => {
        dispatch(setArtccId(""));
        dispatch(setSectorId(""));
        setHubConnected(false);
        console.log("ATC hub disconnected");
      });
      hubConnection.on("HandleSessionStarted", (sessionInfo: ApiSessionInfoDto) => {
        console.log(sessionInfo);
        dispatch(setSession(sessionInfo));
      });

      hubConnection.on("HandleSessionEnded", () => {
        console.log("clearing session");
        dispatch(clearSession());
        disconnectHub();
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
      hubConnection.on("handleFsdConnectionStateChanged", (state: boolean) => {
        dispatch(setFsdIsConnected(state));
        if (!state) {
          dispatch(addOutageMessage(new OutageEntry("FSD_DOWN", "FSD CONNECTION DOWN")));
        } else {
          dispatch(delOutageMessage("FSD_DOWN"));
        }
      });

      await hubConnection.start();
      let sessions: ApiSessionInfoDto[];
      try {
        sessions = await hubConnection.invoke<ApiSessionInfoDto[]>("GetSessions");
      } catch {
        disconnectHub();
        throw new Error("SESSION NOT FOUND");
      }

      const primarySession = sessions.find((s) => !s.isPseudoController) as ApiSessionInfoDto;
      
      if(!primarySession) {
        disconnectHub();
        throw new Error("PRIMARY SESSION NOT FOUND");
      }

      const primaryPosition = primarySession.positions.find((p) => p.isPrimary)?.position;

      if(!primaryPosition) {
        disconnectHub();
        throw new Error("PRIMARY POSITION NOT FOUND");
      }

      if (primaryPosition?.eramConfiguration) {
        const artccId = primarySession.artccId;
        const sectorId = primaryPosition.eramConfiguration.sectorId;
        dispatch(setArtccId(artccId));
        dispatch(setSectorId(sectorId));
        dispatch(setSession(primarySession));
        dispatch(initThunk());
        await hubConnection.invoke<void>("joinSession", {
          sessionId: primarySession.id,
          clientName: "vEDST",
          clientVersion: VERSION,
        });
        console.log(`joined session ${primarySession.id}`);
        setHubConnected(true);
        hubConnection.invoke<void>("subscribe", new ApiTopic("FlightPlans", primarySession.positions[0].facilityId)).catch(async () => {
          await hubConnection.stop();
          setHubConnected(false);
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
  }, [dispatch, env, vatsimToken]);

  const disconnectHub = useCallback(async () => {
    await ref.current?.stop();
    setHubConnected(false);
    dispatch(setArtccId(""));
    dispatch(setSectorId(""));
    disconnectSocket();
  }, [disconnectSocket, dispatch]);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const contextValue = {
    hubConnection: ref.current,
    hubConnected,
    connectHub,
    disconnectHub,
  };

  return <HubContext.Provider value={contextValue}>{children}</HubContext.Provider>;
};
