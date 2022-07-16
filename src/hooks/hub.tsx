/* eslint-disable no-console */
import React, { createContext, useContext, useEffect, useRef } from "react";
import { HttpTransportType, HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { decodeJwt } from "jose";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { updateAircraftTrackThunk, updateFlightplanThunk } from "../redux/thunks/thunks";
import { clearSession, nasTokenSelector, setSession, vatsimTokenSelector } from "../redux/slices/authSlice";
import { refreshToken } from "../api/vNasDataApi";
import { initThunk } from "../redux/thunks/initThunk";
import { setArtccId, setSectorId } from "../redux/slices/sectorSlice";
import { ApiFlightplan } from "../types/apiFlightplan";
import { ApiAircraftTrack } from "../types/apiAircraftTrack";
import { ApiSessionInfo } from "../types/apiSessionInfo";

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

      hubConnection.on("HandleSessionStarted", (sessionInfo: ApiSessionInfo) => {
        dispatch(setSession(sessionInfo));
      });

      hubConnection.on("HandleSessionEnded", () => {
        dispatch(clearSession());
      });
      hubConnection.on("receiveFlightplan", (flightplan: ApiFlightplan) => {
        // console.log("received flightplan:", flightplan);
        dispatch(updateFlightplanThunk(flightplan));
      });
      hubConnection.on("receiveAircraft", (aircraft: ApiAircraftTrack[]) => {
        // console.log("received aircraft:", aircraft);
        aircraft.forEach(t => {
          dispatch(updateAircraftTrackThunk(t));
        });
      });

      await hubConnection
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
              } else {
                console.log("not signed in to a Center position");
              }
            })
            .catch(() => {
              const sessionInfo = {
                artccId: "ZBW",
                facilityId: "ZBW",
                id: "01G3CZTG1TFZZ4EB2PJ5P4MJ2X",
                isActive: true,
                position: {
                  callsign: "BOS_37_CTR",
                  eramConfiguration: {
                    sectorId: "37"
                  },
                  frequency: 134700000,
                  id: "",
                  name: "Concord 37",
                  radioName: "Boston Center"
                },
                positionId: "01G3CZTG1TFZZ4EB2PJ5P4MJ2X"
              };
              const { artccId } = sessionInfo;
              const { sectorId } = sessionInfo.position.eramConfiguration;
              dispatch(setArtccId(artccId));
              dispatch(setSectorId(sectorId));
              dispatch(setSession(sessionInfo));
              dispatch(initThunk());
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
