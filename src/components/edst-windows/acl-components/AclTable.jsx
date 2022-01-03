import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import AclRow from "./AclRow";

export default class AclTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // edstData: this.props.edstData,
      hidden: [],
      alt_mouse_down: false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.edstData !== this.props.edstData) {
      let {edstData} = this.state;
      let any_holding = false;
      for (let cid of this.props.cid_list) {
        if (edstData[cid]?.hold_data) {
          any_holding = true;
        }
      }
      this.setState({any_holding: any_holding});
    }
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
    const entry = this.props.edstData[cid];
    if (entry?.acl_status === undefined && this.props.posting_manual) {
      this.props.updateEntry(cid, {acl_status: 0});
    } else {
      if (!entry?.acl_status) {
        this.props.updateEntry(cid, {acl_status: 1});
      } else {
        this.props.updateEntry(cid, {acl_status: 0});
      }
    }
  }

  sort_func = (u, v) => {
    const {sorting} = this.props;
    switch (sorting.name) {
      case 'ACID':
        return u?.callsign?.localeCompare(v?.callsign);
      case 'Destination':
        return u?.dest?.localeCompare(v?.dest);
      case 'Origin':
        return u?.dep?.localeCompare(v?.dep);
      default:
        return u?.callsign?.localeCompare(v?.callsign);
    }
  }

  render() {
    const {hidden, alt_mouse_down} = this.state;
    const {edstData, posting_manual, cid_list} = this.props;

    const sorted_edst_data = Object.values(edstData)?.sort(this.sort_func);

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
        <div className="body-col fid">
          Flight ID
        </div>
        <div className="body-col pa header">
          <div>
            PA
          </div>
        </div>
        <div className="body-col spa rem-hidden"/>
        <div className="body-col spa rem rem-hidden"/>
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
          {/*<div>Alt.</div>*/}
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
        <div className={`body-col body-col-1`}>
          {/*H*/}
        </div>
        <div className={`body-col body-col-1`}>
          {/*H*/}
        </div>
        <div className="body-col route">
          Route
        </div>
      </div>
      <div className="scroll-container">
        {sorted_edst_data.map((e) => (cid_list.includes(e.cid) && e.spa) &&
          <AclRow
            entry={e}
            isSelected={this.isSelected}
            updateStatus={this.updateStatus}
            updateEntry={this.props.updateEntry}
            aircraftSelect={this.props.aircraftSelect}
            hidden={hidden}
            alt_mouse_down={alt_mouse_down}
          />)}
        <div className="body-row separator"/>
        {sorted_edst_data.map((e) => (!e.spa && cid_list.includes(e.cid) && ((e.acl_status !== undefined) || !posting_manual)) &&
          <AclRow
            entry={e}
            isSelected={this.isSelected}
            updateStatus={this.updateStatus}
            updateEntry={this.props.updateEntry}
            aircraftSelect={this.props.aircraftSelect}
            hidden={hidden}
            alt_mouse_down={alt_mouse_down}
          />)}
        {posting_manual && <div className="body-row separator"/>}
        {posting_manual && Object.values(edstData).map((e) => (!e.spa && cid_list.includes(e.cid) && e.acl_status === undefined) &&
          <AclRow
            entry={e}
            isSelected={this.isSelected}
            updateStatus={this.updateStatus}
            updateEntry={this.props.updateEntry}
            aircraftSelect={this.props.aircraftSelect}
            hidden={hidden}
            alt_mouse_down={alt_mouse_down}
          />)}
      </div>
    </div>);
  }
}
