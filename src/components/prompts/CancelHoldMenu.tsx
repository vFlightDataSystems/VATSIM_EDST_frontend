import React from "react";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entrySlice";
import { EdstPrompt } from "./EdstPrompt";
import { FidRow } from "../../styles/optionMenuStyles";
import { EdstWindow } from "../../enums/edstWindow";
import { useHubActions } from "../../hooks/useHubActions";
import { closeWindow } from "../../redux/slices/appSlice";

export const CancelHoldMenu = () => {
  const dispatch = useRootDispatch();
  const entry = useRootSelector(aselEntrySelector)!;
  const hubActions = useHubActions();

  const onSubmit = () => {
    hubActions.cancelHold(entry.aircraftId).then();
  };

  const onCancel = () => {
    dispatch(closeWindow(EdstWindow.CANCEL_HOLD_MENU));
  };

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
