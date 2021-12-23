import React from 'react';
import '../../css/header-button-styles.scss';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class RouteMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false
    };
    this.routeMenuRef = React.createRef();
  }

  render() {
    const {focused} = this.state;
    const {pos, data} = this.props;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu route no-select"
        ref={this.routeMenuRef}
        id="route-menu"
        style={{left: pos.x + "px", top: pos.y + "px"}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.routeMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Route Menu
        </div>
        <div className="options-body">
          <div className="options-row fid">
            {data?.callsign} {data?.type}/{data?.equipment}
          </div>
          <div className="options-row"
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
          >
            Trial Plan
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