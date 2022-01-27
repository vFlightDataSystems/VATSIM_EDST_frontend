import * as React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/plans-display-styles.scss';

interface plan {
  cid: string;
  callsign: string;
  msg: string;
}

export const PlansDisplayTable = (props) => {
  const {plan_queue, selected_msg, asel} = props;

  return (<div className="plans-display-body no-select">
    {Object.entries(plan_queue)?.map(([i, p]: [string, plan]) =>
      <div className="body-row" key={`plans-display-body-${p.cid}-${p.msg}-${i}`}>
        <div
          className={`body-col plans-display-col-1 green hover ${(selected_msg === i && asel?.cid === p.cid) ? 'selected' : ''}`}
          onMouseDown={(event) => {
            props.aircraftSelect(event, 'plans', p.cid, 'type');
            props.messageSelect(i);
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
