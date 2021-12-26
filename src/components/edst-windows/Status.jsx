import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';

export default class Status extends React.Component {
  constructor(props) {
    super(props);
    this.statusRef = React.createRef();
  }

  render() {
    const {pos} = this.props;

    return (<div className="floating-window status-window"
                 ref={this.statusRef}
                 id="edst-status"
                 style={{left: pos.x + "px", top: pos.y + "px"}}
      >
        <div className="floating-window-header no-select">
          <div className="floating-window-header-left">
            M
          </div>
          <div className="floating-window-header-middle"
               onMouseDown={(event) => this.props.startDrag(event, this.statusRef)}
          >
            STATUS
          </div>
          <div className="floating-window-header-right" onMouseDown={this.props.closeWindow}>
            <div className="floating-window-header-block-8-2"/>
          </div>
        </div>
        <div className="floating-window-body">
          STATUS TEST
        </div>
      </div>
    );
  }
}