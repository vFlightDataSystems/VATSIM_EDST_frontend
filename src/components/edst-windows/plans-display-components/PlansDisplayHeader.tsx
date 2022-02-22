import '../../../css/windows/titlebar-styles.scss';
import '../../../css/header-styles.scss';
import {WindowTitleBar} from "../WindowTitleBar";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import React from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {planCleanup, planQueueSelector, selectedPlanIndexSelector} from "../../../redux/slices/planSlice";
import {openWindowThunk} from "../../../redux/thunks";
import {planRowFieldEnum, windowEnum} from "../../../enums";
import {amendEntryThunk} from "../../../redux/asyncThunks";
import {closeWindow, setAsel} from "../../../redux/slices/appSlice";

type PlansDisplayHeaderProps = {
  focused: boolean
}

export const PlansDisplayHeader: React.FC<PlansDisplayHeaderProps> = ({focused}) => {
  const dispatch = useAppDispatch();
  const planQueue = useAppSelector(planQueueSelector);
  const selectedPlanIndex = useAppSelector(selectedPlanIndexSelector);
  const interim_disabled = selectedPlanIndex !== null ? !Object.keys(planQueue[selectedPlanIndex].planData ?? {}).includes('altitude') : true;
  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={() => dispatch(closeWindow(windowEnum.plansDisplay))}
      text={['Plans Display']}
    />
    <div className="no-select">
      <EdstWindowHeaderButton disabled={selectedPlanIndex === null}
                              onMouseDown={(e: React.MouseEvent) => {
                                if (selectedPlanIndex !== null) {
                                  dispatch(setAsel({
                                    cid: planQueue[selectedPlanIndex].cid,
                                    window: windowEnum.plansDisplay,
                                    field: planRowFieldEnum.fid
                                  }));
                                  dispatch(openWindowThunk(windowEnum.planOptions, e.currentTarget, windowEnum.plansDisplay));
                                }
                              }}
                              content="Plan Options..."
                              title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton disabled={true} content="Show"/>
      <EdstWindowHeaderButton disabled={true} content="Show ALL"/>
      <EdstWindowHeaderButton disabled={selectedPlanIndex === null} content="Amend"
                              onMouseDown={() => selectedPlanIndex !== null && dispatch(amendEntryThunk({
                                cid: planQueue[selectedPlanIndex].cid,
                                planData: {...planQueue[selectedPlanIndex].planData}
                              }))}
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
        onMouseDown={(e: React.MouseEvent) => dispatch(openWindowThunk(windowEnum.templateMenu, e.target, windowEnum.plansDisplay))}
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
    </div>
  </div>);
};