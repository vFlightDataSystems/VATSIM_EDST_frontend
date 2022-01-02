import React from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';

export default class DepRow extends React.Component {

  render() {
    const {cid, hidden, entry: e} = this.props;

    return <div className={`inner-row ${e.dep_highlighted ? 'highlighted' : ''}`}>
      <div className={`body-col fid hover ${this.props.isSelected(cid, 'fid') ? 'selected' : ''}`}
           onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'fid')}>
        {e.cid} {e.callsign}
      </div>
      <div className="body-col pa"/>
      <div className="body-col rem" onContextMenu={(event) => {
        event.preventDefault();
        this.props.updateEntry(e.cid, {dep_highlighted: !e.dep_highlighted});
      }}/>
      <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${this.props.isSelected(cid, 'type') ? 'selected' : ''}`}
           onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'type')}
      >
        {`${e.type}/${e.equipment}`}
      </div>
      <div className={`body-col alt`}>
        <div className={`${this.props.isSelected(cid, 'alt') ? 'selected' : ''}`}
             onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'alt')}
        >
          {e.altitude}
        </div>

      </div>
      <div
        className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''} 
          ${this.props.isSelected(cid, 'code') ? 'selected' : ''}`}
        onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'code')}
      >
        {e.beacon}
      </div>
      <div className={`body-col route hover ${this.props.isSelected(cid, 'route') ? 'selected' : ''}`}
           onMouseDown={(event) => this.props.aircraftSelect(event, 'dep', cid, 'route')}
      >
        {e.dep}{e.route}{isNaN(e._route.slice(-1)) ? '.' : ''}.{e.dest}
      </div>
    </div>
  }
}