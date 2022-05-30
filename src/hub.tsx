import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { HttpTransportType, HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useRootDispatch, useRootSelector } from "./redux/hooks";
import { entriesSelector } from "./redux/slices/entriesSlice";

const ATC_SERVER_URL = "";

const useHubInit = () => {
  const dispatch = useRootDispatch();
  const entries = useRootSelector(entriesSelector);
  const [hubConnected, setHubConnected] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [cpdlcSessions, setCpdlcSessions] = useState<any[]>([]);
  const [cpdlcMessages, setCpdlcMessages] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const ref = useRef<{ hubConnection: HubConnection | null }>({ hubConnection: null });

  return {
    hubConnection: ref.current.hubConnection,
    hubConnected,
    cpdlcSessions,
    cpdlcMessages,
    tracks
  };
};

type HubContextType = { hubConnection: HubConnection | null; hubConnected: boolean; cpdlcSessions: any[]; cpdlcMessages: any[]; tracks: any[] };

const HubContext = createContext<HubContextType | null>(null);

export const HubProvider: React.FC = ({ children }) => {
  const hub = useHubInit();

  return <HubContext.Provider value={hub}>{children}</HubContext.Provider>;
};

export const useHub = () => {
  return useContext(HubContext);
};
