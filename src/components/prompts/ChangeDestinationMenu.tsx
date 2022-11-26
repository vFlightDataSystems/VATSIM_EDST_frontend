import React from "react";
import { useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { EdstPrompt } from "components/prompts/EdstPrompt";
import type { PromptProps } from "components/prompts/promptProps";
import optionStyles from "css/optionMenu.module.scss";

export const ChangeDestinationMenu = ({ onSubmit, onCancel }: PromptProps) => {
  const entry = useRootSelector(aselEntrySelector)!;

  return (
    <EdstPrompt
      title="AM Change Destination Menu"
      windowId="CHANGE_DEST_MENU"
      width="250px"
      submitText="YES"
      onSubmit={onSubmit}
      cancelText="NO"
      onCancel={onCancel}
    >
      <div className={optionStyles.fidRow}>
        {entry.cid} {entry.aircraftId}
      </div>
      <div className={optionStyles.row}>
        <div className={optionStyles.col}>Are you sure you want to change the destination?</div>
      </div>
    </EdstPrompt>
  );
};
