import React, { useEffect, useRef, useState } from "react";
import { getFrd } from "../../lib";
import { useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entrySlice";
import { FidRow, OptionsBodyCol, OptionsBodyRow } from "../../styles/optionMenuStyles";
import { aselTrackSelector } from "../../redux/slices/trackSlice";
import { EdstWindow } from "../../namespaces";
import { useHub } from "../../hooks/hub";
import { useCenterCursor } from "../../hooks/useCenterCursor";
import { EdstPrompt } from "./EdstPrompt";

type PreviousRouteMenuProps = {
  onSubmit: () => void;
  onCancel: () => void;
};

export const PreviousRouteMenu = ({ onSubmit, onCancel }: PreviousRouteMenuProps) => {
  const entry = useRootSelector(aselEntrySelector)!;
  const aircraftTrack = useRootSelector(aselTrackSelector)!;
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

  return (
    <EdstPrompt
      title="Previous Route Menu"
      windowId={EdstWindow.PREV_ROUTE_MENU}
      width={380}
      submitText="Apply Previous Route"
      onSubmit={onSubmit}
      cancelText="Exit"
      onCancel={onCancel}
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
