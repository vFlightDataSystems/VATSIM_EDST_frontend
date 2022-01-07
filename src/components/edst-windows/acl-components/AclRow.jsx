import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {REMOVAL_TIMEOUT} from "../../../lib";

const SPA_INDICATOR = '^';
const ON_FREQ_SYMBOL = 'N';

export default class AclRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scratchpad: this.props?.entry?.scratchpad || ''
    };

    this.hightlightRef = React.createRef();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps !== this.props || this.state !== nextState;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {entry} = this.props;
    if (prevProps?.entry?.scratchpad !== entry?.scratchpad) {
      this.setState({scratchpad: entry?.scratchpad || ''});
    }
  }

  #handleBoxMouseDown = (event, entry) => {
    event.preventDefault();
    if (event.button === 0) {
      const {scratchpad} = this.state;
      this.props.amendEntry(entry?.cid, {scratchpad: scratchpad});
      this.props.updateEntry(entry.cid, {free_text: !entry.free_text});
    }
    if (event.button === 1) {
      this.props.updateEntry(entry.cid, {spa: !(typeof (entry.spa) === 'number')});
    }
    if (event.button === 2) {
      this.props.updateEntry(entry.cid, {acl_highlighted: !entry.acl_highlighted});
    }
  }

  #handleHoldClick = (event) => {
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

  #handleFidClick = (event) => {
    const {entry: e} = this.props;
    const now = performance.now();
    switch (event.button) {
      case 2:
        if (now - (e.pending_removal || now) > REMOVAL_TIMEOUT) {
          this.props.deleteEntry('acl', e.cid);
        }
        break;
      default:
        this.props.aircraftSelect(event, 'acl', e.cid, 'fid');
        break;

    }
  }

  formatEfc = (efc) => ("0" + ((efc / 60 | 0) % 24)).slice(-2) + ("0" + (efc % 60 | 0)).slice(-2);

  render() {
    const {scratchpad} = this.state;
    const {entry: e, hidden, alt_mouse_down} = this.props;
    const hold_data = e?.hold_data;
    const now = performance.now();

    return (<div className="body-row-container" key={this.props.key}>
      <div className={`body-row ${(now - (e.pending_removal || now) > REMOVAL_TIMEOUT) ? 'pending-removal' : ''}`}
           key={`acl-body-${e.cid}`}>
        <div className={`body-col body-col-1 radio ${e.acl_status === 1 ? 'green' : ''}`}
             onMouseDown={() => this.props.updateStatus(e.cid)}>
          {e.acl_status === -1 && 'N'}{e.acl_status === 1 && ON_FREQ_SYMBOL}
        </div>
        <div className="body-col body-col-1 border"/>
        <div className="body-col body-col-1 border"/>
        <div className="body-col body-col-1 border"/>
        <div className="body-col body-col-1"/>
        <div className={`inner-row ${e.acl_highlighted ? 'highlighted' : ''}`}
             ref={this.hightlightRef}
             style={{minWidth: e.free_text ? '1200px' : 0}}
        >
          <div className={`body-col fid hover ${this.props.isSelected(e.cid, 'fid') ? 'selected' : ''}`}
               onMouseDown={this.#handleFidClick}
               onContextMenu={(event) => event.preventDefault()}
          >
            {e.cid} {e.callsign}
          </div>
          <div className="body-col pa"/>
          <div className={`body-col special ${!(typeof (e.spa) === 'number') ? 'special-hidden' : ''}`}>
            {(typeof (e.spa) === 'number') && SPA_INDICATOR}
          </div>
          <div className="body-col special rem"
               onContextMenu={event => event.preventDefault()}
               onMouseDown={(event) => this.#handleBoxMouseDown(event, e)}
          >
            {scratchpad && '*'}
          </div>
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
               onMouseDown={this.#handleHoldClick}
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
            {!e.show_hold_info && `${e.dep}./${e._route}`}
          </div>
        </div>
      </div>
      {e.free_text && <div className="body-row">
        <div className={`body-col body-col-1 radio`}/>
        <div className="body-col body-col-1"/>
        <div className="body-col body-col-1"/>
        <div className="body-col body-col-1"/>
        <div className="body-col body-col-1"/>
        <div className={`inner-row-2 ${e.acl_highlighted ? 'highlighted' : ''}`}
             style={{minWidth: Math.max(1200, this.hightlightRef?.current?.clientWidth) + 'px'}}
        >
          <div className="free-text-row">
            <input value={scratchpad}
                   onChange={(event) => this.setState({scratchpad: event.target.value.toUpperCase()})}/>
          </div>
        </div>
      </div>}
    </div>);
  }
}
