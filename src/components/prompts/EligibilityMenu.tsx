import React from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector, updateEntry } from "~redux/slices/entrySlice";
import { useHubActions } from "hooks/useHubActions";
import { closeWindow, setAsel } from "~redux/slices/appSlice";
import { EdstPrompt } from "components/prompts/EdstPrompt";
import optionStyles from "css/optionMenu.module.scss";

type EligibilityMenuProps = {
  type: "HDG" | "SPD";
  windowId: "HDG_ELIGIBILITY_MENU" | "SPD_ELIGIBILITY_MENU";
};

export const EligibilityMenu = ({ type, windowId }: EligibilityMenuProps) => {
  const dispatch = useRootDispatch();
  const entry = useRootSelector(aselEntrySelector)!;

  const onSubmit = async () => {
    dispatch(closeWindow(windowId));
  };

  const onCancel = () => {
    dispatch(closeWindow(windowId));
  };

  return (
    <EdstPrompt
      title={`${entry.aircraftId} ${type}`}
      windowId={windowId}
      width="250px"
      submitText="/OK"
      onSubmit={onSubmit}
      cancelText="EXIT"
      onCancel={onCancel}
    >
      <div>
        INELIGIBLE: <br /> NOT YOUR CONTROL
      </div>
    </EdstPrompt>
  );
};
