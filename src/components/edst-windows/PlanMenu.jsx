import React from 'react';
import '../../css/header-button-styles.scss';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class PlanMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false
    };
    this.planMenuRef = React.createRef();
  }

  render() {
    const {focused} = this.state;
    const {pos, data} = this.props;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu plan no-select"
        ref={this.planMenuRef}
        id="plan-menu"
        style={{left: pos.x + "px", top: pos.y + "px"}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.planMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Plan Options Menu
        </div>
        <div className="options-body">
          <div className="options-row fid">
            {data?.cid} {data?.callsign}
          </div>
          <div className="options-row"
               onMouseDown={() => this.props.openMenu(this.planMenuRef.current, 'alt-menu', false)}
          >
            Altitude...
          </div>
          <div className="options-row" disabled={true}>
            Speed...
          </div>
          <div className="options-row"
               onMouseDown={() => this.props.openMenu(this.planMenuRef.current, 'route-menu', false)}
          >
            Route...
          </div>
          <div className="options-row" disabled={true}>
            Previous Route
          </div>
          <div className="options-row" disabled={true}>
            Stop Probe...
          </div>
          <div className="options-row" disabled={true}>
            Trial Restrictions...
          </div>
          <div className="options-row">
            Plans
          </div>
          <div className="options-row">
            Keep
          </div>
          <div className="options-row">
            Delete
          </div>
          <div className="options-bottom-row">
            <button className="edst-window-button"
                    onMouseDown={this.props.closeWindow}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }
}