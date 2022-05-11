import {WindowTitleBar} from "../WindowTitleBar";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import React from "react";
import {useRootDispatch, useRootSelector} from "../../../redux/hooks";
import {
  planCleanup,
  PlanQueryType,
  planQueueSelector,
  selectedPlanIndexSelector
} from "../../../redux/slices/planSlice";
import {openMenuThunk} from "../../../redux/thunks/thunks";
import {menuEnum, planRowFieldEnum, windowEnum} from "../../../enums";
import {closeWindow, setAsel} from "../../../redux/slices/appSlice";
import {amendDirectThunk, amendEntryThunk, amendRouteThunk} from "../../../redux/thunks/entriesThunks";
import {NoSelectDiv} from "../../../styles/styles";

type PlansDisplayHeaderProps = {
  focused: boolean
}

export const PlansDisplayHeader: React.FC<PlansDisplayHeaderProps> = ({focused}) => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const selectedPlanIndex = useRootSelector(selectedPlanIndexSelector);
  const interim_disabled = selectedPlanIndex !== null ? !Object.keys(planQueue[selectedPlanIndex].planData ?? {}).includes('altitude') : true;

  const handleAmendClick = () => {
    if (selectedPlanIndex !== null) {
      let trialPlanData = planQueue[selectedPlanIndex];
      let planData = trialPlanData.planData
      if (trialPlanData.queryType === PlanQueryType.direct
        && ['cid', 'fix', 'frd'].every(key => Object.keys(planData).includes(key))
      ) {
        dispatch(amendDirectThunk({cid: planData.cid, fix: planData.fix, frd: planData.frd}));
      }
      else if (trialPlanData.queryType === PlanQueryType.reroute) {
        dispatch(amendRouteThunk({
          cid: planQueue[selectedPlanIndex].cid,
          route: planData.route,
          frd: planData.frd
        }))
      }
      else {
        dispatch(amendEntryThunk({
          cid: planQueue[selectedPlanIndex].cid,
          planData: {...planData}
        }))
      }
    }
  }

  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={() => dispatch(closeWindow(windowEnum.plansDisplay))}
      text={['Plans Display']}
    />
    <NoSelectDiv>
      <EdstWindowHeaderButton disabled={selectedPlanIndex === null}
                              onMouseDown={(e: React.MouseEvent) => {
                                if (selectedPlanIndex !== null) {
                                  dispatch(setAsel({
                                    cid: planQueue[selectedPlanIndex].cid,
                                    window: windowEnum.plansDisplay,
                                    field: planRowFieldEnum.fid
                                  }));
                                  dispatch(openMenuThunk(menuEnum.planOptions, e.currentTarget, windowEnum.plansDisplay));
                                }
                              }}
                              content="Plan Options..."
                              title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton disabled={true} content="Show"/>
      <EdstWindowHeaderButton disabled={true} content="Show ALL"/>
      <EdstWindowHeaderButton disabled={selectedPlanIndex === null} content="Amend"
                              onMouseDown={handleAmendClick}
                              title={Tooltips.plansAmend}
      />
      <EdstWindowHeaderButton disabled={interim_disabled} content="Interim"
                              onMouseDown={() => {
                                if (selectedPlanIndex !== null) {
                                  const interimPlanData = {interim: planQueue[selectedPlanIndex].planData.altitude};
                                  dispatch(amendEntryThunk({
                                    cid: planQueue[selectedPlanIndex].cid,
                                    planData: interimPlanData
                                  }));
                                }
                              }}
        // title={Tooltips.plans_interim}
      />
      <EdstWindowHeaderButton disabled={true} content="Tools..."/>
      <EdstWindowHeaderButton
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.templateMenu, e.target, windowEnum.plansDisplay))}
        content="Template..."
        title={Tooltips.template}
      />
      <EdstWindowHeaderButton disabled={true} content="ICAO"/>
      <EdstWindowHeaderButton
        onMouseDown={() => {
          dispatch(planCleanup());
          dispatch(closeWindow(windowEnum.plansDisplay));
        }}
        content="Clean Up"
        title={Tooltips.plansCleanUp}
      />
    </NoSelectDiv>
  </div>);
};