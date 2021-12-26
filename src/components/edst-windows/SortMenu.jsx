import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class SortMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false
    };
    this.sortMenuRef = React.createRef();
  }

  render() {
    const {focused} = this.state;
    const {pos, asel} = this.props;
    const dep = asel?.window === 'dep';

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu no-select"
        ref={this.sortMenuRef}
        id="sort-menu"
        style={{left: pos.x, top: pos.y}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.sortMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Sort Menu
        </div>
        <div className="options-body sort">
          {!dep && <div className="options-row sector">
            <div className="options-col sort">
              <div className="box"/>
              Sector/Non-Sector
            </div>
          </div>}
          <div className="options-row">
            <div className="options-col sort">
              <div className="box diamond"/>
              ACID
            </div>
          </div>
          <div className="options-row">
            <div className="options-col sort">
              <div className="box diamond"/>
              Destination
            </div>
          </div>
          <div className="options-row">
            <div className="options-col sort">
              <div className="box diamond"/>
              Origin
            </div>
          </div>
          <div className="options-row">
            <div className="options-col sort">
              <div className="box diamond"/>
              P-Time
            </div>
          </div>
          <div className="options-row bottom sort">
            <div className="options-col left">
              <button
                // onMouseDown={() => this.props.sort()}
              >
                OK
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
    );
  }
}