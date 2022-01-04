import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';
import DepRow from "./DepRow";

const COMPLETED_SYMBOL = '✓';

export default class DepTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: []
    };
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

  isSelected = (cid, field) => {
    const asel = this.props.asel;
    return asel?.cid === cid && asel?.field === field && asel?.window === 'dep';
  }

  updateStatus = (cid) => {
    const entry = this.props.edstData[cid];
    if (entry?.dep_status === -1) {
      this.props.updateEntry(cid, {dep_status: 0});
    } else {
      if (entry?.dep_status < 1) {
        this.props.updateEntry(cid, {dep_status: 1});
      } else {
        this.props.updateEntry(cid, {dep_status: 0});
      }
    }
  }

  sortFunc = (u, v) => {
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

  sortSpa = (u, v) => {
    return u?.spa?.localeCompare(v?.spa);
  }

  render() {
    const {hidden} = this.state;
    const {edstData, posting_manual, cid_list} = this.props;

    const data = Object.values(edstData)?.filter(e => cid_list.includes(e.cid));

    return (<div className="dep-body no-select">
      <div className="body-row header" key="dep-table-header">
        <div className="body-col radio-header checkmark">
          {COMPLETED_SYMBOL}
        </div>
        <div className="body-col body-col-2">
          P Time
        </div>
        <div className="body-col fid dep-fid">
          Flight ID
        </div>
        <div className="body-col pa header"/>
        <div className="body-col special special-hidden"/>
        <div className="body-col special rem special-hidden"/>
        <div className={`body-col type dep-type ${hidden.includes('type') ? 'hidden' : ''}`}>
          <div onMouseDown={() => this.toggleHideColumn('type')}>
            T{!hidden.includes('type') && 'ype'}
          </div>
        </div>
        <div className="body-col alt header"
             onMouseDown={() => this.setState({alt_mouse_down: true})}
             onMouseUp={() => this.setState({alt_mouse_down: false})}
        >
          <div>Alt.</div>
        </div>
        <div className={`body-col code hover ${hidden.includes('code') ? 'hidden' : ''}`}
             onMouseDown={() => this.toggleHideColumn('code')}>
          C{!hidden.includes('code') && 'ode'}
        </div>
        <div className="body-col route">
          Route
        </div>
      </div>
      <div className="scroll-container">
        {data.filter(e => (typeof(e.spa) === 'number'))?.sort(this.sortSpa)?.map((e) =>
          <DepRow
            entry={e}
            isSelected={this.isSelected}
            aircraftSelect={this.props.aircraftSelect}
            updateEntry={this.props.updateEntry}
            amendEntry={this.props.amendEntry}
            deleteEntry={this.props.deleteEntry}
            updateStatus={this.updateStatus}
            hidden={hidden}
          />)}
        <div className="body-row separator"/>
        {data?.filter(e => (!(typeof(e.spa) === 'number') && ((e.dep_status > -1) || !posting_manual)))?.sort(this.sortFunc)?.map((e) =>
          <DepRow
            entry={e}
            isSelected={this.isSelected}
            aircraftSelect={this.props.aircraftSelect}
            updateEntry={this.props.updateEntry}
            amendEntry={this.props.amendEntry}
            deleteEntry={this.props.deleteEntry}
            updateStatus={this.updateStatus}
            hidden={hidden}
          />)}
        {posting_manual && <div className="body-row separator"/>}
        {posting_manual && data?.filter(e => (!(typeof(e.spa) === 'number') && e.dep_status === -1))?.map((e) =>
          <DepRow
            entry={e}
            isSelected={this.isSelected}
            aircraftSelect={this.props.aircraftSelect}
            updateEntry={this.props.updateEntry}
            amendEntry={this.props.amendEntry}
            deleteEntry={this.props.deleteEntry}
            updateStatus={this.updateStatus}
            hidden={hidden}
          />)}
      </div>
    </div>);
  }
}
