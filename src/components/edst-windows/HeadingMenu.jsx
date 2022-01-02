import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import '../../css/windows/spd-hdg-menu-styles.scss';
import _ from "lodash";

export default class HeadingMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      heading: 280,
      deltaY: 0,
      amend: true
    };
    this.headingMenuRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.data !== prevProps.data) {
      this.setState({
        focused: false,
        heading: 280,
        deltaY: 0,
        amend: true
      });
    }
  }

  render() {
    const {focused, amend, heading, deltaY} = this.state;
    const {pos, data} = this.props;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu heading no-select"
        ref={this.headingMenuRef}
        id="heading-menu"
        style={{left: pos.x, top: pos.y}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.headingMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Heading Information
        </div>
        <div className="options-body">
          <div className="options-row fid">
            {data?.callsign} {data?.type}/{data?.equipment}
          </div>
          <div className="options-row speed-row"
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <div className="options-col"
              // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'spd-hdg-menu', false)}
            >
              <button className={`${amend ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({amend: true})}
              >
                Amend
              </button>
            </div>
            <div className={`options-col right ${!amend ? 'selected' : ''}`}
              // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'spd-hdg-menu', false)}
            >
              <button className={`${!amend ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({amend: false})}>
                Scratchpad
              </button>
            </div>
          </div>
          <div className="options-row"
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <div className="options-col">
              Heading:
              <div className="input speed-input">
                <input value={heading} onChange={(e) => this.setState({speed: e.target.value})}/>
              </div>
            </div>
          </div>
          <div className="spd-hdg-menu-row top-border">
            <div className="hdg-col-1">
              Heading
            </div>
            <div className="hdg-col-1">
              Turn
            </div>
          </div>
          <div className="spd-hdg-menu-row bottom-border">
            <div className="hdg-col-2">
              L &nbsp;&nbsp;R
            </div>
          </div>
          <div className="spd-hdg-menu-select-container"
               onWheel={(e) => this.setState({deltaY: deltaY + e.deltaY})}
          >
            {_.range(50, -70, -10).map(i => {
              const hdg = ((heading - (deltaY / 100 | 0) * 10 + i) % 360 + 360) % 360;
              const rel_hdg = 35 + i / 2;
              return <div className="spd-hdg-menu-container-row" key={`heading-menu-${i}`}>
                <div className="spd-hdg-menu-container-col"
                     onMouseDown={() => {
                       this.props.updateEntry(data.cid, {
                         scratch_hdg: {
                           scratchpad: !amend,
                           val: `${amend ? 'H' : ''}${hdg}`
                         }
                       });
                       this.props.closeWindow();
                     }}
                >
                  {String(hdg).padStart(3, '0')}
                </div>
                <div className="spd-hdg-menu-container-col"
                     onMouseDown={() => {
                       this.props.updateEntry(data.cid, {
                         scratch_hdg: {
                           scratchpad: !amend,
                           val: `${amend ? 'H' : ''}${hdg + 5}`
                         }
                       });
                       this.props.closeWindow();
                     }}
                >
                  {String(hdg + 5).padStart(3, '0')}
                </div>
                <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-3"
                     onMouseDown={() => {
                       this.props.updateEntry(data.cid, {scratch_hdg: {scratchpad: !amend, val: `${rel_hdg}L`}});
                       this.props.closeWindow();
                     }}
                >
                  {rel_hdg}
                </div>
                <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-3"
                     onMouseDown={() => {
                       this.props.updateEntry(data.cid, {scratch_hdg: {scratchpad: !amend, val: `${rel_hdg}R`}});
                       this.props.closeWindow();
                     }}
                >
                  {rel_hdg}
                </div>
              </div>;
            })}
            <div className="options-row bottom">
              <div className="options-col left">
              </div>
              <div className="options-col right">
                <button onMouseDown={this.props.closeWindow}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
