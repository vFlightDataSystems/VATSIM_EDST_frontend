import * as React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/plans-display-styles.scss';
import {FunctionComponent, useContext} from "react";
import {AselProps} from "../../../interfaces";
import {EdstContext} from "../../../contexts/contexts";

interface plan {
  cid: string;
  callsign: string;
  msg: string;
}

interface PlansDisplayTableProps {
  messageSelect: (i: string) => void;
  selected_msg: string | null;
  plan_queue: Array<any>;
  asel: AselProps | null;
}

export const PlansDisplayTable: FunctionComponent<PlansDisplayTableProps> = ({plan_queue, selected_msg, asel, messageSelect}) => {
  const {aircraftSelect} = useContext(EdstContext);
  return (<div className="plans-display-body no-select">
    {Object.entries(plan_queue)?.map(([i, p]: [string, plan]) =>
      <div className="body-row" key={`plans-display-body-${p.cid}-${p.msg}-${i}`}>
        <div
          className={`body-col plans-display-col-1 green hover ${(selected_msg === i && asel?.cid === p.cid) ? 'selected' : ''}`}
          onMouseDown={(event) => {
            aircraftSelect(event, 'plans', p.cid, 'type');
            messageSelect(i);
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
