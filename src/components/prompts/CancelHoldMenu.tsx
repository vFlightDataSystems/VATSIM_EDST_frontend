import React from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { FidRow } from "styles/optionMenuStyles";
import { useHubActions } from "hooks/useHubActions";
import { closeWindow, setAsel } from "~redux/slices/appSlice";
import { EdstPrompt } from "components/prompts/EdstPrompt";

export const CancelHoldMenu = () => {
  const dispatch = useRootDispatch();
  const entry = useRootSelector(aselEntrySelector)!;
  const hubActions = useHubActions();

  const onSubmit = async () => {
    await hubActions.cancelHold(entry.aircraftId);
    dispatch(setAsel(null));
    dispatch(closeWindow("CANCEL_HOLD_MENU"));
  };

  const onCancel = () => {
    dispatch(closeWindow("CANCEL_HOLD_MENU"));
  };

  return (
    <EdstPrompt
      title="Cancel Hold Confirmation"
      windowId="CANCEL_HOLD_MENU"
      width="250px"
      submitText="Cancel Hold"
      onSubmit={onSubmit}
      cancelText="Exit"
      onCancel={onCancel}
    >
      <FidRow>
        {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
      </FidRow>
    </EdstPrompt>
  );
};
