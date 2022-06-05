import React from "react";
import { WindowTitleBar } from "../WindowTitleBar";
import { EdstWindowHeaderButton } from "../../resources/EdstButton";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { planCleanup, planQueueSelector, selectedPlanIndexSelector } from "../../../redux/slices/planSlice";
import { openMenuThunk } from "../../../redux/thunks/thunks";
import { closeWindow, setAsel } from "../../../redux/slices/appSlice";
import { NoSelectDiv } from "../../../styles/styles";
import { EdstWindow, PlanRowField } from "../../../namespaces";
import { useHub } from "../../../hub";

type PlansDisplayHeaderProps = {
  focused: boolean;
};

export const PlansDisplayHeader: React.FC<PlansDisplayHeaderProps> = ({ focused }) => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const selectedPlanIndex = useRootSelector(selectedPlanIndexSelector);
  const interimDisabled = true;
  const hubConnection = useHub();

  const handleAmendClick = () => {
    if (selectedPlanIndex !== null && hubConnection) {
      const amendedFlightplan = planQueue[selectedPlanIndex]?.amendedFlightplan;
      if (amendedFlightplan) {
        hubConnection.invoke("AmendFlightPlan", amendedFlightplan).catch(e => console.log("error amending flightplan:", e));
      }
    }
  };

  return (
    <div>
      <WindowTitleBar focused={focused} closeWindow={() => dispatch(closeWindow(EdstWindow.PLANS_DISPLAY))} text={["Plans Display"]} />
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
    </div>
  );
};
