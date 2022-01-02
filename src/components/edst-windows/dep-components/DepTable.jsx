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
    if (entry?.dep_status === undefined) {
      this.props.updateEntry(cid, {dep_status: ''});
    } else {
      if (entry?.dep_status === '') {
        this.props.updateEntry(cid, {dep_status: COMPLETED_SYMBOL});
      } else {
        this.props.updateEntry(cid, {dep_status: ''});
      }
    }
  }

  sort_func = ([_, u], [__, v]) => {
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
    const {hidden} = this.state;
    const {edstData, manual, cid_list} = this.props;

    return (<div className="dep-body no-select">
      <div className="body-row header" key="dep-table-header">
        <div className="body-col radio-header checkmark">
          {COMPLETED_SYMBOL}
        </div>
        <div className="body-col body-col-2">
          P Time
        </div>
        <div className="body-col fid">
          Flight ID
        </div>
        <div className="body-col pa header"/>
        <div className="body-col rem header"/>
        <div className={`body-col type ${hidden.includes('type') ? 'hidden' : ''}`}>
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
        <div className="body-row separator"/>
        {Object.entries(edstData)?.sort(this.sort_func)?.map(([cid, e]) => (cid_list.includes(cid) && ((e.dep_status !== undefined) || !manual)) &&
          <div className={`body-row ${e.pending_removal ? 'pending-removal' : ''}`} key={`dep-body-${cid}`}>
            <div className={`body-col body-col-1 radio dep-radio ${e.dep_status !== undefined ? 'checkmark' : ''}`}
                 onMouseDown={() => this.updateStatus(cid)}
            >
              {e.dep_status === undefined && manual ? 'N' : e.dep_status}
            </div>
            <div className="body-col body-col-2">
              0000
            </div>
            <DepRow cid={cid} entry={e} isSelected={this.isSelected} aircraftSelect={this.props.aircraftSelect}
                    updateEntry={this.props.updateEntry} hidden={hidden}/>
          </div>)}
        {manual && <div className="body-row separator"/>}
        {manual && Object.entries(edstData)?.map(([cid, e]) => (cid_list.includes(cid) && e.dep_status === undefined) &&
          <div className={`body-row ${e.pending_removal ? 'pending-removal' : ''}`} key={`dep-body-${cid}`}>
            <div className={`body-col body-col-1 radio dep-radio`}
                 onMouseDown={() => this.updateStatus(cid)}
            >
              N
            </div>
            <div className="body-col body-col-2">
              0000
            </div>
            <DepRow cid={cid} entry={e} isSelected={this.isSelected} aircraftSelect={this.props.aircraftSelect}
                    updateEntry={this.props.updateEntry} hidden={hidden}/>
          </div>)}
      </div>

    </div>);
  }
}
