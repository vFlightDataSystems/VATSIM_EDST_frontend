import { useEffect } from "react";
import type { Nullable } from "types/utility-types";
import sharedStateSocket from "~socket";
import type { SharedUiEvent } from "types/sharedStateTypes/sharedUiEvent";

export function useSharedUiListener<T = any>(
  eventId: SharedUiEvent,
  handler: (arg: T, eventId: SharedUiEvent, triggerSharedState?: boolean) => void,
  arg?: T
) {
  useEffect(() => {
    const eventHandler = (evId: SharedUiEvent, serverArg?: T) => {
      if (evId === eventId && handler) {
        if (arg !== undefined) {
          handler(arg, eventId, false);
        } else if (serverArg !== undefined) {
          handler(serverArg, eventId, false);
        }
      }
    };
    if (eventId) {
      sharedStateSocket.socket?.on("receiveUiEvent", eventHandler);
    }
    return () => {
      if (eventId) {
        sharedStateSocket.socket?.off("receiveUiEvent", eventHandler);
      }
    };
  }, [eventId, handler, arg]);
}

export function useSharedUiListenerWithElement<T = any>(
  eventId?: SharedUiEvent,
  element?: Nullable<HTMLElement>,
  handler?: (element: HTMLElement, args: T) => void,
  args?: T
) {
  useEffect(() => {
    const eventHandler = (evId: SharedUiEvent) => {
      if (evId === eventId && element && handler && args !== undefined) {
        handler(element, args);
      }
    };
    if (eventId) {
      sharedStateSocket.socket?.on("receiveUiEvent", eventHandler);
    }
    return () => {
      if (eventId) {
        sharedStateSocket.socket?.off("receiveUiEvent", eventHandler);
      }
    };
  }, [handler, eventId, element, args]);
}
