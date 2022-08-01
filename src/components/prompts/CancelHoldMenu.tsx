import React from "react";
import { useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entrySlice";
import { EdstPrompt } from "./EdstPrompt";
import { FidRow } from "../../styles/optionMenuStyles";
import { PromptProps } from "./promptProps";
import { EdstWindow } from "../../enums/edstWindow";

export const CancelHoldMenu = ({ onSubmit, onCancel }: PromptProps) => {
  const entry = useRootSelector(aselEntrySelector)!;

  return (
    <EdstPrompt
      title="Cancel Hold Confirmation"
      windowId={EdstWindow.CANCEL_HOLD_MENU}
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
