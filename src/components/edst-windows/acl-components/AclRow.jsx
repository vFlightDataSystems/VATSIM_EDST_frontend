import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';

const SPA_INDICATOR = '^';
const ON_FREQ_SYMBOL = 'N';

export default class AclRow extends React.Component {

  handleBoxMouseDown = (event, entry) => {
    if (event.button === 1) {
      this.props.updateEntry(entry.cid, {spa: !entry.spa});
    }
  }

  render() {
    const {entry: e, hidden, alt_mouse_down} = this.props;

    return (
      <div className={`body-row ${e.pending_removal ? 'pending-removal' : ''}`} key={`acl-body-${e.cid}`}>
        <div className={`body-col body-col-1 radio ${e.acl_status === 1 ? 'green' : ''}`}
             onMouseDown={() => this.props.updateStatus(e.cid)}>
          {e.acl_status === undefined && 'N'}{e.acl_status === 1 && ON_FREQ_SYMBOL}
        </div>
        <div className="body-col body-col-1 border"/>
        <div className="body-col body-col-1 border"/>
        <div className="body-col body-col-1 border"/>
        <div className="body-col body-col-1"/>
        <div className={`inner-row ${e.acl_highlighted ? 'highlighted' : ''}`}>
          <div className={`body-col fid hover ${this.props.isSelected(e.cid, 'fid') ? 'selected' : ''}`}
               onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', e.cid, 'fid')}>
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
               onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', e.cid, 'type')}
          >
            {`${e.type}/${e.equipment}`}
          </div>
          <div className={`body-col alt`}>
            <div className={`${alt_mouse_down ? 'md' : ''} ${e.interim ? 'interim' : ''}
          ${this.props.isSelected(e.cid, 'alt') ? 'selected' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', e.cid, 'alt')}
            >
              {e.altitude}{e.interim && `T${e.interim}`}
            </div>
          </div>
          <div
            className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''}
          ${this.props.isSelected(e.cid, 'code') ? 'selected' : ''}`}
            onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', e.cid, 'code')}
          >
            {e.beacon}
          </div>
          <div className={`body-col hs hdg hover ${hidden.includes('hdg') ? 'content hidden' : ''}
              ${this.props.isSelected(e.cid, 'hdg') ? 'selected' : ''} ${e?.scratch_hdg?.scratchpad ? 'yellow' : ''}`}
               onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', e.cid, 'hdg')}
          >
            {e?.scratch_hdg?.val}
          </div>
          <div className="body-col hs-slash">
            /
          </div>
          <div className={`body-col hs spd hover ${hidden.includes('spd') ? 'content hidden' : ''}
${this.props.isSelected(e.cid, 'spd') ? 'selected' : ''} ${e?.scratch_spd?.scratchpad ? 'yellow' : ''}`}
               onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', e.cid, 'spd')}
          >
            {e?.scratch_spd?.val}
          </div>
          <div className={`body-col body-col-1 hold-col`}>
            {e.hold_data ? 'H' : ''}
          </div>
          <div className={`body-col body-col-1 hold-col`}>
          </div>
          <div className={`body-col route hover ${this.props.isSelected(e.cid, 'route') ? 'selected' : ''}`}
               onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', e.cid, 'route')}
          >
            {e.dep}./{e._route}{isNaN(e._route.slice(-1)) ? '.' : ''}.{e.dest}
          </div>
        </div>
      </div>);
  }
}
