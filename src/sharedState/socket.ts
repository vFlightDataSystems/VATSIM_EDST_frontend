import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import type { Nullable } from "types/utility-types";
import type { SharedStateClientToServerEvents } from "types/sharedStateTypes/sharedStateClientToServerEvents";
import type { SharedAircraftDto } from "types/sharedStateTypes/sharedAircraftDto";
import type { EdstWindow } from "enums/edstWindow";
import type { Asel } from "types/asel";
import type { SharedUiEvent } from "types/sharedStateTypes/sharedUiEvent";
import type { AclState } from "~redux/slices/aclSlice";
import type { DepState } from "~redux/slices/depSlice";
import type { PlanState } from "~redux/slices/planSlice";
import type { SharedStateServerToClientEvents } from "types/sharedStateTypes/sharedStateServerToClientEvents";
import type { SharedGpdState } from "~redux/slices/gpdSlice";

const SHARED_STATE_SERVER_URL = import.meta.env.VITE_SHARED_STATE_URL;
const SHARED_STATE_AUTH_TOKEN = import.meta.env.VITE_SHARED_STATE_AUTH_KEY;

class SharedStateSocket {
  socket: Socket<SharedStateServerToClientEvents, SharedStateClientToServerEvents> | null = null;

  artccId = "";

  sectorId = "";

  private sharedAircraftState: Record<string, SharedAircraftDto> = {};

  public getSharedAircraftState() {
    return this.sharedAircraftState;
  }

  public connect(artccId: string, sectorId: string) {
    this.artccId = artccId;
    this.sectorId = sectorId;
    if (SHARED_STATE_SERVER_URL && SHARED_STATE_AUTH_TOKEN) {
      this.socket = io(SHARED_STATE_SERVER_URL, {
        auth: {
          token: SHARED_STATE_AUTH_TOKEN,
        },
        query: {
          artccId,
          sectorId,
        },
      });
      this.socket.connect();
      this.socket?.on("receiveAircraft", (aircraft) => {
        this.sharedAircraftState[aircraft.aircraftId] = aircraft;
      });
    }
    return this.socket;
  }

  public updateSharedAircraft(aircraft: SharedAircraftDto) {
    if (this.socket?.connected) {
      this.socket.emit("updateAircraft", aircraft);
    }
  }

  public setAclState(state: AclState) {
    if (this.socket?.connected) {
      this.socket.emit("setAclState", state);
    }
  }

  public setDepState(state: DepState) {
    if (this.socket?.connected) {
      this.socket.emit("setDepState", state);
    }
  }

  public setPlanState(state: PlanState) {
    if (this.socket?.connected) {
      this.socket.emit("setPlanState", state);
    }
  }

  public setGpdState(state: SharedGpdState) {
    if (this.socket?.connected) {
      this.socket.emit("setGpdState", state);
    }
  }

  public openSharedWindow(window: EdstWindow) {
    if (this.socket?.connected) {
      this.socket.emit("openWindow", window);
    }
  }

  public closeSharedWindow(window: EdstWindow) {
    if (this.socket?.connected) {
      this.socket.emit("closeWindow", window);
    }
  }

  public setAircraftSelect(value: Nullable<Asel>, eventId: Nullable<string>) {
    if (this.socket?.connected) {
      this.socket.emit("setAircraftSelect", value, eventId);
    }
  }

  public dispatchUiEvent(eventId: SharedUiEvent, arg?: any) {
    if (this.socket?.connected) {
      this.socket.emit("dispatchUiEvent", eventId, arg);
    }
  }

  public sendGIMessage(recipient: string, message: string, callback: (rejectReason?: string) => void) {
    if (this.socket?.connected) {
      this.socket.emit("sendGIMessage", recipient, message, callback);
    } else {
      callback("NOT CONNECTED");
    }
  }

  public disconnect() {
    if (this.socket?.connected) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socket = new SharedStateSocket();
export default socket;
