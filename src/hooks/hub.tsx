/* eslint-disable no-console */
import React, { createContext, useContext, useEffect, useRef } from "react";
import { HttpTransportType, HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { decodeJwt } from "jose";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { AircraftTrack, Flightplan, SessionInfo } from "../types";
import { updateAircraftTrackThunk, updateFlightplanThunk } from "../redux/thunks/thunks";
import { clearSession, nasTokenSelector, setSession, vatsimTokenSelector } from "../redux/slices/authSlice";
import { refreshToken } from "../api/vNasDataApi";
import { initThunk } from "../redux/thunks/initThunk";

const ATC_SERVER_URL = process.env.REACT_APP_ATC_SERVER_URL;

const useHubInit = () => {
  const dispatch = useRootDispatch();
  const nasToken = useRootSelector(nasTokenSelector)!;
  const vatsimToken = useRootSelector(vatsimTokenSelector)!;
  const ref = useRef<{ hubConnection: HubConnection | null }>({ hubConnection: null });

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

  useEffect(() => {
    if (!ATC_SERVER_URL || !nasToken) {
      return;
    }
    const hubConnection = new HubConnectionBuilder()
      .withUrl(ATC_SERVER_URL, {
        accessTokenFactory: getValidNasToken,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true
      })
      .withAutomaticReconnect()
      .build();

    async function start() {
      hubConnection.onclose(() => {
        console.log("ATC hub disconnected");
      });

      hubConnection.on("HandleSessionStarted", (sessionInfo: SessionInfo) => {
        dispatch(setSession(sessionInfo));
      });

      hubConnection.on("HandleSessionEnded", () => {
        dispatch(clearSession());
      });
      hubConnection.on("receiveFlightplan", (flightplan: Flightplan) => {
        // console.log("received flightplan:", flightplan);
        dispatch(updateFlightplanThunk(flightplan));
      });
      hubConnection.on("receiveAircraft", (aircraft: AircraftTrack[]) => {
        // console.log("received aircraft:", aircraft);
        aircraft.forEach(t => {
          dispatch(updateAircraftTrackThunk({ ...t }));
        });
      });

      await hubConnection
        .start()
        .then(() => {
          hubConnection
            .invoke("getSessionInfo")
            .then((sessionInfo: SessionInfo) => {
              if (sessionInfo.position.eramConfiguration) {
                const { artccId } = sessionInfo;
                const { sectorId } = sessionInfo.position.eramConfiguration;
                dispatch(setSession(sessionInfo));
                dispatch(initThunk({ artccId, sectorId }));
              } else {
                console.log("not signed in to a Center position");
              }
            })
            .catch(() => {
              console.log("No session found");
            });
          console.log("Connected to ATC hub");
        })
        .catch(e => {
          console.error("Error starting connection: ", e);
        });
    }

    hubConnection.keepAliveIntervalInMilliseconds = 1000;
    ref.current.hubConnection = hubConnection;

    start().then();
  }, []);

  return ref.current.hubConnection;
};

type HubContextValue = ReturnType<typeof useHubInit>;

const HubContext = createContext<HubContextValue>(null);

export const HubProvider: React.FC = ({ children }) => {
  const hubConnection = useHubInit();

  return <HubContext.Provider value={hubConnection}>{children}</HubContext.Provider>;
};

export const useHub = () => {
  return useContext(HubContext);
};
/* eslint-enable no-console */
