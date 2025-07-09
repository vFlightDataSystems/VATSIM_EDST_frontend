import React from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector, updateEntry } from "~redux/slices/entrySlice";
import { useHubActions } from "hooks/useHubActions";
import { closeWindow, setAsel } from "~redux/slices/appSlice";
import { EdstPrompt } from "components/prompts/EdstPrompt";
import optionStyles from "css/optionMenu.module.scss";

export const EligibilityMenu = () => {
  const dispatch = useRootDispatch();
  const entry = useRootSelector(aselEntrySelector)!;

  const onSubmit = async () => {
    dispatch(closeWindow("HDG_ELIGIBILITY_MENU"));
  };

  const onCancel = () => {
    dispatch(closeWindow("HDG_ELIGIBILITY_MENU"));
  };

  return (
    <EdstPrompt
      title={`${entry.aircraftId} HDG`}
      windowId="HDG_ELIGIBILITY_MENU"
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
