import React, { useCallback } from "react";
import styled from "styled-components";
import { WindowTitleBar } from "../WindowTitleBar";
import { EdstWindowHeaderButton } from "../../utils/EdstButton";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { planCleanup, planQueueSelector, selectedPlanIndexSelector } from "../../../redux/slices/planSlice";
import { closeWindow } from "../../../redux/slices/appSlice";
import { NoSelectDiv } from "../../../styles/styles";
import { openMenuThunk } from "../../../redux/thunks/openMenuThunk";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { useHubActions } from "../../../hooks/useHubActions";
import { DownlinkSymbol } from "../../utils/DownlinkSymbol";

const PlansDisplayHeaderDiv = styled(NoSelectDiv)``;

type PlansDisplayHeaderProps = {
  focused: boolean;
  toggleFullscreen: () => void;
  startDrag: (e: React.MouseEvent<HTMLDivElement>) => void;
};

/**
 * Plans Display title bar and header row with add/find input field
 * @param focused focused state of Plans Display window
 * @param toggleFullscreen eventHandler to toggle maximized mode of Plans Display window
 * @param startDrag startDrag event handler
 */
export const PlansDisplayHeader = ({ focused, toggleFullscreen, startDrag }: PlansDisplayHeaderProps) => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const selectedPlanIndex = useRootSelector(selectedPlanIndexSelector);
  const interimDisabled = true;
  const { amendFlightplan } = useHubActions();

  const handleClick = useCallback(
    (element: HTMLElement, edstWindow: EdstWindow) => {
      dispatch(openMenuThunk(edstWindow, element));
    },
    [dispatch]
  );

  const handleAmendClick = () => {
    if (selectedPlanIndex !== null) {
      const amendedFlightplan = planQueue[selectedPlanIndex]?.amendedFlightplan;
      if (amendedFlightplan) {
        amendFlightplan(amendedFlightplan).then();
      }
    }
  };

  return (
    <PlansDisplayHeaderDiv>
      <WindowTitleBar
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={startDrag}
        closeWindow={() => dispatch(closeWindow(EdstWindow.PLANS_DISPLAY))}
        text={["Plans Display"]}
      />
      <NoSelectDiv>
        <EdstWindowHeaderButton
          sharedUiEventId="openPlansDisplayPlanOptions"
          sharedUiEventHandler={handleClick}
          sharedUiEventHandlerArgs={EdstWindow.PLAN_OPTIONS}
          disabled={selectedPlanIndex === null}
          onMouseDown={e => handleClick(e.currentTarget, EdstWindow.PLAN_OPTIONS)}
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
            // eslint-disable-next-line no-empty
            if (selectedPlanIndex !== null) {
            }
          }}
          // title={Tooltips.plans_interim}
        />
        <EdstWindowHeaderButton disabled content="Tools..." />
        <EdstWindowHeaderButton
          sharedUiEventId="openPlansDisplayTemplateMenu"
          sharedUiEventHandler={handleClick}
          sharedUiEventHandlerArgs={EdstWindow.TEMPLATE_MENU}
          onMouseDown={e => handleClick(e.currentTarget, EdstWindow.TEMPLATE_MENU)}
          content="Template..."
          title={Tooltips.template}
        />
        <EdstWindowHeaderButton disabled content="ICAO" />
        <EdstWindowHeaderButton
          onMouseDown={() => {
            dispatch(planCleanup());
            dispatch(closeWindow(EdstWindow.PLANS_DISPLAY));
          }}
          content="Clean Up"
          title={Tooltips.plansCleanUp}
        />
      </NoSelectDiv>
    </PlansDisplayHeaderDiv>
  );
};
