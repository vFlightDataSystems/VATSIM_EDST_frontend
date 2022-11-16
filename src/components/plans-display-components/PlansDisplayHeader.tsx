import React from "react";
import styled from "styled-components";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { planCleanup, planQueueSelector, selectedPlanIndexSelector } from "~redux/slices/planSlice";
import { closeWindow } from "~redux/slices/appSlice";
import { NoSelectDiv } from "styles/NoSelectDiv";
import { useHubActions } from "hooks/useHubActions";
import { EdstWindowHeaderButton, EdstWindowHeaderButtonWithSharedEvent } from "components/utils/EdstButton";
import { WindowTitleBar } from "components/WindowTitleBar";
import { DownlinkSymbol } from "components/utils/DownlinkSymbol";
import type { HeaderComponentProps } from "components/utils/FullscreenWindow";

const PlansDisplayHeaderDiv = styled(NoSelectDiv)``;

/**
 * Plans Display title bar and header row with add/find input field
 */
export const PlansDisplayHeader = ({ focused, toggleFullscreen, startDrag }: HeaderComponentProps) => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const selectedPlanIndex = useRootSelector(selectedPlanIndexSelector);
  const interimDisabled = true;
  const { amendFlightplan } = useHubActions();

  const handleAmendClick = () => {
    if (selectedPlanIndex !== null) {
      const amendedFlightplan = planQueue[selectedPlanIndex]?.amendedFlightplan;
      if (amendedFlightplan) {
        void amendFlightplan(amendedFlightplan);
      }
    }
  };

  return (
    <PlansDisplayHeaderDiv>
      <WindowTitleBar
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={startDrag}
        closeWindow={() => dispatch(closeWindow("PLANS_DISPLAY"))}
        text={["Plans Display"]}
      />
      <NoSelectDiv>
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openPlansDisplayPlanOptions"
          edstWindow="PLAN_OPTIONS"
          disabled={selectedPlanIndex === null}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButton disabled content="Show" />
        <EdstWindowHeaderButton disabled content="Show ALL" />
        <DownlinkSymbol disabled />
        <EdstWindowHeaderButton disabled content="AM+Uplink" />
        <EdstWindowHeaderButton disabled={selectedPlanIndex === null} content="Amend" onMouseDown={handleAmendClick} title={Tooltips.plansAmend} />
        <EdstWindowHeaderButton
          disabled={interimDisabled}
          content="Interim"
          onMouseDown={() => {
            if (selectedPlanIndex !== null) {
              /* TODO: implement */
            }
          }}
          // title={Tooltips.plans_interim}
        />
        <EdstWindowHeaderButton disabled content="Tools..." />
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openPlansDisplayTemplateMenu"
          edstWindow="TEMPLATE_MENU"
          content="Template..."
          title={Tooltips.template}
        />
        <EdstWindowHeaderButton disabled content="ICAO" />
        <EdstWindowHeaderButton
          onMouseDown={() => {
            dispatch(planCleanup());
            dispatch(closeWindow("PLANS_DISPLAY"));
          }}
          content="Clean Up"
          title={Tooltips.plansCleanUp}
        />
      </NoSelectDiv>
    </PlansDisplayHeaderDiv>
  );
};
