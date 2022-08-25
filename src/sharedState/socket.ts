import io, { Socket } from "socket.io-client";
import { SharedStateServerToClientEvents } from "../typeDefinitions/types/sharedStateTypes/sharedStateServerToClientEvents";
import { SharedStateClientToServerEvents } from "../typeDefinitions/types/sharedStateTypes/sharedStateClientToServerEvents";
import { SharedAircraftDto } from "../typeDefinitions/types/sharedStateTypes/sharedAircraftDto";
import { AclSortOption } from "../typeDefinitions/enums/acl/aclSortOption";
import { DepSortOption } from "../typeDefinitions/enums/dep/depSortOption";
import { Plan } from "../typeDefinitions/types/plan";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";

const SHARED_STATE_SERVER_URL = process.env.REACT_APP_SHARED_STATE_URL;
const SHARED_STATE_AUTH_TOKEN = process.env.REACT_APP_SHARED_STATE_AUTH_KEY;

let socket: Socket<SharedStateServerToClientEvents, SharedStateClientToServerEvents> | null = null;
let ArtccSectorId = "";

export const sharedState: Record<string, SharedAircraftDto> = {};

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

export function updateSharedAircraft(aircraft: SharedAircraftDto) {
  if (socket?.connected) {
    socket.emit("updateAircraft", ArtccSectorId, aircraft);
  }
}

export function setSharedAclSort(selectedOption: AclSortOption, sector: boolean) {
  if (socket?.connected) {
    socket.emit("setAclSort", selectedOption, sector);
  }
}

export function setSharedDepSort(selectedOption: DepSortOption) {
  if (socket?.connected) {
    socket.emit("setDepSort", selectedOption);
  }
}

export function setSharedPlanQueue(queue: Plan[]) {
  if (socket?.connected) {
    socket.emit("setPlanQueue", queue);
  }
}

export function cleanSharedPlanQueue() {
  if (socket?.connected) {
    socket.emit("clearPlanQueue");
  }
}

export function setSharedWindowIsOpen(window: EdstWindow, value: boolean) {
  if (socket?.connected) {
    socket.emit("setWindowIsOpen", window, value);
  }
}

export function setSharedAclManualPosting(value: boolean) {
  if (socket?.connected) {
    socket.emit("setAclManualPosting", value);
  }
}

export function setSharedDepManualPosting(value: boolean) {
  if (socket?.connected) {
    socket.emit("setDepManualPosting", value);
  }
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
