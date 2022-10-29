import type { RefObject } from "react";
import { useEffect } from "react";
import type { Nullable } from "types/utility-types";
import type { Asel } from "types/asel";
import sharedStateSocket from "~socket";
import type { EdstWindow } from "enums/edstWindow";

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
