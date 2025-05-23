import type { ReactNode } from "react";
import React, { createContext, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { HubConnection } from "@microsoft/signalr";
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";
import type { Nullable } from "types/utility-types";
import {
  clearSession,
  envSelector,
  setSession,
  vatsimTokenSelector,
  setSessionIsActive,
  setHubConnected,
  hubConnectedSelector,
  logout,
} from "~redux/slices/authSlice";
import { refreshToken } from "~/api/vNasDataApi";
import type { ApiSessionInfoDto } from "types/apiTypes/apiSessionInfoDto";
import type { EramTrackDto } from "types/apiTypes/EramTrackDto";
import { ApiTopic } from "types/apiTypes/apiTopic";
import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";
import { deleteFlightplanThunk, updateFlightplanThunk } from "~redux/thunks/updateFlightplanThunk";
import type { ApiAircraftTrack } from "types/apiTypes/apiAircraftTrack";
import { addOutageMessage, delOutageMessage, setFsdIsConnected } from "~redux/slices/appSlice";
import { setArtccId, setSectorId } from "~redux/slices/sectorSlice";
import { initThunk } from "~redux/thunks/initThunk";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { useSocketConnector } from "hooks/useSocketConnector";
import { VERSION } from "~/utils/constants";
import { OutageEntry } from "types/outageEntry";
import { HubConnectionState } from "@microsoft/signalr/src/HubConnection";
import { deleteTrackThunk, updateTrackThunk } from "~/redux/thunks/updateTrackThunk";

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
  const dispatch = useRootDispatch();
  const vatsimToken = useRootSelector(vatsimTokenSelector)!;
  const ref = useRef<Nullable<HubConnection>>(null);
  const { disconnectSocket } = useSocketConnector();
  const env = useRootSelector(envSelector);
  const navigate = useNavigate();
  const hubConnected = useRootSelector(hubConnectedSelector);

  const disconnectHub = useCallback(async () => {
    await ref.current?.stop();
    dispatch(setHubConnected(false));
    dispatch(setArtccId(""));
    dispatch(setSectorId(""));
    disconnectSocket();
    logout();
    navigate("/login", { replace: true });
  }, [disconnectSocket, dispatch, navigate]);

  const handleSessionStart = useCallback(
    async (sessionInfo: ApiSessionInfoDto, hubConnection: HubConnection) => {
      if (!sessionInfo || sessionInfo.isPseudoController) {
        return;
      }

      try {
        const primaryPosition = sessionInfo.positions.find((p) => p.isPrimary)?.position;

        if (!primaryPosition?.eramConfiguration) {
          throw new Error("No primary position configuration found");
        }

        // Set state before attempting subscription
        const artccId = sessionInfo.artccId;
        const sectorId = primaryPosition.eramConfiguration.sectorId;

        dispatch(setArtccId(artccId));
        dispatch(setSectorId(sectorId));
        dispatch(setSession(sessionInfo));
        dispatch(setSessionIsActive(sessionInfo.isActive ?? false));
        dispatch(initThunk());

        // Check connection state before subscribing
        if (hubConnection.state === HubConnectionState.Connected) {
          await hubConnection.invoke<void>("subscribe", new ApiTopic("FlightPlans", sessionInfo.positions[0].facilityId));
          await hubConnection.invoke<void>("subscribe", new ApiTopic("EramTracks", sessionInfo.positions[0].facilityId));
          dispatch(setHubConnected(true));
        } else {
          throw new Error("Hub connection not in Connected state");
        }
      } catch (error) {
        console.error("Session start failed:", error);
        await disconnectHub();
      }
    },
    [dispatch, disconnectHub]
  );

  useEffect(() => {
    if (!env || !vatsimToken) {
      return;
    }

    const hubUrl = env.clientHubUrl;

    const getValidNasToken = async () => {
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

    const hubConnection = ref.current;

    hubConnection.onclose(() => {
      dispatch(setArtccId(""));
      dispatch(setSectorId(""));
      dispatch(setHubConnected(false));
      console.log("ATC hub disconnected");
      navigate("/login", { replace: true });
    });

    hubConnection.on("HandleSessionStarted", (sessionInfo: ApiSessionInfoDto) => {
      console.log("Session started:", sessionInfo);
      handleSessionStart(sessionInfo, hubConnection);
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
    hubConnection.on("DeleteFlightplans", async (topic: ApiTopic, flightplans: ApiFlightplan[]) => {
      flightplans.forEach((flightplan) => {
        console.log("deleting flightplan:", flightplan);
        dispatch(deleteFlightplanThunk(flightplan));
      });
    });
    hubConnection.on("ReceiveEramTracks", async (topic: ApiTopic, targets: EramTrackDto[]) => {
      console.log("received targets:", targets);
      targets.forEach((t) => {
        dispatch(updateTrackThunk(t));
      });
    });
    hubConnection.on("DeleteEramTargets", async (topic: ApiTopic, targets: string[]) => {
      console.log("deleting targets:", targets);
      targets.forEach((target) => {
        dispatch(deleteTrackThunk(target));
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

    hubConnection.on("SetSessionActive", (isActive) => {
      dispatch(setSessionIsActive(isActive));
      sessionStorage.setItem("session-active", `${isActive}`);
    });

    hubConnection.keepAliveIntervalInMilliseconds = 1000;

    return () => {
      // Clean up on component unmount
      (async () => {
        try {
          await hubConnection.stop();
        } catch (err) {
          console.error("Error stopping connection:", err);
        }
      })();
    };
  }, [dispatch, navigate, disconnectHub, handleSessionStart, env, vatsimToken]);

  const connectHub = useCallback(async () => {
    if (!env || !vatsimToken || !ref.current) {
      if (ref.current?.state === HubConnectionState.Connected) {
        dispatch(setHubConnected(true));
        return; // Already connected
      }
      dispatch(setHubConnected(false));
      throw new Error(`Cannot connect - env: ${!!env}, token: ${!!vatsimToken}, ref: ${!!ref.current}`);
    }

    const hubConnection = ref.current;

    if (hubConnection.state !== HubConnectionState.Connected) {
      try {
        await hubConnection.start();
        console.log("Connected to hub, waiting for session...");

        // Join session if already available, but don't fail if not
        try {
          const sessions = await hubConnection.invoke<ApiSessionInfoDto[]>("GetSessions");
          const primarySession = sessions?.find((s) => !s.isPseudoController);
          const eramConfig = primarySession?.positions.find((p) => p.isPrimary)?.position.eramConfiguration;

          console.log(sessions);
          console.log(primarySession);

          if (primarySession && eramConfig) {
            await hubConnection.invoke<void>("joinSession", {
              sessionId: primarySession.id,
              clientName: "vEDST",
              clientVersion: VERSION,
            });
            console.log(`joined existing session ${primarySession.id}`);
            console.log(hubConnection);
            await handleSessionStart(primarySession, hubConnection);
          } else {
            console.log("No primary ERAM session found, waiting for HandleSessionStarted event");
          }
        } catch (error) {
          console.log(error);
          console.log("No active session yet, waiting for HandleSessionStarted event");
        }
      } catch (error) {
        dispatch(setHubConnected(false));
        throw error;
      }
    }
  }, [dispatch, handleSessionStart, env, vatsimToken]);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const contextValue = {
    hubConnection: ref.current,
    hubConnected,
    connectHub,
    disconnectHub,
  };

  return <HubContext.Provider value={contextValue}>{children}</HubContext.Provider>;
};
