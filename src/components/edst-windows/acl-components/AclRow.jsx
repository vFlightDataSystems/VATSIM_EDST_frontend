import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';

const SPA_INDICATOR = '^';
const ON_FREQ_SYMBOL = 'N';

export default class AclRow extends React.Component {

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps !== this.props || this.state !== nextState;
  }

  handleBoxMouseDown = (event, entry) => {
    if (event.button === 1) {
      this.props.updateEntry(entry.cid, {spa: !entry.spa});
    }
  }

  handleHoldClick = (event) => {
    const {entry} = this.props;
    switch (event.button) {
      case 0:
        if (!entry?.hold_data) {
          this.props.aircraftSelect(event, 'acl', entry.cid, 'hold');
        } else {
          this.props.updateEntry(entry.cid, {show_hold_info: !entry.show_hold_info});
        }
        break;
      case 1:
        this.props.aircraftSelect(event, 'acl', entry.cid, 'hold');
        break;
      default:
        break;
    }
  }

  formatEfc = (efc) => ("0" + ((efc / 60 | 0) % 24)).slice(-2) + ("0" + (efc % 60 | 0)).slice(-2);

  render() {
    const {entry: e, hidden, alt_mouse_down} = this.props;
    const hold_data = e?.hold_data;

    return (
      <div className={`body-row ${e.pending_removal ? 'pending-removal' : ''}`} key={`acl-body-${e.cid}`}>
        <div className={`body-col body-col-1 radio ${e.acl_status === 1 ? 'green' : ''}`}
             onMouseDown={() => this.props.updateStatus(e.cid)}>
          {e.acl_status === -1 && 'N'}{e.acl_status === 1 && ON_FREQ_SYMBOL}
        </div>
        <div className="body-col body-col-1 border"/>
        <div className="body-col body-col-1 border"/>
        <div className="body-col body-col-1 border"/>
        <div className="body-col body-col-1"/>
        <div className={`inner-row ${e.acl_highlighted ? 'highlighted' : ''}`}>
          <div className={`body-col fid hover ${this.props.isSelected(e.cid, 'fid') ? 'selected' : ''}`}
               onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', e.cid, 'fid')}
               onContextMenu={(event) => {
                 event.preventDefault();
                 if (e.pending_removal) {
                   this.props.deleteEntry('acl', e.cid);
                 }
               }}
          >
            {e.cid} {e.callsign}
          </div>
          <div className="body-col pa"/>
          <div className={`body-col special ${!e.spa ? 'special-hidden' : ''}`}>
            {e.spa && SPA_INDICATOR}
          </div>
          <div className="body-col special rem"
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
          <div className={`body-col special`} disabled={true}/>
          <div className={`body-col special hold-col ${this.props.isSelected(e.cid, 'hold') ? 'selected' : ''}`}
               onMouseDown={this.handleHoldClick}
               onContextMenu={(event) => {
                 event.preventDefault();
                 if (e?.hold_data) {
                   this.props.aircraftSelect(event, null, e.cid, 'cancel-hold');
                 }
               }}
               disabled={!this.props.any_holding}
          >
            {e.hold_data ? 'H' : ''}
          </div>
          <div className={`body-col special`} disabled={true}>
          </div>
          <div className={`body-col route hover ${this.props.isSelected(e.cid, 'route') ? 'selected' : ''}`}
               onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', e.cid, 'route')}
          >
            {e.show_hold_info && hold_data && `${hold_data.hold_fix} ${hold_data.hold_direction} ${hold_data.turns} ${hold_data.leg_length} EFC ${this.formatEfc(hold_data.efc)}`}
            {!e.show_hold_info && `${e.dep}./${e._route}${isNaN(e._route.slice(-1)) ? '.' : ''}.${e.dest}`}
          </div>
        </div>
      </div>);
  }
}
