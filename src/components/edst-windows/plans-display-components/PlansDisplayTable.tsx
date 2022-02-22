import '../../../css/windows/body-styles.scss';
import '../../../css/windows/plans-display-styles.scss';
import React from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {
  planQueueSelector,
  selectedPlanIndexSelector,
  PlanType,
  setSelectedTrialPlanIndex
} from "../../../redux/slices/planSlice";
import {removeTrialPlanThunk} from "../../../redux/thunks";

export const PlansDisplayTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const planQueue = useAppSelector(planQueueSelector);
  const selectedPlanIndex = useAppSelector(selectedPlanIndexSelector);

  const handleMouseDown = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(setSelectedTrialPlanIndex(selectedPlanIndex === index ? null : index));
        break;
      case 2:
        dispatch(removeTrialPlanThunk(index));
        break;
      default:
        break;
    }
  };

  return (<div className="plans-display-body no-select">
    {planQueue?.map((p: PlanType, i: number) =>
      <div className="body-row" key={`plans-display-body-${p.cid}-${p.msg}-${i}`}>
        <div
          className={`body-col plans-display-col-1 green hover ${(selectedPlanIndex === i) ? 'selected' : ''}`}
          onMouseDown={(event: React.MouseEvent) => handleMouseDown(event, i)}
        >
          {p.cid} {p.callsign}
        </div>
        <div className="body-col">
          {p.msg}
        </div>
      </div>)}
  </div>);
};
