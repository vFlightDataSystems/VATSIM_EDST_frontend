import { useEffect } from "react";
import sharedStateSocket from "../sharedState/socket";
import { Asel } from "../typeDefinitions/types/asel";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";

type Handler<F> = (element: HTMLElement, field: F, eventId: string | null, opensWindow?: EdstWindow, triggeredBySharedState?: boolean) => void;

export function useAselEventListener<F>(
  element: HTMLElement | null,
  aircraftId: string,
  eventId: string,
  field: F,
  opensWindow: EdstWindow,
  handler: Handler<F>
) {
  useEffect(() => {
    const eventHandler = (asel: Asel | null, evId: string | null) => {
      if (element && eventId === evId && asel?.aircraftId === aircraftId) {
        handler(element, field, eventId, opensWindow, true);
      }
    };
    sharedStateSocket.socket?.on("receiveAircraftSelect", eventHandler);
    return () => {
      sharedStateSocket.socket?.off("receiveAircraftSelect", eventHandler);
    };
  }, [handler, aircraftId, field, eventId, opensWindow, element]);
}
