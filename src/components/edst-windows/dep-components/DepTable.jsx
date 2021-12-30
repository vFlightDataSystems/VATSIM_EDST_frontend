import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';

const COMPLETED_SYMBOL = '✓';

export default class DepTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // edstData: this.props.edstData,
      hidden: []
    };
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (prevProps !== this.props) {
  //     let {edstData} = this.state;
  //     for (let [cid, e] of Object.entries(this.props.edstData)) {
  //       if (e) {
  //         edstData[cid] = Object.assign(e, edstData[cid]);
  //       }
  //     }
  //     this.setState({edstData: edstData});
  //   }
  // }

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
      this.props.amendEntry(cid, 'dep_status', '')
    } else {
      if (entry?.dep_status === '') {
        this.props.amendEntry(cid, 'dep_status', COMPLETED_SYMBOL)
      } else {
        this.props.amendEntry(cid, 'dep_status', '')
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
        <div className="body-col body-col-1"/>
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
      {Object.entries(edstData)?.sort(this.sort_func)?.map(([cid, e]) => (cid_list.includes(cid) && ((e.dep_status !== undefined) || !manual)) &&
        <div className="body-row" key={`dep-body-${cid}`}>
        <div className={`body-col body-col-1 radio dep-radio ${e.dep_status !== undefined ? 'checkmark' : ''}`}
             onMouseDown={() => this.updateStatus(cid)}
        >
          {e.dep_status === undefined ? 'N' : e.dep_status}
        </div>
        <div className="body-col body-col-1"/>
        <div className={`body-col fid hover ${this.isSelected(cid, 'fid') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'fid')}>
          {e.cid} {e.callsign}
        </div>
        <div className="body-col pa"/>
        <div className="body-col rem"/>
        <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${this.isSelected(cid, 'type') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'type')}
        >
          {`${e.type}/${e.equipment}`}
        </div>
        <div className={`body-col alt`}>
          <div className={`${this.isSelected(cid, 'alt') ? 'selected' : ''}`}
               onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'alt')}
          >
            {e.altitude}
          </div>

        </div>
        <div
          className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''} 
          ${this.isSelected(cid, 'code') ? 'selected' : ''}`}
          onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'code')}
        >
          {e.beacon}
        </div>
        <div className={`body-col route hover ${this.isSelected(cid, 'route') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'route')}
        >
          {e.dep}{e.route}.{e.dest}
        </div>
      </div>)}
      {manual && <div className="body-row separator"/>}
      {manual && Object.entries(edstData)?.map(([cid, e]) => (cid_list.includes(cid) && e.dep_status === undefined) &&
        <div className="body-row" key={`dep-body-${cid}`}>
        <div className={`body-col body-col-1 radio dep-radio`}
             onMouseDown={() => this.updateStatus(cid)}
        >
          N
        </div>
        <div className="body-col body-col-1"/>
        <div className={`body-col fid hover ${this.isSelected(cid, 'fid') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'fid')}>
          {e.cid} {e.callsign}
        </div>
        <div className="body-col pa"/>
        <div className="body-col rem"/>
        <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${this.isSelected(cid, 'type') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'type')}
        >
          {`${e.type}/${e.equipment}`}
        </div>
        <div className={`body-col alt`}>
          <div className={`${this.isSelected(cid, 'alt') ? 'selected' : ''}`}
               onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'alt')}
          >
            {e.altitude}
          </div>

        </div>
        <div
          className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''} 
          ${this.isSelected(cid, 'code') ? 'selected' : ''}`}
          onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'code')}
        >
          {e.beacon}
        </div>
        <div className={`body-col route hover ${this.isSelected(cid, 'route') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'route')}
        >
          {e.dep}{e.route}.{e.dest}
        </div>
      </div>)}
    </div>);
  }
}
