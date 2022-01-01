import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';

const ON_FREQ_SYMBOL = 'N';


export default class AclTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // edstData: this.props.edstData,
      hidden: [],
      alt_mouse_down: false
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
    if (entry?.acl_status === undefined) {
      this.props.updateEntry(cid, 'acl_status', '');
    } else {
      if (entry?.acl_status === '') {
        this.props.updateEntry(cid, 'acl_status', ON_FREQ_SYMBOL);
      } else {
        this.props.updateEntry(cid, 'acl_status', '');
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
      default:
        return u?.callsign?.localeCompare(v?.callsign);
    }
  }

  render() {
    const {hidden, alt_mouse_down} = this.state;
    const {edstData, manual, cid_list} = this.props;

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
        <div className="body-col route">
          Route
        </div>
      </div>
      <div className="scroll-container">
        {Object.entries(edstData)?.sort(this.sort_func).map(([cid, e]) => (cid_list.includes(cid) && ((e.acl_status !== undefined) || !manual)) &&
          <div className="body-row" key={`acl-body-${cid}`}>
            <div className={`body-col body-col-1 radio ${e.acl_status === 'N' ? 'green' : ''}`}
                 onMouseDown={() => this.updateStatus(cid)}
            >
              {e.acl_status === undefined ? 'N' : e.acl_status}
            </div>
            <div className="body-col body-col-1 border"/>
            <div className="body-col body-col-1 border"/>
            <div className="body-col body-col-1 border"/>
            <div className="body-col body-col-1"/>
            <div className={`body-col fid hover ${this.isSelected(cid, 'fid') ? 'selected' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'fid')}>
              {e.cid} {e.callsign}
            </div>
            <div className="body-col pa"/>
            <div className="body-col rem"/>
            <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${this.isSelected(cid, 'type') ? 'selected' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'type')}
            >
              {`${e.type}/${e.equipment}`}
            </div>
            <div className={`body-col alt`}>
              <div className={`${alt_mouse_down ? 'md' : ''} ${e.interim ? 'interim' : ''}
          ${this.isSelected(cid, 'alt') ? 'selected' : ''}`}
                   onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'alt')}
              >
                {e.altitude}{e.interim && `T${e.interim}`}
              </div>
            </div>
            <div
              className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''}
          ${this.isSelected(cid, 'code') ? 'selected' : ''}`}
              onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'code')}
            >
              {e.beacon}
            </div>
            <div className={`body-col hs hdg hover ${hidden.includes('hdg') ? 'content hidden' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'hdg')}
            >

            </div>
            <div className="body-col hs-slash">
              /
            </div>
            <div className={`body-col hs spd hover ${hidden.includes('spd') ? 'content hidden' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'spd')}
            >

            </div>
            <div className={`body-col route hover ${this.isSelected(cid, 'route') ? 'selected' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'route')}
            >
              {e.dep}./{e._route}.{e.dest}
            </div>
          </div>)}
        {manual && <div className="body-row separator"/>}
        {manual && Object.entries(edstData).map(([cid, e]) => (cid_list.includes(cid) && e.acl_status === undefined) &&
          <div className="body-row" key={`acl-body-${cid}`}>
            <div className={`body-col body-col-1 radio ${e.acl_status === 'N' ? 'green' : ''}`}
                 onMouseDown={() => this.updateStatus(cid)}>
              N
            </div>
            <div className="body-col body-col-1 border"/>
            <div className="body-col body-col-1 border"/>
            <div className="body-col body-col-1 border"/>
            <div className="body-col body-col-1"/>
            <div className={`body-col fid hover ${this.isSelected(cid, 'fid') ? 'selected' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'fid')}>
              {e.cid} {e.callsign}
            </div>
            <div className="body-col pa"/>
            <div className="body-col rem"/>
            <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${this.isSelected(cid, 'type') ? 'selected' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'type')}
            >
              {`${e.type}/${e.equipment}`}
            </div>
            <div className={`body-col alt`}>
              <div className={`${alt_mouse_down ? 'md' : ''} ${e.interim ? 'interim' : ''}
          ${this.isSelected(cid, 'alt') ? 'selected' : ''}`}
                   onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'alt')}>
                {e.altitude}{e.interim && `T${e.interim}`}
              </div>
            </div>
            <div
              className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''} 
          ${this.isSelected(cid, 'code') ? 'selected' : ''}`}
              onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'code')}
            >
              {e.beacon}
            </div>
            <div className={`body-col hs hdg hover ${hidden.includes('scratch_hdg') ? 'content hidden' : ''}
              ${this.isSelected(cid, 'hdg') ? 'selected' : ''} ${e?.scratch_hdg?.scratchpad ? 'yellow' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'hdg')}
            >
              {e?.scratch_hdg?.val}
            </div>
            <div className="body-col hs-slash">
              /
            </div>
            <div className={`body-col hs spd hover ${hidden.includes('scratch_spd') ? 'content hidden' : ''}
${this.isSelected(cid, 'spd') ? 'selected' : ''} ${e?.scratch_spd?.scratchpad ? 'yellow' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'spd')}
            >
              {e?.scratch_spd?.val}
            </div>
            <div className={`body-col route hover ${this.isSelected(cid, 'route') ? 'selected' : ''}`}
                 onMouseDown={(event) => this.props.aircraftSelect(event, 'acl', cid, 'route')}
            >
              {e.dep}./{e._route}.{e.dest}
            </div>
          </div>)}
      </div>
    </div>);
  }
}
