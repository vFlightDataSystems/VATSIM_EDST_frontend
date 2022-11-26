import React, { useState } from "react";
import { useInterval } from "usehooks-ts";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { planQueueSelector, selectedPlanIndexSelector, setSelectedPlanIndex } from "~redux/slices/planSlice";
import { removePlanThunk } from "~redux/thunks/removePlanThunk";
import tableStyles from "css/table.module.scss";
import pdStyles from "css/plansDisplay.module.scss";
import clsx from "clsx";

const formatTime = (expirationTime: number, currentTime: number) => {
  const max = Math.max(expirationTime - currentTime, 0);
  return `${Math.floor(max / 60).toString()}:${Math.floor(max % 60)
    .toString()
    .padStart(2, "0")}`;
};

export const PlansDisplayTable = () => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const selectedPlanIndex = useRootSelector(selectedPlanIndexSelector);

  const [time, setTime] = useState(Date.now() / 1000);
  useInterval(() => setTime(Date.now() / 1000), 1000);

  const handleMouseDown = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(setSelectedPlanIndex(selectedPlanIndex === index ? null : index));
        break;
      case 2:
        dispatch(removePlanThunk(index));
        break;
      default:
        break;
    }
  };

  return (
    <div className={pdStyles.body}>
      {planQueue?.map((p, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className={tableStyles.row} key={i}>
          <div className={clsx(pdStyles.fixCol, { selected: selectedPlanIndex === i })} onMouseDown={(event) => handleMouseDown(event, i)}>
            {p.cid} {p.aircraftId}
          </div>
          <div className={pdStyles.col}>{p.commandString.toUpperCase()}</div>
          <div className={clsx(pdStyles.col2, { expired: p.expirationTime - time < 0 })}>{formatTime(p.expirationTime, time)}</div>
        </div>
      ))}
    </div>
  );
};
