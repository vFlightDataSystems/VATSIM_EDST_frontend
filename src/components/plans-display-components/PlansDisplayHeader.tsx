import React from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { planCleanup, planQueueSelector, selectedPlanIndexSelector } from "~redux/slices/planSlice";
import { closeWindow, invertNumpadSelector } from "~redux/slices/appSlice";
import { useHubActions } from "hooks/useHubActions";
import { EdstWindowHeaderButton, EdstWindowHeaderButtonWithSharedEvent } from "components/utils/EdstButton";
import { WindowTitleBar } from "components/WindowTitleBar";
import { DownlinkSymbol } from "components/utils/DownlinkSymbol";
import type { HeaderComponentProps } from "components/utils/FullscreenWindow";
import tableStyles from "css/table.module.scss";
import { EramPositionType, EramMessageElement } from "~/types/apiTypes/ProcessEramMessageDto";

/**
 * Plans Display title bar and header row with add/find input field
 */
export const PlansDisplayHeader = ({ focused, toggleFullscreen, startDrag }: HeaderComponentProps) => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const selectedPlanIndex = useRootSelector(selectedPlanIndexSelector);
  const interimDisabled = true;
  const { sendEramMessage } = useHubActions();
  const invertNumpad = useRootSelector(invertNumpadSelector);

  const handleAmendClick = () => {
    if (selectedPlanIndex !== null) {
      const amendedFlightplan = planQueue[selectedPlanIndex]?.amendedFlightplan;
      if (amendedFlightplan) {
        const commandString = planQueue[selectedPlanIndex]?.commandString;
        const tokens = commandString.split(/\s+/).filter(Boolean);
        const elements: EramMessageElement[] = tokens.map((token) => ({
          token,
        }));
        const message = {
          source: EramPositionType.DSide,
          elements,
          invertNumericKeypad: invertNumpad,
        };
        void sendEramMessage(message);
      }
    }
  };

  return (
    <div className={tableStyles.header}>
      <WindowTitleBar
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={startDrag}
        closeWindow={() => dispatch(closeWindow("PLANS_DISPLAY"))}
        text={["Plans Display"]}
      />
      <EdstWindowHeaderButtonWithSharedEvent
        sharedUiEventId="openPlansDisplayPlanOptions"
        edstWindow="PLAN_OPTIONS"
        disabled={selectedPlanIndex === null}
        content="Plan Options..."
      />
      <EdstWindowHeaderButton disabled content="Show" />
      <EdstWindowHeaderButton disabled content="Show ALL" />
      <DownlinkSymbol disabled />
      <EdstWindowHeaderButton disabled content="AM+Uplink" />
      <EdstWindowHeaderButton disabled={selectedPlanIndex === null} content="Amend" onMouseDown={handleAmendClick} />
      <EdstWindowHeaderButton
        disabled={interimDisabled}
        content="Interim"
        onMouseDown={() => {
          if (selectedPlanIndex !== null) {
            /* TODO: implement */
          }
        }}
        //
      />
      <EdstWindowHeaderButton disabled content="Tools..." />
      <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openPlansDisplayTemplateMenu" edstWindow="TEMPLATE_MENU" content="Template..." />
      <EdstWindowHeaderButton disabled content="ICAO" />
      <EdstWindowHeaderButton
        onMouseDown={() => {
          dispatch(planCleanup());
          dispatch(closeWindow("PLANS_DISPLAY"));
        }}
        content="Clean Up"
      />
    </div>
  );
};
