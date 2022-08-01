import React, { useEffect, useRef, useState } from "react";

import { getFrd, removeDestFromRouteString } from "../../lib";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entrySlice";
import { closeWindow } from "../../redux/slices/appSlice";
import { FidRow, OptionsBodyCol, OptionsBodyRow } from "../../styles/optionMenuStyles";
import { aselTrackSelector } from "../../redux/slices/trackSlice";
import { EdstWindow } from "../../namespaces";
import { useHub } from "../../hooks/hub";
import { useCenterCursor } from "../../hooks/useCenterCursor";
import { EdstPrompt } from "../prompts/EdstPrompt";

export const PreviousRouteMenu = () => {
  const entry = useRootSelector(aselEntrySelector)!;
  const aircraftTrack = useRootSelector(aselTrackSelector)!;
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const [frd, setFrd] = useState(null);
  const hubConnection = useHub();
  useCenterCursor(ref);

  useEffect(() => {
    async function updateFrd() {
      setFrd(await getFrd(aircraftTrack.location, hubConnection));
    }

    updateFrd().then();
  }, []);

  const route = removeDestFromRouteString(entry.route.slice(0), entry.destination);

  const onSubmit = () => {
    // TODO: implement
    dispatch(closeWindow(EdstWindow.PREV_ROUTE_MENU));
  };

  return (
    <EdstPrompt
      title="Previous Route Menu"
      windowId={EdstWindow.PREV_ROUTE_MENU}
      width={380}
      aircraftId={entry.aircraftId}
      submitText="Apply Previous Route"
      onSubmit={onSubmit}
      cancelText="Exit"
      id="previous-route-menu"
    >
      <FidRow>
        {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
      </FidRow>
      <OptionsBodyRow padding="0 8px">
        <OptionsBodyCol>
          RTE {frd || ""}
          {entry.previousRoute}
        </OptionsBodyCol>
      </OptionsBodyRow>
    </EdstPrompt>
  );
};
