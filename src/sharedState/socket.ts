import io, { Socket } from "socket.io-client";
import _ from "lodash";
import { SharedStateServerToClientEvents } from "../types/sharedStateTypes/sharedStateServerToClientEvents";
import { SharedStateClientToServerEvents } from "../types/sharedStateTypes/sharedStateClientToServerEvents";
import { SharedStateAircraftDto } from "../types/sharedStateTypes/sharedStateAircraftDto";

const SHARED_STATE_SERVER_URL = process.env.REACT_APP_SHARED_STATE_URL;
const SHARED_STATE_AUTH_TOKEN = process.env.REACT_APP_SHARED_STATE_AUTH_KEY;

let socket: Socket<SharedStateServerToClientEvents, SharedStateClientToServerEvents> | null = null;
let ArtccSectorId = "";

export const sharedState: Record<string, SharedStateAircraftDto> = {};

export function createSocket(artccId: string, sectorId: string) {
  ArtccSectorId = `${artccId}${sectorId}`;
  if (SHARED_STATE_SERVER_URL && SHARED_STATE_AUTH_TOKEN) {
    socket = io(SHARED_STATE_SERVER_URL, {
      auth: {
        token: SHARED_STATE_AUTH_TOKEN
      },
      query: {
        sectorId: ArtccSectorId
      }
    });
    socket?.on("receiveAircraft", aircraft => {
      sharedState[aircraft.aircraftId] = aircraft;
    });
  }
  return socket;
}

export function updateSharedAircraft(aircraft: SharedStateAircraftDto) {
  if (socket?.connected && !_.isEqual(sharedState[aircraft.aircraftId], aircraft)) {
    socket.emit("updateAircraft", ArtccSectorId, aircraft);
  }
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
