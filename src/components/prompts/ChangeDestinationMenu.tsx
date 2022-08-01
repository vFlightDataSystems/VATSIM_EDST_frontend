import React from "react";
import { PromptProps } from "./promptProps";
import { useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entrySlice";
import { EdstPrompt } from "./EdstPrompt";
import { FidRow } from "../../styles/optionMenuStyles";
import { EdstWindow } from "../../enums/edstWindow";

export const ChangeDestinationMenu = ({ onSubmit, onCancel }: PromptProps) => {
  const entry = useRootSelector(aselEntrySelector)!;

  return (
    <EdstPrompt
      title="Cancel Hold Confirmation"
      windowId={EdstWindow.CHANGE_DEST_MENU}
      width={250}
      submitText="Cancel Hold"
      onSubmit={onSubmit}
      cancelText="Exit"
      onCancel={onCancel}
      id="cancel-hold-menu"
    >
      <FidRow>
        {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
      </FidRow>
    </EdstPrompt>
  );
};
