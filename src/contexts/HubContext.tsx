/* eslint-disable no-console */
import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { HttpTransportType, HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { decodeJwt } from "jose";
import { log } from "../utils/console";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { clearSession, nasTokenSelector, setSession, vatsimTokenSelector } from "../redux/slices/authSlice";
import { refreshToken } from "../api/vNasDataApi";
import { ApiSessionInfoDto } from "../typeDefinitions/types/apiTypes/apiSessionInfoDto";
import { ApiTopic } from "../typeDefinitions/types/apiTypes/apiTopic";
import { ApiFlightplan } from "../typeDefinitions/types/apiTypes/apiFlightplan";
import { updateFlightplanThunk } from "../redux/thunks/updateFlightplanThunk";
import { ApiAircraftTrack } from "../typeDefinitions/types/apiTypes/apiAircraftTrack";
import { updateAircraftTrackThunk } from "../redux/thunks/updateAircraftTrackThunk";
import { setMcaRejectMessage } from "../redux/slices/appSlice";
import { setArtccId, setSectorId } from "../redux/slices/sectorSlice";
import { initThunk } from "../redux/thunks/initThunk";
import { useSocketConnector } from "../hooks/useSocketConnector";

const ATC_SERVER_URL = process.env.REACT_APP_ATC_HUB_URL;

const useHubContextInit = () => {
  const [hubConnected, setHubConnected] = useState(false);
  const dispatch = useRootDispatch();
  const nasToken = useRootSelector(nasTokenSelector)!;
  const vatsimToken = useRootSelector(vatsimTokenSelector)!;
  const ref = useRef<HubConnection | null>(null);
  const { connectSocket, disconnectSocket } = useSocketConnector();

  useEffect(() => {
    if (!ATC_SERVER_URL || !nasToken) {
      return;
    }

    const getValidNasToken = () => {
      const decodedToken = decodeJwt(nasToken);
      if (decodedToken.exp! - Math.trunc(Date.now() / 1000) < 0) {
        console.log("Refreshed NAS token");
        return refreshToken(vatsimToken).then(r => {
          return r.data;
        });
      }
      return nasToken;
    };

    ref.current = new HubConnectionBuilder()
      .withUrl(ATC_SERVER_URL, {
        accessTokenFactory: getValidNasToken,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true
      })
      .withAutomaticReconnect()
      .build();
  }, [nasToken, vatsimToken]);

  const connectHub = useCallback(async () => {
    if (!ATC_SERVER_URL || !nasToken || hubConnected || !ref.current) {
      return Promise.reject();
    }
    const hubConnection = ref.current;
    async function start() {
      hubConnection.onclose(() => {
        dispatch(setArtccId(""));
        dispatch(setSectorId(""));
        log("ATC hub disconnected");
      });

      hubConnection.on("HandleSessionStarted", (sessionInfo: ApiSessionInfoDto) => {
        log(sessionInfo);
        dispatch(setSession(sessionInfo));
      });

      hubConnection.on("HandleSessionEnded", () => {
        log("clearing session");
        dispatch(clearSession());
      });
      hubConnection.on("receiveFlightplan", async (topic: ApiTopic, flightplan: ApiFlightplan) => {
        log("received flightplan:", flightplan);
        dispatch(updateFlightplanThunk(flightplan));
      });
      hubConnection.on("receiveAircraft", (aircraft: ApiAircraftTrack[]) => {
        // log("received aircraft:", aircraft);
        aircraft.forEach(t => {
          dispatch(updateAircraftTrackThunk(t));
        });
      });

      hubConnection.on("receiveError", (message: string) => {
        dispatch(setMcaRejectMessage(message));
      });

      hubConnection
        .start()
        .then(() => {
          hubConnection
            .invoke<ApiSessionInfoDto>("getSessionInfo")
            .then(sessionInfo => {
              log(sessionInfo);
              const primaryPosition = sessionInfo?.positions.slice(0).filter(pos => pos.isPrimary)?.[0]?.position;
              if (primaryPosition?.eramConfiguration) {
                const artccId = sessionInfo.artccId;
                const sectorId = primaryPosition.eramConfiguration.sectorId;
                dispatch(setArtccId(artccId));
                dispatch(setSectorId(sectorId));
                connectSocket(artccId, sectorId);
                dispatch(setSession(sessionInfo));
                dispatch(initThunk());
                hubConnection
                  .invoke<void>("joinSession", { sessionId: sessionInfo.id })
                  .then(() => {
                    log(`joined session ${sessionInfo.id}`);
                    hubConnection
                      .invoke<void>("subscribe", new ApiTopic("FlightPlans", sessionInfo.positions[0].facilityId))
                      .then(() => log("subscribe succeeded."))
                      .catch(console.log);
                  })
                  .catch(console.log);
              } else {
                console.log("not signed in to a Center position");
              }
            })
            .catch(() => {
              console.log("No session found");
            });
          setHubConnected(true);
          console.log("Connected to ATC hub");
        })
        .catch(e => {
          console.error("Error starting connection: ", e);
        });
    }

    hubConnection.keepAliveIntervalInMilliseconds = 1000;

    return start();
  }, [connectSocket, dispatch, hubConnected, nasToken]);

  const disconnectHub = useCallback(async () => {
    ref.current?.stop().then(() => setHubConnected(false));
    disconnectSocket();
  }, [disconnectSocket]);

  return {
    hubConnection: ref.current,
    connectHub,
    disconnectHub
  };
};

type HubContextValue = ReturnType<typeof useHubContextInit>;

export const HubContext = createContext<HubContextValue>({ connectHub: Promise.reject, disconnectHub: Promise.reject, hubConnection: null });

export const HubContextProvider = ({ children }: { children: ReactNode }) => {
  const hubConnection = useHubContextInit();
  log(hubConnection);

  return <HubContext.Provider value={hubConnection}>{children}</HubContext.Provider>;
};
/* eslint-enable no-console */
