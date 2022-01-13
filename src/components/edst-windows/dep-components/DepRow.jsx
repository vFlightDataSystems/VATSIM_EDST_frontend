import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';
import {REMOVAL_TIMEOUT} from "../../../lib";

const SPA_INDICATOR = '^';
const COMPLETED_SYMBOL = '✓';

export default class DepRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scratchpad: this.props?.entry?.scratchpad || ''
    };

    this.hightlightRef = React.createRef();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !Object.is(nextProps, this.props) || !Object.is(nextState, this.state);
  }

  componentDidMount() {
    const {entry} = this.props;
    let route = entry.route;
    const dest = entry.dest;
    if (route.slice(-dest.length) === dest) {
      route = route.slice(0, -dest.length);
    }
    const current_fix_names = entry._route_data.map(fix => fix.name);
    this.setState({
      route: route,
      pending_aar: this.#checkAarReroutePending(),
      on_aar: entry?._aar_list?.filter((aar) => aar.on_eligible_aar).length > 0,
      aar_avail: (entry?.aar_list?.filter((aar) => aar.eligible && current_fix_names.includes(aar.tfix))?.length > 1 && !(entry?._aar_list?.filter((aar) => aar.on_eligible_aar) > 0))
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!Object.is(prevProps, this.props)) {
      const {entry} = this.props;
      let route = entry.route;
      const dest = entry.dest;
      if (route.slice(-dest.length) === dest) {
        route = route.slice(0, -dest.length);
      }
      const current_fix_names = entry._route_data.map(fix => fix.name);
      this.setState({
        scratchpad: entry?.scratchpad || '',
        route: route,
        pending_aar: this.#checkAarReroutePending(),
        on_aar: entry?._aar_list?.filter((aar) => aar.on_eligible_aar).length > 0,
        aar_avail: (entry?._aar_list?.filter((aar) => aar.eligible && current_fix_names.includes(aar.tfix))?.length > 1)
      });
    }
  }

    #checkAarReroutePending = () => {
      const entry = this.props.entry;
      const current_fix_names = entry._route_data.map(fix => fix.name);
      const eligible_aar = entry?._aar_list?.filter((aar) => aar.eligible);
      if (eligible_aar?.length === 1) {
        const aar = eligible_aar[0];
        if (current_fix_names.includes(aar.tfix)) {
          return aar.aar_amendment_route_string;
        }
      }
      return null;
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
      this.props.updateEntry(entry.cid, {dep_highlighted: !entry.dep_highlighted});
    }
  }

  #handleFidClick = (event) => {
    const {entry: e} = this.props;
    const now = performance.now();
    switch (event.button) {
      case 2:
        if (now - (e.pending_removal || now) > REMOVAL_TIMEOUT) {
          this.props.deleteEntry('dep', e.cid);
        }
        break;
      default:
        this.props.aircraftSelect(event, 'dep', e.cid, 'fid');
        break;
    }
  }

  render() {
    const {scratchpad, route, pending_aar, aar_avail, on_aar} = this.state;
    const {hidden, entry: e, bottom_border} = this.props;
    const now = performance.now();

    return (<div className={`body-row-container ${bottom_border ? 'row-sep-border' : ''}`} key={this.props.key}>
      <div className={`body-row ${(now - (e.pending_removal || now) > REMOVAL_TIMEOUT) ? 'pending-removal' : ''}`}>
        <div className={`body-col body-col-1 radio dep-radio ${e.dep_status === 1 ? 'checkmark' : ''}`}
             onMouseDown={() => this.props.updateStatus(e.cid)}
        >
          {e.dep_status === -1 && 'N'}{e.dep_status === 1 && COMPLETED_SYMBOL}
        </div>
        <div className="body-col body-col-2">
          0000
        </div>
        <div className={`inner-row ${e.dep_highlighted ? 'highlighted' : ''}`}
             ref={this.hightlightRef}
             style={{minWidth: e.free_text ? '1200px' : 0}}
        >
          <div className={`body-col fid dep-fid hover ${this.props.isSelected(e.cid, 'fid') ? 'selected' : ''}`}
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
            <div>
              <span className={`${aar_avail && !on_aar ? 'amendment' : ''} ${this.props.isSelected(e.cid, 'route') ? 'selected' : ''}`}>{e.dep}</span>{route}
              {pending_aar && !on_aar && <span className={`amendment ${this.props.isSelected(e.cid, 'route') ? 'selected' : ''}`}>
              [{pending_aar}]
              </span>}
              {route?.slice(-1) !== '.' && '..'}{e.dest}
            </div>
            {e.dep}{e.route}
          </div>
        </div>
      </div>
      {e.free_text && <div className="body-row">
        <div className={`body-col body-col-1 radio`}/>
        <div className="body-col body-col-2"/>
        <div className={`inner-row-2 ${e.dep_highlighted ? 'highlighted' : ''}`}
             style={{minWidth: Math.max(1200, this.hightlightRef?.current?.clientWidth)+'px'}}
        >
          <div className="free-text-row dep-free-text-row">
            <input value={scratchpad}
                   onChange={(event) => this.setState({scratchpad: event.target.value.toUpperCase()})}/>
          </div>
        </div>
      </div>}
    </div>);
  }
}