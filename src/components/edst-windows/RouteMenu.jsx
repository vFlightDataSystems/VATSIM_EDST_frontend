import React from 'react';
import '../../css/header-button-styles.css';
import '../../css/header-styles.css';
import '../../css/windows/route-menu-styles.css';

export default class RouteMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pos: this.props.pos,
      focused: false
    };
    this.routeMenuRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props !== prevProps) {
      this.setState({pos: this.props.pos});
    }
  }

  render() {
    const {pos, focused} = this.state;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="route-menu"
        ref={this.routeMenuRef}
        id="route-menu"
        style={{left: pos.x + "px", top: pos.y + "px"}}
      >
        <div className={`route-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.routeMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Route Menu
        </div>
        <div className="route-body">

        </div>
      </div>
    );
  }
}