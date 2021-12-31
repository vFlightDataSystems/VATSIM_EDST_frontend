import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import '../../css/windows/spd-hdg-menu-styles.scss';
import _ from "lodash";

export default class SpeedMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      speed: 280,
      deltaY: 0,
      sign: '',
      amend: true
    };
    this.speedMenuRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.data !== prevProps.data) {
      this.setState({
        focused: false,
        speed: 280,
        deltaY: 0,
        sign: '',
        amend: true
      });
    }
  }

  render() {
    const {focused, amend, speed, sign, deltaY} = this.state;
    const {pos, data} = this.props;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu speed no-select"
        ref={this.speedMenuRef}
        id="speed-menu"
        style={{left: pos.x, top: pos.y}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.speedMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Speed Information
        </div>
        <div className="options-body">
          <div className="options-row fid">
            {data?.callsign} {data?.type}/{data?.equipment}
          </div>
          <div className="options-row speed-row"
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <div className="options-col left"
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
              Speed:
              <div className="speed-input">
                <input value={speed} onChange={(e) => this.setState({speed: e.target.value})}/>
              </div>
            </div>
          </div>
          <div className="spd-hdg-menu-row top-border"/>
          <div className="spd-hdg-menu-row bottom-border">
            KNOTS
              <button className={`button-1 ${sign === '+' ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({sign: sign === '+' ? '' : '+'})}>
                +
              </button>
            <button className={`button-2 ${sign === '-' ? 'selected' : ''}`}
                    onMouseDown={() => this.setState({sign: sign === '-' ? '' : '-'})}>
              -
            </button>
            MACH
          </div>
          <div className="spd-hdg-menu-select-container"
               onWheel={(e) => this.setState({deltaY: deltaY + e.deltaY})}
          >
            {_.range(5, -6, -1).map(i => {
              const spd = speed - (deltaY / 100 | 0) * 10 + i * 10;
              const mach = 0.79 - (deltaY / 100 | 0) / 100 + i / 100;
              return <div className="spd-hdg-menu-container-row" key={`speed-menu-${i}`}>
                <div className="spd-hdg-menu-container-col"
                     onMouseDown={() => {
                       this.props.updateEntry(data.cid, {scratch_spd: {scratchpad: !amend, val: `${(amend && sign === '') ? 'S' : ''}${spd}${sign}`}});
                       this.props.closeWindow();
                     }}
                >
                  {String(spd).padStart(3, '0')}{sign}
                </div>
                <div className="spd-hdg-menu-container-col"
                     onMouseDown={() => {
                       this.props.updateEntry(data.cid, {scratch_spd: {scratchpad: !amend, val: `${(amend && sign === '') ? 'S' : ''}${spd+5}${sign}`}});
                       this.props.closeWindow();
                     }}
                >
                  {String(spd + 5).padStart(3, '0')}{sign}
                </div>
                <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-2"
                     onMouseDown={() => {
                       this.props.updateEntry(data.cid, {scratch_spd: {scratchpad: !amend, val: `M${Number(mach * 100)}${sign}`}});
                       this.props.closeWindow();
                     }}
                >
                  {String(mach.toFixed(2)).slice(1)}{sign}
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
