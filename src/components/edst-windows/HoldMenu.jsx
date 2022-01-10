import React, {forwardRef, useEffect, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {length, lineString} from '@turf/turf';

export const HoldMenu = forwardRef((props, ref) => {
  const [hold_fix, setHoldFix] = useState(null);
  const [leg_length, setLegLength] = useState(null);
  const [hold_direction, setHoldDirection] = useState(null);
  const [turns, setTurns] = useState(null);
  const [efc, setEfc] = useState('');
  const [route_data, setRouteData] = useState(null);
  const [focused, setFocused] = useState(false);

  const computeCrossingTimes = (route_data) => {
    const now = new Date();
    const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const {entry} = props;
    const groundspeed = Number(entry?.flightplan?.ground_speed);
    if (route_data && groundspeed > 0) {
      let line_data = [[entry?.flightplan?.lon, entry?.flightplan?.lat]];
      for (let e of route_data) {
        line_data.push(e.pos);
        e.minutes_at_fix = utc_minutes + 60 * length(lineString(line_data), {units: 'nauticalmiles'}) / groundspeed;
      }
    }
    return route_data;
  }

  const formatEfc = (efc) => ("0" + ((efc / 60 | 0) % 24)).slice(-2) + ("0" + (efc % 60 | 0)).slice(-2);

  const clearedHold = () => {
    const {entry} = props;
    const hold_data = {
      hold_fix: hold_fix,
      leg_length: leg_length,
      hold_direction: hold_direction,
      turns: turns,
      efc: efc
    };
    props.amendEntry(entry.cid, {hold_data: hold_data});
    props.closeWindow();
  }

  useEffect(() => {
    const {entry} = props;
    const route_data = computeCrossingTimes(props.data?._route_data);
    const now = new Date();
    const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    setHoldFix(entry?.hold_data?.hold_fix || 'PP');
    setLegLength(entry?.hold_data?.leg_length || 'STD');
    setHoldDirection(entry?.hold_data?.hold_direction || 'N');
    setTurns(entry?.hold_data?.turns || 'RT');
    setEfc(entry?.hold_data?.efc || utc_minutes + 30);
    setRouteData(route_data);
  }, [props.data]);

  const {pos, entry} = props;

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu hold no-select"
      ref={ref}
      id="hold-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => props.startDrag(event, ref)}
           onMouseUp={(event) => props.stopDrag(event)}
      >
        Hold Data Menu
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {entry.callsign} {entry.type}/{entry.equipment}
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
                      setHoldFix('PP');
                      setEfc(utc_minutes + 30);
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
              return (fix_name &&
                <div className={`options-col hold-col-1 hover ${(hold_fix === fix_name) ? 'selected' : ''}`}
                     key={`hold-menu-col-${i}-${j}`}
                     onMouseDown={() => {
                       setHoldFix(fix_name);
                       setEfc(efc);
                     }}
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
                    onMouseDown={() => setHoldDirection('NW')}
            >
              NW
            </button>
            <button className={`button-1 ${(!hold_direction || hold_direction === 'N') ? 'selected' : ''}`}
                    onMouseDown={() => setHoldDirection('N')}
            >
              N
            </button>
            <button className={`button-1 ${(hold_direction === 'NE') ? 'selected' : ''}`}
                    onMouseDown={() => setHoldDirection('NE')}
            >
              NE
            </button>
          </div>
          <div className="options-col hold-col-3">
            <button className={`button-1 ${(turns === 'LT') ? 'selected' : ''}`}
                    onMouseDown={() => setTurns('LT')}
            >
              LT
            </button>
            <button className={`button-1 ${(!turns || turns === 'RT') ? 'selected' : ''}`}
                    onMouseDown={() => setTurns('RT')}
            >
              RT
            </button>
          </div>
          <div className="options-col hold-col-3">
            <button className={`button-2 ${(!leg_length || leg_length === 'STD') ? 'selected' : ''}`}
                    onMouseDown={() => setLegLength('STD')}
            >
              STD
            </button>
            <button className={`button-2 ${(leg_length === 15) ? 'selected' : ''}`}
                    onMouseDown={() => setLegLength(15)}
            >
              15 NM
            </button>
          </div>
        </div>
        <div className="options-row hold-row-1">
          <div className="options-col hold-col-3">
            <button className={`button-1 ${(hold_direction === 'W') ? 'selected' : ''}`}
                    onMouseDown={() => setHoldDirection('W')}
            >
              W
            </button>
            <button className="button-1" disabled={true}/>
            <button className={`button-1 ${(hold_direction === 'E') ? 'selected' : ''}`}
                    onMouseDown={() => setHoldDirection('E')}
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
                    onMouseDown={() => setLegLength(5)}
            >
              5 NM
            </button>
            <button className={`button-2 ${(leg_length === 20) ? 'selected' : ''}`}
                    onMouseDown={() => setLegLength(20)}
            >
              20 NM
            </button>
          </div>
        </div>
        <div className="options-row hold-row-1">
          <div className="options-col hold-col-3">
            <button className={`button-1 ${(hold_direction === 'SW') ? 'selected' : ''}`}
                    onMouseDown={() => setHoldDirection('SW')}
            >
              SW
            </button>
            <button className={`button-1 ${(hold_direction === 'S') ? 'selected' : ''}`}
                    onMouseDown={() => setHoldDirection('S')}
            >
              S
            </button>
            <button className={`button-1 ${(hold_direction === 'SE') ? 'selected' : ''}`}
                    onMouseDown={() => setHoldDirection('SE')}
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
                    onMouseDown={() => setLegLength(10)}
            >
              10 NM
            </button>
            <button className={`button-2 ${(leg_length === 25) ? 'selected' : ''}`}
                    onMouseDown={() => setLegLength(25)}
            >
              25 NM
            </button>
          </div>
        </div>
        <div className="options-row hold-row-2 bottom-border">
          <div className="options-col hold-col-4">
            <button onMouseDown={() => {
              props.amendEntry(entry.cid, {hold_data: null});
              props.updateEntry(entry.cid, {show_hold_info: false});
              props.closeWindow();
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
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'alt-menu', false)}
        >
          <div className="options-col hold-col-7">
            <div className="input efc-input">
              <input value={formatEfc(efc)}
                // onChange={(e) => setState({efc: e.target.value})}
              />
            </div>
            <button onMouseDown={() => setEfc(efc - 1)}>
              -
            </button>
            <button onMouseDown={() => setEfc(efc + 1)}>
              +
            </button>
          </div>
        </div>
        <div className="options-row hold-row-2 bottom-border">
          <div className="options-col hold-col-5">
            <button onMouseDown={() => setEfc('')}>
              Delete EFC
            </button>
          </div>
        </div>
        <div className="options-row bottom">
          <div className="options-col left">
            <button onMouseDown={() => {
              props.updateEntry(entry.cid, {spa: true});
              clearedHold();
            }}
                    disabled={entry?.hold_data}
            >
              Hold/SPA
            </button>
            <button onMouseDown={clearedHold} disabled={entry?.hold_data}>
              Hold
            </button>
            <button disabled={!entry?.hold_data}
                    onMouseDown={() => {
                      props.amendEntry(entry?.cid, {hold_data: null});
                      props.updateEntry(entry?.cid, {show_hold_info: false});
                      props.closeWindow();
                    }}>
              Cancel Hold
            </button>
          </div>
          <div className="options-col right">
            <button onMouseDown={props.closeWindow}>
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
})
