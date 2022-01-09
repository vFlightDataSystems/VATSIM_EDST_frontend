import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {length, lineString} from '@turf/turf';

export default class HoldMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hold_fix: null,
      leg_length: null,
      hold_direction: null,
      turns: null,
      efc: '',
      route_data: null,
      focused: false
    };
    this.holdMenuRef = React.createRef();
  }

  componentDidMount() {
    const {data} = this.props;
    const route_data = this.computeCrossingTimes(this.props.data?._route_data);
    const now = new Date();
    const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    this.setState({
      hold_fix: data?.hold_data?.hold_fix || 'PP',
      leg_length: data?.hold_data?.leg_length || 'STD',
      hold_direction: data?.hold_data?.hold_direction || 'N',
      turns: data?.hold_data?.turns || 'RT',
      efc: data?.hold_data?.efc || utc_minutes + 30,
      route_data: route_data
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.data !== prevProps.data) {
      const {data} = this.props;
      this.setState({
        hold_fix: data?.hold_data?.hold_fix,
        leg_length: data?.hold_data?.leg_length,
        hold_direction: data?.hold_data?.hold_direction,
        turns: data?.hold_data?.turns,
        efc: data?.hold_data?.efc,
        route_data: this.computeCrossingTimes(this.props.data?._route_data),
        focused: false
      });

    }
  }

  computeCrossingTimes = (route_data) => {
    const now = new Date();
    const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const {data} = this.props;
    const groundspeed = Number(data?.flightplan?.ground_speed);
    if (route_data && groundspeed > 0) {
      let line_data = [[data?.flightplan?.lon, data?.flightplan?.lat]];
      for (let e of route_data) {
        line_data.push(e.pos);
        e.minutes_at_fix = utc_minutes + 60 * length(lineString(line_data), {units: 'nauticalmiles'}) / groundspeed;
      }
    }
    return route_data;
  }

  formatEfc = (efc) => ("0" + ((efc / 60 | 0) % 24)).slice(-2) + ("0" + (efc % 60 | 0)).slice(-2);

  clearedHold = () => {
    const {data} = this.props;
    const {hold_fix, leg_length, hold_direction, turns, efc} = this.state;
    const hold_data = {
      hold_fix: hold_fix,
      leg_length: leg_length,
      hold_direction: hold_direction,
      turns: turns,
      efc: efc
    };
    this.props.amendEntry(data.cid, {hold_data: hold_data});
    this.props.closeWindow();
  }

  render() {
    const {
      focused,
      hold_fix,
      turns,
      hold_direction,
      leg_length,
      efc,
      route_data
    } = this.state;
    const {pos, data} = this.props;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu hold no-select"
        ref={this.holdMenuRef}
        id="hold-menu"
        style={{left: pos.x, top: pos.y}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.holdMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Hold Data Menu
        </div>
        <div className="options-body">
          <div className="options-row fid">
            {data?.callsign} {data?.type}/{data?.equipment}
          </div>
          <div className="options-row">
            <div className="options-col hold-menu-left-col">
              Location
            </div>
          </div>
          <div className="options-row">
            <div className="options-col">
              <button className={`${(!hold_fix || hold_fix === 'PP') ? 'selected' : ''}`}
                      onMouseDown={() => {
                        const now = new Date();
                        const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
                        this.setState({hold_fix: 'PP', efc: utc_minutes + 30})
                      }}>
                Present Position
              </button>
            </div>
          </div>
          <div className="hold-fix-container">
            {[...Array(Math.min(route_data?.length || 0, 10)).keys()].map(i => <div className="options-row"
                                                                                    key={`hold-menu-row-${i}`}>
              {[...Array(((route_data?.length || 0) / 10 | 0) + 1).keys()].map(j => {
                const fix_name = route_data[i + j * 10]?.name;
                const minutes_at_fix = route_data[i + j * 10]?.minutes_at_fix;
                const efc = minutes_at_fix + 30;
                return (fix_name && <div className={`options-col hold-col-1 hover ${(hold_fix === fix_name) ? 'selected' : ''}`}
                                    key={`hold-menu-col-${i}-${j}`}
                                    onMouseDown={() => this.setState({hold_fix: fix_name, efc: efc})}
                >
                  {fix_name}
                  <div className="align-right">
                    {("0" + ((minutes_at_fix / 60 | 0) % 24)).slice(-2) + ("0" + (minutes_at_fix % 60 | 0)).slice(-2)}
                  </div>
                </div>);
              })
              }
            </div>)}
          </div>
          <div className="options-row hold-row-1">
            <div className="options-col hold-col-2">
              Direction
            </div>
            <div className="options-col hold-col-2">
              Turns
            </div>
            <div className="options-col hold-col-2">
              Leg Lengths
            </div>
          </div>
          <div className="options-row hold-row-1">
            <div className="options-col hold-col-3">
              <button className={`button-1 ${(hold_direction === 'NW') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({hold_direction: 'NW'})}
              >
                NW
              </button>
              <button className={`button-1 ${(!hold_direction || hold_direction === 'N') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({hold_direction: 'N'})}
              >
                N
              </button>
              <button className={`button-1 ${(hold_direction === 'NE') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({hold_direction: 'NE'})}
              >
                NE
              </button>
            </div>
            <div className="options-col hold-col-3">
              <button className={`button-1 ${(turns === 'LT') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({turns: 'LT'})}
              >
                LT
              </button>
              <button className={`button-1 ${(!turns || turns === 'RT') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({turns: 'RT'})}
              >
                RT
              </button>
            </div>
            <div className="options-col hold-col-3">
              <button className={`button-2 ${(!leg_length || leg_length === 'STD') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({leg_length: 'STD'})}
              >
                STD
              </button>
              <button className={`button-2 ${(leg_length === 15) ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({leg_length: 15})}
              >
                15 NM
              </button>
            </div>
          </div>
          <div className="options-row hold-row-1">
            <div className="options-col hold-col-3">
              <button className={`button-1 ${(hold_direction === 'W') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({hold_direction: 'W'})}
              >
                W
              </button>
              <button className="button-1" disabled={true}/>
              <button className={`button-1 ${(hold_direction === 'E') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({hold_direction: 'E'})}
              >
                E
              </button>
            </div>
            <div className="options-col hold-col-3">
              <button className="button-1" disabled={true}/>
              <button className="button-1" disabled={true}/>
            </div>
            <div className="options-col hold-col-3">
              <button className={`button-2 ${(leg_length === 5) ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({leg_length: 5})}
              >
                5 NM
              </button>
              <button className={`button-2 ${(leg_length === 20) ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({leg_length: 20})}
              >
                20 NM
              </button>
            </div>
          </div>
          <div className="options-row hold-row-1">
            <div className="options-col hold-col-3">
              <button className={`button-1 ${(hold_direction === 'SW') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({hold_direction: 'SW'})}
              >
                SW
              </button>
              <button className={`button-1 ${(hold_direction === 'S') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({hold_direction: 'S'})}
              >
                S
              </button>
              <button className={`button-1 ${(hold_direction === 'SE') ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({hold_direction: 'SE'})}
              >
                SE
              </button>
            </div>
            <div className="options-col hold-col-3">
              <button className="button-1" disabled={true}/>
              <button className="button-1" disabled={true}/>
            </div>
            <div className="options-col hold-col-3">
              <button className={`button-2 ${(leg_length === 10) ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({leg_length: 10})}
              >
                10 NM
              </button>
              <button className={`button-2 ${(leg_length === 20) ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({leg_length: 20})}
              >
                25 NM
              </button>
            </div>
          </div>
          <div className="options-row hold-row-2 bottom-border">
            <div className="options-col hold-col-4">
              <button onMouseDown={() => {
                this.props.amendEntry(data?.cid, {hold_data: null});
                this.props.updateEntry(data?.cid, {show_hold_info: false});
                this.props.closeWindow();
              }}>
                Delete Hold Instructions
              </button>
            </div>
          </div>
          <div className="options-row hold-row-1">
            <div className="options-col hold-col-2">
              EFC
            </div>
          </div>
          <div className="options-row"
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
          >
            <div className="options-col hold-col-7">
              <div className="input efc-input">
                <input value={this.formatEfc(efc)}
                  // onChange={(e) => this.setState({efc: e.target.value})}
                />
              </div>
              <button onMouseDown={() => this.setState({efc: efc - 1})}>
                -
              </button>
              <button onMouseDown={() => this.setState({efc: efc + 1})}>
                +
              </button>
            </div>
          </div>
          <div className="options-row hold-row-2 bottom-border">
            <div className="options-col hold-col-5">
              <button onMouseDown={() => this.setState({efc: ''})}>
                Delete EFC
              </button>
            </div>
          </div>
          <div className="options-row bottom">
            <div className="options-col left">
              <button onMouseDown={() => {
                this.props.updateEntry(data?.cid, {spa: true});
                this.clearedHold();
              }}
                      disabled={data?.hold_data}
              >
                Hold/SPA
              </button>
              <button onMouseDown={this.clearedHold} disabled={data?.hold_data}>
                Hold
              </button>
              <button disabled={!data?.hold_data}
                      onMouseDown={() => {
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