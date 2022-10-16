import { RefObject, useEffect } from "react";
import sharedStateSocket from "../sharedState/socket";
import { Asel } from "../typeDefinitions/types/asel";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";
import { Nullable } from "../typeDefinitions/utility-types";

type Handler<F> = (element: HTMLElement, field: F, eventId: Nullable<string>, opensWindow?: EdstWindow, triggerSharedState?: boolean) => void;

export function useAselEventListener<F>(
  ref: RefObject<HTMLElement>,
  aircraftId: string,
  eventId: string,
  field: F,
  opensWindow: EdstWindow,
  handler: Handler<F>
) {
  useEffect(() => {
    const eventHandler = (asel: Nullable<Asel>, evId: Nullable<string>) => {
      if (ref.current && eventId === evId && asel?.aircraftId === aircraftId) {
        handler(ref.current, field, eventId, opensWindow, false);
      }
    };
    sharedStateSocket.socket?.on("receiveAircraftSelect", eventHandler);
    return () => {
      sharedStateSocket.socket?.off("receiveAircraftSelect", eventHandler);
    };
  }, [handler, aircraftId, field, eventId, opensWindow, ref]);
}
