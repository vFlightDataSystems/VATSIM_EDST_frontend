import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class PlanOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false
    };
    this.planMenuRef = React.createRef();
  }

  render() {
    const {focused} = this.state;
    const {pos, data, asel} = this.props;
    const dep = asel?.window === 'dep';

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu plan no-select"
        ref={this.planMenuRef}
        id="plan-menu"
        style={{left: pos.x, top: pos.y}}
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
          <div className="options-row">
            <div className="options-col hover"
                 onMouseDown={() => this.props.openMenu(this.planMenuRef.current, 'alt-menu', true)}
            >
              Altitude...
            </div>
          </div>
          {!dep && <div className="options-row">
            <div className="options-col hover" disabled={true}>
              Speed...
            </div>
          </div>}
          <div className="options-row">
            <div className="options-col hover"
                 onMouseDown={() => this.props.openMenu(this.planMenuRef.current, 'route-menu', true)}
            >
              Route...
            </div>
          </div>
          <div className="options-row">
            <div className="options-col hover" disabled={true}>
              Previous Route
            </div>
          </div>
          {!dep && <div className="options-row">
            <div className="options-col hover" disabled={true}>
              Stop Probe...
            </div>
          </div>}
          <div className="options-row">
            <div className="options-col hover" disabled={true}>
              Trial {dep ? 'Departure' : 'Restrictions'}...
            </div>
          </div>
          {!dep && <div className="options-row">
            <div className="options-col hover">
              Plans
            </div>
          </div>}
          <div className="options-row">
            <div className="options-col hover">
              Keep
            </div>
          </div>
          <div className="options-row">
            <div className="options-col hover"
              onMouseDown={() => {
                this.props.deleteEntry(dep ? 'dep' : 'acl', asel?.cid);
                this.props.clearAsel();
                this.props.closeWindow();
              }}
            >
              Delete
            </div>
          </div>
          <div className="options-row bottom">
            <div className="options-col right">
              <button onMouseDown={this.props.closeWindow}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}