import io, { Socket } from "socket.io-client";
import _ from "lodash";
import { sharedStateServerToClientEvents } from "../types/sharedStateTypes/sharedStateServerToClientEvents";
import { SharedStateClientToServerEvents } from "../types/sharedStateTypes/sharedStateClientToServerEvents";
import { SharedStateAircraftDto } from "../types/sharedStateTypes/sharedStateAircraftDto";

const SHARED_STATE_SERVER_URL = process.env.REACT_APP_SHARED_STATE_URL;
const SHARED_STATE_AUTH_TOKEN = process.env.REACT_APP_SHARED_STATE_AUTH_KEY;

let socket: Socket<sharedStateServerToClientEvents, SharedStateClientToServerEvents> | null = null;
let sharedSectorId = "";

const sharedState: Record<string, SharedStateAircraftDto> = {};

export function createSocket(artccId: string, sectorId: string) {
  sharedSectorId = `${artccId}${sectorId}`;
  if (SHARED_STATE_SERVER_URL && SHARED_STATE_AUTH_TOKEN) {
    socket = io(SHARED_STATE_SERVER_URL, {
      auth: {
        token: SHARED_STATE_AUTH_TOKEN
      },
      query: {
        sectorId: sharedSectorId
      }
    });
    socket.on("receiveAircraft", aircraft => {
      sharedState[aircraft.aircraftId] = aircraft;
    });
  }
  return socket;
}

export function updateSharedAircraft(aircraft: SharedStateAircraftDto) {
  if (socket && !_.isEqual(sharedState[aircraft.aircraftId], aircraft)) {
    socket.emit("updateAircraft", sharedSectorId, aircraft as SharedStateAircraftDto);
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}
