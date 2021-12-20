import React from 'react';
import '../../css/header-button-styles.css';
import '../../css/header-styles.css';
import '../../css/windows/status-styles.css';

export default class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pos: this.props.pos,
    };
    this.statusRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props !== prevProps) {
      this.setState({pos: this.props.pos});
    }
  }

  render() {
    const {pos} = this.state;

    return (<div className="status-window"
                 ref={this.statusRef}
                 id="edst-status"
                 style={{left: pos.x + "px", top: pos.y + "px"}}
      >
        <div className="status-header">
          <div className="status-header-left">
            M
          </div>
          <div className="status-header-middle"
               onClick={(event) => this.props.startDrag(event, this.statusRef)}
          >
            STATUS
          </div>
          <div className="status-header-right" onClick={this.props.closeWindow}>
            <div className="status-header-block-8-2"/>
          </div>
        </div>
        <div className="status-body">
          TEST
        </div>
      </div>
    );
  }
}