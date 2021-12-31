import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/plans-display-styles.scss';


export default class PlansDisplayTable extends React.Component {

  render() {
    const {plan_queue, selected_msg, asel} = this.props

    return (<div className="plans-display-body no-select">
      {Object.entries(plan_queue)?.map(([i, p]) =>
        <div className="body-row" key={`plans-display-body-${p.cid}`}>
          <div className={`body-col plans-display-col-1 green hover ${(selected_msg === i && asel?.cid === p.cid) ? 'selected' : ''}`}
               onMouseDown={(event) => {
                 this.props.aircraftSelect(event, 'plans', p.cid, 'type');
                 this.props.messageSelect(i);
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
}
