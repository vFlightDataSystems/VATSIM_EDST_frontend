import { useEffect } from "react";
import sharedStateSocket from "../sharedState/socket";
import { SharedUiEvent } from "../typeDefinitions/types/sharedStateTypes/sharedUiEvent";

export function useSharedUiListener<T = any>(
  eventId: SharedUiEvent,
  handler: (arg: T, eventId: SharedUiEvent, triggerSharedState?: boolean) => void,
  arg: T
) {
  useEffect(() => {
    const eventHandler = (evId: SharedUiEvent) => {
      if (evId === eventId && handler && arg) {
        handler(arg, eventId, false);
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
  }, [arg, eventId, handler]);
}

export function useSharedUiListenerWithElement<T = any>(
  eventId?: SharedUiEvent,
  element?: HTMLElement | null,
  handler?: (element: HTMLElement, args: T) => void,
  args?: T
) {
  useEffect(() => {
    const eventHandler = (evId: SharedUiEvent) => {
      if (evId === eventId && element && handler && args) {
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
