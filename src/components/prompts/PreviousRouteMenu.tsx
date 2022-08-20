import React, { useEffect, useRef, useState } from "react";
import { useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entrySlice";
import { FidRow, OptionsBodyCol, OptionsBodyRow } from "../../styles/optionMenuStyles";
import { aselTrackSelector } from "../../redux/slices/trackSlice";
import { useCenterCursor } from "../../hooks/useCenterCursor";
import { EdstPrompt } from "./EdstPrompt";
import { PromptProps } from "./promptProps";
import { EdstWindow } from "../../enums/edstWindow";
import { useHubActions } from "../../hooks/useHubActions";

export const PreviousRouteMenu = ({ onSubmit, onCancel }: PromptProps) => {
  const entry = useRootSelector(aselEntrySelector)!;
  const aircraftTrack = useRootSelector(aselTrackSelector)!;
  const ref = useRef<HTMLDivElement>(null);
  const [frd, setFrd] = useState<string | null>(null);
  useCenterCursor(ref);
  const { generateFrd } = useHubActions();

  useEffect(() => {
    async function updateFrd() {
      setFrd(await generateFrd(aircraftTrack.location));
    }
    updateFrd().then();
  }, []);

  return (
    <EdstPrompt
      title="Previous Route Menu"
      windowId={EdstWindow.PREV_ROUTE_MENU}
      width="380px"
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
