import React from "react";
import { WindowTitleBar } from "../WindowTitleBar";
import { EdstWindowHeaderButton } from "../../resources/EdstButton";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { planCleanup, PlanQuery, planQueueSelector, selectedPlanIndexSelector } from "../../../redux/slices/planSlice";
import { openMenuThunk } from "../../../redux/thunks/thunks";
import { EdstMenu, PlanRowField, EdstWindow } from "../../../enums";
import { closeWindow, setAsel } from "../../../redux/slices/appSlice";
import { amendDirectThunk, amendEntryThunk } from "../../../redux/thunks/entriesThunks";
import { NoSelectDiv } from "../../../styles/styles";

type PlansDisplayHeaderProps = {
  focused: boolean;
};

export const PlansDisplayHeader: React.FC<PlansDisplayHeaderProps> = ({ focused }) => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const selectedPlanIndex = useRootSelector(selectedPlanIndexSelector);
  const interimDisabled = selectedPlanIndex !== null ? !Object.keys(planQueue[selectedPlanIndex].planData ?? {}).includes("altitude") : true;

  const handleAmendClick = () => {
    if (selectedPlanIndex !== null) {
      const trialPlanData = planQueue[selectedPlanIndex];
      const { planData } = trialPlanData;
      if (trialPlanData.queryType === PlanQuery.direct && ["cid", "fix", "frd"].every(key => Object.keys(planData).includes(key))) {
        dispatch(amendDirectThunk({ cid: planData.cid, fix: planData.fix, frd: planData.frd }));
      } else if (trialPlanData.queryType === PlanQuery.reroute) {
        dispatch(
          amendEntryThunk({
            cid: planQueue[selectedPlanIndex].cid,
            planData: { ...planData }
          })
        );
      } else {
        dispatch(
          amendEntryThunk({
            cid: planQueue[selectedPlanIndex].cid,
            planData: { ...planData }
          })
        );
      }
    }
  };

  return (
    <div>
      <WindowTitleBar focused={focused} closeWindow={() => dispatch(closeWindow(EdstWindow.plansDisplay))} text={["Plans Display"]} />
      <NoSelectDiv>
        <EdstWindowHeaderButton
          disabled={selectedPlanIndex === null}
          onMouseDown={(e: React.MouseEvent) => {
            if (selectedPlanIndex !== null) {
              dispatch(
                setAsel({
                  cid: planQueue[selectedPlanIndex].cid,
                  window: EdstWindow.plansDisplay,
                  field: PlanRowField.fid
                })
              );
              dispatch(openMenuThunk(EdstMenu.planOptions, e.currentTarget, EdstWindow.plansDisplay));
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
            if (selectedPlanIndex !== null) {
              const interimPlanData = { interim: planQueue[selectedPlanIndex].planData.altitude };
              dispatch(
                amendEntryThunk({
                  cid: planQueue[selectedPlanIndex].cid,
                  planData: interimPlanData
                })
              );
            }
          }}
          // title={Tooltips.plans_interim}
        />
        <EdstWindowHeaderButton disabled content="Tools..." />
        <EdstWindowHeaderButton
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstMenu.templateMenu, e.target, EdstWindow.plansDisplay))}
          content="Template..."
          title={Tooltips.template}
        />
        <EdstWindowHeaderButton disabled content="ICAO" />
        <EdstWindowHeaderButton
          onMouseDown={() => {
            dispatch(planCleanup());
            dispatch(closeWindow(EdstWindow.plansDisplay));
          }}
          content="Clean Up"
          title={Tooltips.plansCleanUp}
        />
      </NoSelectDiv>
    </div>
  );
};
