import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import AclRow from "./AclRow";

export default class AclTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      any_holding: false,
      hidden: [],
      alt_mouse_down: false
    };
  }

  componentDidMount() {
    this.checkHolding();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !Object.is(nextProps, this.props) || !Object.is(nextState, this.state);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!Object.is(prevProps, this.props)) {
      this.checkHolding();
    }
  }

  checkHolding = () => {
    let {edst_data} = this.props;
    let any_holding = false;
    for (let cid of this.props.cid_list) {
      if (edst_data[cid]?.hold_data) {
        any_holding = true;
      }
    }
    this.setState({any_holding: any_holding});
  }

  toggleHideColumn = (name) => {
    let {hidden} = this.state;
    const index = hidden.indexOf(name);
    if (index > -1) {
      hidden.splice(index, 1);
    } else {
      hidden.push(name);
    }
    this.setState({hidden: hidden});
  }

  handleClickSlash = () => {
    const {hidden} = this.state;
    if ((hidden.includes('hdg') && hidden.includes('spd'))
      || (!hidden.includes('hdg') && !hidden.includes('spd'))) {
      this.toggleHideColumn('hdg');
      this.toggleHideColumn('spd');
    } else {
      if (hidden.includes('hdg')) {
        this.toggleHideColumn('spd');
      } else {
        this.toggleHideColumn('hdg');
      }
    }
  }

  isSelected = (cid, field) => {
    const asel = this.props.asel;
    return asel?.cid === cid && asel?.field === field && asel?.window === 'acl';
  }

  updateStatus = (cid) => {
    const entry = this.props.edst_data[cid];
    if (entry?.acl_status === -1 && this.props.posting_manual) {
      this.props.updateEntry(cid, {acl_status: 0});
    } else {
      if (entry?.acl_status < 1) {
        this.props.updateEntry(cid, {acl_status: 1});
      } else {
        this.props.updateEntry(cid, {acl_status: 0});
      }
    }
  }

  sortFunc = (u, v) => {
    const {sorting} = this.props;
    switch (sorting.name) {
      case 'ACID':
        return u.callsign.localeCompare(v.callsign);
      case 'Destination':
        return u.dest.localeCompare(v.dest);
      case 'Origin':
        return u.dep.localeCompare(v.dep);
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  }

  sortSpa = (u, v) => {
    return u.spa - v.spa;
  }

  render() {
    const {hidden, alt_mouse_down, any_holding} = this.state;
    const {edst_data, posting_manual, cid_list} = this.props;

    const data = Object.values(edst_data)?.filter(e => cid_list.includes(e.cid));

    return (<div className="acl-body no-select">
      <div className="body-row header" key="acl-table-header">
        <div className="body-col radio-header green">
          N
        </div>
        <div className="body-col body-col-1 red">
          R
        </div>
        <div className="body-col body-col-1 yellow">
          Y
        </div>
        <div className="body-col body-col-1 orange">
          A
        </div>
        <div className="body-col body-col-1"/>
        <div className="inner-row">
          <div className="body-col fid">
            Flight ID
          </div>
          <div className="body-col pa header">
            <div>
              PA
            </div>
          </div>
          <div className="body-col special special-hidden"/>
          <div className="body-col special rem special-hidden"/>
          <div className={`body-col type ${hidden.includes('type') ? 'hidden' : ''}`}>
            <div onMouseDown={() => this.toggleHideColumn('type')}>
              T{!hidden.includes('type') && 'ype'}
            </div>
          </div>
          <div className="body-col alt header hover"
               onMouseDown={() => this.setState({alt_mouse_down: true})}
               onMouseUp={() => this.setState({alt_mouse_down: false})}
          >
            Alt.
          </div>
          <div className={`body-col code hover ${hidden.includes('code') ? 'hidden' : ''}`}
               onMouseDown={() => this.toggleHideColumn('code')}>
            C{!hidden.includes('code') && 'ode'}
          </div>
          <div className={`body-col hs hdg hover ${hidden.includes('hdg') ? 'hidden' : ''}`}
               onMouseDown={() => this.toggleHideColumn('hdg')}>
            H{!hidden.includes('hdg') && 'dg'}
          </div>
          <div className="body-col hs-slash hover" onMouseDown={this.handleClickSlash}>
            /
          </div>
          <div className={`body-col hs spd hover ${hidden.includes('spd') ? 'hidden' : ''}`}
               onMouseDown={() => this.toggleHideColumn('spd')}>
            S{!hidden.includes('spd') && 'pd'}
          </div>
          <div className={`body-col special special-header`}/>
          <div className={`body-col special special-header`} disabled={!any_holding}>
            H
          </div>
          <div className={`body-col special special-header`}/>
          <div className="body-col route">
            Route
          </div>
        </div>
      </div>
      <div className="scroll-container">
        {data.filter(e => (typeof (e.spa) === 'number'))?.sort(this.sortSpa)?.map((e) =>
          <AclRow
            key={`acl-table-row-spa-${e.cid}`}
            entry={e}
            any_holding={any_holding}
            isSelected={this.isSelected}
            updateStatus={this.updateStatus}
            updateEntry={this.props.updateEntry}
            amendEntry={this.props.amendEntry}
            aircraftSelect={this.props.aircraftSelect}
            deleteEntry={this.props.deleteEntry}
            hidden={hidden}
            alt_mouse_down={alt_mouse_down}
          />)}
        <div className="body-row separator"/>
        {data?.filter(e => (!(typeof (e.spa) === 'number') && ((e.acl_status > -1) || !posting_manual)))?.sort(this.sortFunc).map((e) =>
          <AclRow
            key={`acl-table-row-ack-${e.cid}`}
            entry={e}
            any_holding={any_holding}
            isSelected={this.isSelected}
            updateStatus={this.updateStatus}
            updateEntry={this.props.updateEntry}
            amendEntry={this.props.amendEntry}
            aircraftSelect={this.props.aircraftSelect}
            deleteEntry={this.props.deleteEntry}
            hidden={hidden}
            alt_mouse_down={alt_mouse_down}
          />)}
        {posting_manual && <div className="body-row separator"/>}
        {posting_manual && data?.filter(e => (!(typeof (e.spa) === 'number') && cid_list.includes(e.cid) && e.acl_status === -1)).map((e) =>
          <AclRow
            key={`acl-table-row-no-ack-${e.cid}`}
            entry={e}
            any_holding={any_holding}
            isSelected={this.isSelected}
            updateStatus={this.updateStatus}
            updateEntry={this.props.updateEntry}
            amendEntry={this.props.amendEntry}
            aircraftSelect={this.props.aircraftSelect}
            deleteEntry={this.props.deleteEntry}
            hidden={hidden}
            alt_mouse_down={alt_mouse_down}
          />)}
      </div>
    </div>);
  }
}
