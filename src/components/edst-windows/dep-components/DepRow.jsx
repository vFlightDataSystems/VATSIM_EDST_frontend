import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';

const SPA_INDICATOR = '^';
const COMPLETED_SYMBOL = '✓';

export default class DepRow extends React.Component {

  handleBoxMouseDown = (event, entry) => {
    if (event.button === 1) {
      this.props.updateEntry(entry.cid, {spa: !entry.spa});
    }
  }

  render() {
    const {hidden, entry: e} = this.props;

    return (<div className={`body-row ${e.pending_removal ? 'pending-removal' : ''}`} key={`dep-body-${e.cid}`}>
      <div className={`body-col body-col-1 radio dep-radio ${e.dep_status === 1 ? 'checkmark' : ''}`}
           onMouseDown={() => this.props.updateStatus(e.cid)}
      >
        {e.dep_status === undefined && 'N'}{e.dep_status === 1 && COMPLETED_SYMBOL}
      </div>
      <div className="body-col body-col-2">
        0000
      </div>
      <div className={`inner-row ${e.dep_highlighted ? 'highlighted' : ''}`}>
        <div className={`body-col fid hover ${this.props.isSelected(e.cid, 'fid') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', e.cid, 'fid')}>
          {e.cid} {e.callsign}
        </div>
        <div className="body-col pa"/>
        <div className={`body-col spa ${!e.spa ? 'rem-hidden' : ''}`}>
          {e.spa && SPA_INDICATOR}
        </div>
        <div className="body-col spa rem"
             onContextMenu={(event) => {
               event.preventDefault();
               this.props.updateEntry(e.cid, {acl_highlighted: !e.acl_highlighted});
             }}
             onMouseDown={(event) => this.handleBoxMouseDown(event, e)}
        />
        <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${this.props.isSelected(e.cid, 'type') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', e.cid, 'type')}
        >
          {`${e.type}/${e.equipment}`}
        </div>
        <div className={`body-col alt`}>
          <div className={`${this.props.isSelected(e.cid, 'alt') ? 'selected' : ''}`}
               onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', e.cid, 'alt')}
          >
            {e.altitude}
          </div>
        </div>
        <div
          className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''} 
          ${this.props.isSelected(e.cid, 'code') ? 'selected' : ''}`}
          onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', e.cid, 'code')}
        >
          {e.beacon}
        </div>
        <div className={`body-col route hover ${this.props.isSelected(e.cid, 'route') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', e.cid, 'route')}
        >
          {e.dep}{e.route}{isNaN(e._route.slice(-1)) ? '.' : ''}.{e.dest}
        </div>
      </div>
    </div>);
  }
}