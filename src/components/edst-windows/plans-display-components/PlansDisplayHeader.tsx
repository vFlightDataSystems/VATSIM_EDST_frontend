import React from "react";
import styled from "styled-components";
import { WindowTitleBar } from "../WindowTitleBar";
import { EdstWindowHeaderButton } from "../../resources/EdstButton";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { planCleanup, planQueueSelector, selectedPlanIndexSelector } from "../../../redux/slices/planSlice";
import { closeWindow, setAsel } from "../../../redux/slices/appSlice";
import { NoSelectDiv } from "../../../styles/styles";
import { EdstWindow, PlanRowField } from "../../../namespaces";
import { useHub } from "../../../hooks/hub";
import { openMenuThunk } from "../../../redux/thunks/openMenuThunk";

const PlansDisplayHeaderDiv = styled(NoSelectDiv)``;

type PlansDisplayHeaderProps = {
  focused: boolean;
  toggleFullscreen: () => void;
  startDrag: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export const PlansDisplayHeader = ({ focused, toggleFullscreen, startDrag }: PlansDisplayHeaderProps) => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const selectedPlanIndex = useRootSelector(selectedPlanIndexSelector);
  const interimDisabled = true;
  const hubConnection = useHub();

  const handleAmendClick = () => {
    if (selectedPlanIndex !== null && hubConnection) {
      const amendedFlightplan = planQueue[selectedPlanIndex]?.amendedFlightplan;
      if (amendedFlightplan) {
        // eslint-disable-next-line no-console
        hubConnection.invoke("AmendFlightPlan", amendedFlightplan).catch(e => console.log("error amending flightplan:", e));
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
          disabled={selectedPlanIndex === null}
          onMouseDown={(e: React.MouseEvent) => {
            if (selectedPlanIndex !== null) {
              dispatch(
                setAsel({
                  aircraftId: planQueue[selectedPlanIndex].aircraftId,
                  window: EdstWindow.PLANS_DISPLAY,
                  field: PlanRowField.FID
                })
              );
              dispatch(openMenuThunk(EdstWindow.PLAN_OPTIONS, e.currentTarget, EdstWindow.PLANS_DISPLAY));
            }
          }}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButton disabled content="Show" />
        <EdstWindowHeaderButton disabled content="Show ALL" />
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
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstWindow.TEMPLATE_MENU, e.target, EdstWindow.PLANS_DISPLAY))}
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
