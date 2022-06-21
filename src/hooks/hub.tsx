import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { HttpTransportType, HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";
import { useRootDispatch } from "../redux/hooks";
import { AircraftTrack, Flightplan } from "../types";
import { updateAircraftTrackThunk, updateFlightplanThunk } from "../redux/thunks/thunks";

const ATC_SERVER_URL = process.env.REACT_APP_ATC_SERVER_URL;

const useHubInit = () => {
  const dispatch = useRootDispatch();
  const [hubConnected, setHubConnected] = useState(false);
  const navigate = useNavigate();
  // const [accessToken, setAccessToken] = useState(null);
  // const [cpdlcSessions, setCpdlcSessions] = useState<any[]>([]);
  // const [cpdlcMessages, setCpdlcMessages] = useState<any[]>([]);
  const ref = useRef<{ hubConnection: HubConnection | null }>({ hubConnection: null });

  /* eslint-disable no-console */

  useEffect(() => {
    if (!ATC_SERVER_URL) {
      return;
    }
    const hubConnection = new HubConnectionBuilder()
      .withUrl(ATC_SERVER_URL, {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true
      })
      .withAutomaticReconnect()
      .build();

    async function start() {
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
          console.log("Connected to ATC server");
        })
        .catch(e => {
          console.error("Error starting connection: ", e);
          navigate("/login", { replace: true });
        });
    }

    hubConnection.keepAliveIntervalInMilliseconds = 1000;
    ref.current.hubConnection = hubConnection;

    start().then(() => {
      setHubConnected(true);
    });
  }, []);

  /* eslint-enable no-console */

  return ref.current.hubConnection;
};

type HubContextValue = ReturnType<typeof useHubInit>;

const HubContext = createContext<HubContextValue>(null);

export const HubProvider: React.FC = ({ children }) => {
  const hub = useHubInit();

  return <HubContext.Provider value={hub}>{children}</HubContext.Provider>;
};

export const useHub = () => {
  return useContext(HubContext);
};
