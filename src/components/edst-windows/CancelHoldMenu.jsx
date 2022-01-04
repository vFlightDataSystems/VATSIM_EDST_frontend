import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class CancelHoldMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false
    };
    this.cancelHoldMenuRef = React.createRef();
  }

  render() {
    const {
      focused
    } = this.state;
    const {pos, data} = this.props;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu cancel-hold no-select"
        ref={this.cancelHoldMenuRef}
        id="cancel-hold-menu"
        style={{left: pos.x, top: pos.y}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.cancelHoldMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Cancel Hold Confirmation
        </div>
        <div className="options-body">
          <div className="options-row fid">
            {data?.callsign} {data?.type}/{data?.equipment}
          </div>
          <div className="options-row">
            <div className="options-col left">
              <button onMouseDown={() => {
                this.props.amendEntry(data?.cid, {hold_data: null});
                this.props.updateEntry(data?.cid, {show_hold_info: false});
                this.props.closeWindow();
              }}>
                Cancel Hold
              </button>
            </div>
            <div className="options-col right">
              <button onMouseDown={this.props.closeWindow}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
      ;
  }
}
