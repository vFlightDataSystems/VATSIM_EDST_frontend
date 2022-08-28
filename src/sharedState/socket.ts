import io, { Socket } from "socket.io-client";
import { SharedStateServerToClientEvents } from "../typeDefinitions/types/sharedStateTypes/sharedStateServerToClientEvents";
import { SharedStateClientToServerEvents } from "../typeDefinitions/types/sharedStateTypes/sharedStateClientToServerEvents";
import { SharedAircraftDto } from "../typeDefinitions/types/sharedStateTypes/sharedAircraftDto";
import { AclSortOption } from "../typeDefinitions/enums/acl/aclSortOption";
import { DepSortOption } from "../typeDefinitions/enums/dep/depSortOption";
import { Plan } from "../typeDefinitions/types/plan";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";
import { Asel } from "../types/asel";

const SHARED_STATE_SERVER_URL = process.env.REACT_APP_SHARED_STATE_URL;
const SHARED_STATE_AUTH_TOKEN = process.env.REACT_APP_SHARED_STATE_AUTH_KEY;

class SharedStateSocket {
  private socket: Socket<SharedStateServerToClientEvents, SharedStateClientToServerEvents> | null = null;

  public getSocket() {
    return this.socket;
  }

  artccSectorId = "";

  private sharedAircraftState: Record<string, SharedAircraftDto> = {};

  public getSharedAircraftState() {
    return this.sharedAircraftState;
  }

  public connect(artccId: string, sectorId: string) {
    this.artccSectorId = `${artccId}${sectorId}`;
    if (SHARED_STATE_SERVER_URL && SHARED_STATE_AUTH_TOKEN) {
      this.socket = io(SHARED_STATE_SERVER_URL, {
        auth: {
          token: SHARED_STATE_AUTH_TOKEN
        },
        query: {
          sectorId: this.artccSectorId
        }
      });
      this.socket?.on("receiveAircraft", aircraft => {
        this.sharedAircraftState[aircraft.aircraftId] = aircraft;
      });
    }
    return this.socket;
  }

  public updateSharedAircraft(aircraft: SharedAircraftDto) {
    if (this.socket?.connected) {
      this.socket.emit("updateAircraft", this.artccSectorId, aircraft);
    }
  }

  public setSharedAclSort(selectedOption: AclSortOption, sector: boolean) {
    if (this.socket?.connected) {
      this.socket.emit("setAclSort", selectedOption, sector);
    }
  }

  public setSharedDepSort(selectedOption: DepSortOption) {
    if (this.socket?.connected) {
      this.socket.emit("setDepSort", selectedOption);
    }
  }

  public setSharedPlanQueue(queue: Plan[]) {
    if (this.socket?.connected) {
      this.socket.emit("setPlanQueue", queue);
    }
  }

  public cleanSharedPlanQueue() {
    if (this.socket?.connected) {
      this.socket.emit("clearPlanQueue");
    }
  }

  public setSharedWindowIsOpen(window: EdstWindow, value: boolean) {
    if (this.socket?.connected) {
      this.socket.emit("setWindowIsOpen", window, value);
    }
  }

  public setSharedAclManualPosting(value: boolean) {
    if (this.socket?.connected) {
      this.socket.emit("setAclManualPosting", value);
    }
  }

  public setSharedDepManualPosting(value: boolean) {
    if (this.socket?.connected) {
      this.socket.emit("setDepManualPosting", value);
    }
  }

  public setAircraftSelect(value: Asel | null) {
    if (this.socket?.connected) {
      this.socket.emit("setAircraftSelect", value);
    }
  }

  public disconnect() {
    if (this.socket?.connected) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
  }
}

const socket = new SharedStateSocket();
export default socket;
