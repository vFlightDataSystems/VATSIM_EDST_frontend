/* eslint-disable no-console */
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { HttpTransportType, HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { decodeJwt } from "jose";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { clearSession, nasTokenSelector, setSession, vatsimTokenSelector } from "../redux/slices/authSlice";
import { refreshToken } from "../api/vNasDataApi";
import { initThunk } from "../redux/thunks/initThunk";
import { setArtccId, setSectorId } from "../redux/slices/sectorSlice";
import { ApiFlightplan } from "../types/apiFlightplan";
import { ApiAircraftTrack } from "../types/apiAircraftTrack";
import { ApiSessionInfo } from "../types/apiSessionInfo";
import { Topic } from "../types/topic";
import { updateAircraftTrackThunk } from "../redux/thunks/updateAircraftTrackThunk";
import { updateFlightplanThunk } from "../redux/thunks/updateFlightplanThunk";

const ATC_SERVER_URL = process.env.REACT_APP_ATC_HUB_URL;

const useHubInit = () => {
  const [, setHubConnected] = useState(false);
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

      hubConnection.on("HandleSessionStarted", (sessionInfo: ApiSessionInfo) => {
        console.log(sessionInfo);
        dispatch(setSession(sessionInfo));
      });

      hubConnection.on("HandleSessionEnded", () => {
        console.log("clearing session");
        dispatch(clearSession());
      });
      hubConnection.on("receiveFlightplan", (topic: Topic, flightplan: ApiFlightplan) => {
        // console.log("received flightplan:", flightplan);
        dispatch(updateFlightplanThunk(flightplan));
      });
      hubConnection.on("receiveAircraft", (aircraft: ApiAircraftTrack[]) => {
        // console.log("received aircraft:", aircraft);
        aircraft.forEach(t => {
          dispatch(updateAircraftTrackThunk(t));
        });
      });

      hubConnection
        .start()
        .then(() => {
          hubConnection
            .invoke("getSessionInfo")
            .then((sessionInfo: ApiSessionInfo) => {
              console.log(sessionInfo);
              if (sessionInfo.position.eramConfiguration) {
                const { artccId } = sessionInfo;
                const { sectorId } = sessionInfo.position.eramConfiguration;
                dispatch(setArtccId(artccId));
                dispatch(setSectorId(sectorId));
                dispatch(setSession(sessionInfo));
                dispatch(initThunk());
                hubConnection
                  .invoke("joinSession", { sessionId: sessionInfo.id })
                  .then(() => {
                    console.log(`joined session ${sessionInfo.id}`);
                    hubConnection
                      .invoke("subscribe", { facilityId: sessionInfo.facilityId, category: "Eram", subCategory: "FlightPlans" })
                      .then(() => console.log("subscribe succeeded."))
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
    ref.current.hubConnection = hubConnection;

    start().then();
  }, []);

  return ref.current.hubConnection;
};

type HubContextValue = ReturnType<typeof useHubInit>;

const HubContext = createContext<HubContextValue>(null);

export const HubProvider: React.FC = ({ children }) => {
  const hubConnection = useHubInit();
  console.log(hubConnection);

  return <HubContext.Provider value={hubConnection}>{children}</HubContext.Provider>;
};

export const useHub = () => {
  return useContext(HubContext);
};
/* eslint-enable no-console */
