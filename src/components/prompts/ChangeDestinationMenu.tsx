import React from "react";
import { useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { FidRow, OptionsBodyCol, OptionsBodyRow } from "styles/optionMenuStyles";
import { EdstWindow } from "enums/edstWindow";
import { EdstPrompt } from "components/prompts/EdstPrompt";
import type { PromptProps } from "components/prompts/promptProps";

export const ChangeDestinationMenu = ({ onSubmit, onCancel }: PromptProps) => {
  const entry = useRootSelector(aselEntrySelector)!;

  return (
    <EdstPrompt
      title="AM Change Destination Menu"
      windowId={EdstWindow.CHANGE_DEST_MENU}
      width="250px"
      submitText="YES"
      onSubmit={onSubmit}
      cancelText="NO"
      onCancel={onCancel}
      id="change-destination-menu"
    >
      <FidRow>
        {entry.cid} {entry.aircraftId}
      </FidRow>
      <OptionsBodyRow padding="0 8px">
        <OptionsBodyCol>Are you sure you want to change the destination?</OptionsBodyCol>
      </OptionsBodyRow>
    </EdstPrompt>
  );
};
