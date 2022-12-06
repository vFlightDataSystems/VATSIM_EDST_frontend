import React from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector, updateEntry } from "~redux/slices/entrySlice";
import { useHubActions } from "hooks/useHubActions";
import { closeWindow, setAsel } from "~redux/slices/appSlice";
import { EdstPrompt } from "components/prompts/EdstPrompt";
import optionStyles from "css/optionMenu.module.scss";

export const CancelHoldMenu = () => {
  const dispatch = useRootDispatch();
  const entry = useRootSelector(aselEntrySelector)!;
  const hubActions = useHubActions();

  const onSubmit = async () => {
    await hubActions.cancelHold(entry.aircraftId);
    dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { routeDisplay: null } }));
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
      <div className={optionStyles.fidRow}>
        {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
      </div>
    </EdstPrompt>
  );
};
