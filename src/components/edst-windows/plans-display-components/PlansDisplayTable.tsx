import '../../../css/windows/body-styles.scss';
import '../../../css/windows/plans-display-styles.scss';
import React from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {planQueueSelector, selectedPlanIndexSelector, PlanType, setSelectedTrialPlanIndex} from "../../../redux/slices/planSlice";

export const PlansDisplayTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const planQueue = useAppSelector(planQueueSelector);
  const selectedPlanIndex = useAppSelector(selectedPlanIndexSelector);
  return (<div className="plans-display-body no-select">
    {planQueue?.map((p: PlanType, i: number) =>
      <div className="body-row" key={`plans-display-body-${p.cid}-${p.msg}-${i}`}>
        <div
          className={`body-col plans-display-col-1 green hover ${(selectedPlanIndex === i) ? 'selected' : ''}`}
          onMouseDown={() => {
            // dispatch(plansAircraftSelect(event, windowEnum.plansDisplay, p.cid, planRowFieldEnum.type);
            dispatch(setSelectedTrialPlanIndex(selectedPlanIndex === i ? null : i));
          }}
        >
          {p.cid} {p.callsign}
        </div>
        <div className="body-col">
          {p.msg}
        </div>
      </div>)}
  </div>);
}
