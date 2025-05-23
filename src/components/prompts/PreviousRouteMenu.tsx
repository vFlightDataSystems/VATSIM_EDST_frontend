import React, { useEffect, useRef, useState } from "react";
import type { Nullable } from "types/utility-types";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { aselTrackSelector } from "~redux/slices/trackSlice";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useRootSelector } from "~redux/hooks";
import { useHubActions } from "hooks/useHubActions";
import { EdstPrompt } from "components/prompts/EdstPrompt";
import type { PromptProps } from "components/prompts/promptProps";
import optionStyles from "css/optionMenu.module.scss";

export const PreviousRouteMenu = ({ onSubmit, onCancel }: PromptProps) => {
  const entry = useRootSelector(aselEntrySelector)!;
  const aircraftTrack = useRootSelector(aselTrackSelector)!;
  const ref = useRef<HTMLDivElement>(null);
  const [frd, setFrd] = useState<Nullable<string>>(null);
  useCenterCursor(ref);
  const { generateFrd } = useHubActions();

  useEffect(() => {
    async function updateFrd() {
      const frdResult = await generateFrd(aircraftTrack.location);
      setFrd(frdResult ?? null);
    }
    void updateFrd();
  }, [aircraftTrack.location, generateFrd]);

  return (
    <EdstPrompt
      title="Previous Route Menu"
      windowId="PREV_ROUTE_MENU"
      width="380px"
      submitText="Apply Previous Route"
      onSubmit={onSubmit}
      cancelText="Exit"
      onCancel={onCancel}
    >
      <div className={optionStyles.fidRow}>
        {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
      </div>
      <div className={optionStyles.row}>
        <div className={optionStyles.col}>
          RTE {frd ?? ""}
          {entry.previousRoute}
        </div>
      </div>
    </EdstPrompt>
  );
};
