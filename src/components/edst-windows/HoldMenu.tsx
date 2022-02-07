import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {length, lineString} from '@turf/turf';
import {EdstContext} from "../../contexts/contexts";
import {formatUtcMinutes} from "../../lib";
import {EdstButton} from "../resources/EdstButton";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {EdstWindowProps} from "../../types";

export const HoldMenu: React.FC<EdstWindowProps> = ({pos, asel, closeWindow}) => {
  const {
    startDrag,
    stopDrag,
    amendEntry,
    updateEntry,
    edst_data
  } = useContext(EdstContext);
  const entry = edst_data[asel.cid];

  const now = new Date();
  const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const [hold_fix, setHoldFix] = useState<string | null>(null);
  const [leg_length, setLegLength] = useState<string | number | null>(null);
  const [hold_direction, setHoldDirection] = useState<string | null>(null);
  const [turns, setTurns] = useState<string | null>(null);
  const [efc, setEfc] = useState(utc_minutes);
  const [route_data, setRouteData] = useState<Array<any> | null>(null);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  const clearedHold = () => {
    if (entry) {
      const hold_data = {
        hold_fix: hold_fix,
        leg_length: leg_length,
        hold_direction: hold_direction,
        turns: turns,
        efc: efc
      };
      amendEntry(entry.cid, {hold_data: hold_data});
    }
    closeWindow();
  };

  useEffect(() => {
    const computeCrossingTimes = (route_data?: Array<any>) => {
      const now = new Date();
      const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      const groundspeed = Number(entry?.flightplan?.ground_speed);
      if (route_data && groundspeed > 0) {
        let line_data = [[entry?.flightplan?.lon, entry?.flightplan?.lat]];
        for (let e of route_data) {
          line_data.push(e.pos);
          e.minutes_at_fix = utc_minutes + 60 * length(lineString(line_data), {units: 'nauticalmiles'}) / groundspeed;
        }
      }
      return route_data;
    };
    const route_data = computeCrossingTimes(entry?._route_data);
    const now = new Date();
    const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    setHoldFix(entry?.hold_data?.hold_fix ?? 'PP');
    setLegLength(entry?.hold_data?.leg_length ?? 'STD');
    setHoldDirection(entry?.hold_data?.hold_direction ?? 'N');
    setTurns(entry?.hold_data?.turns ?? 'RT');
    setEfc(entry?.hold_data?.efc ?? utc_minutes + 30);
    setRouteData(route_data ?? null);
  }, [entry]);

  return (entry && <div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu hold no-select"
      ref={ref}
      id="hold-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref)}
           onMouseUp={(event) => stopDrag(event)}
      >
        Hold Data Menu
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {entry.callsign} {entry.type}/{entry.equipment}
        </div>
        <div className="options-row">
          <EdstTooltip className="options-col hold-menu-left-col"
                       title={Tooltips.hold_direction}
                       content="Location"
          />
        </div>
        <div className="options-row">
          <div className="options-col">
            <EdstButton content="Present Position" selected={(!hold_fix || hold_fix === 'PP')}
                        onMouseDown={() => {
                          const now = new Date();
                          const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
                          setHoldFix('PP');
                          setEfc(utc_minutes + 30);
                        }}>
              Present Position
            </EdstButton>
          </div>
        </div>
        <div className="hold-fix-container">
          {Object.keys(Array(Math.min(route_data?.length || 0, 10))).map(i =>
            <div className="options-row" key={`hold-menu-row-${i}`}>
              {Object.keys(Array(((route_data?.length || 0) / 10 | 0) + 1)).map(j => {
                const fix_name = route_data?.[Number(i) + Number(j) * 10]?.name;
                const minutes_at_fix = route_data?.[Number(i) + Number(j) * 10]?.minutes_at_fix;
                return (fix_name &&
                  <div className={`options-col hold-col-1 hover ${(hold_fix === fix_name) ? 'selected' : ''}`}
                       key={`hold-menu-col-${i}-${j}`}
                       onMouseDown={() => {
                         setHoldFix(fix_name);
                         setEfc(minutes_at_fix + 30);
                       }}
                  >
                    {fix_name}
                    <div className="align-right">
                      {("0" + ((minutes_at_fix / 60 | 0) % 24)).slice(-2) + ("0" + (minutes_at_fix % 60 | 0)).slice(-2)}
                    </div>
                  </div>);
              })}
            </div>)}
        </div>
        <div className="options-row hold-row-1">
          <EdstTooltip className="options-col hold-col-2"
                       content="Direction"
                       title={Tooltips.hold_direction}
          />
          <EdstTooltip className="options-col hold-col-2"
                       content="Turns"
                       title={Tooltips.hold_turns}
          />
          <EdstTooltip className="options-col hold-col-2"
                       content="Leg Lengths"
                       title={Tooltips.hold_leg_length}
          />
        </div>
        <div className="options-row hold-row-1">
          <div className="options-col hold-col-3">
            <EdstButton content="NW" className="button-1" selected={hold_direction === 'NW'}
                        onMouseDown={() => setHoldDirection('NW')}
            />
            <EdstButton content="N" className="button-1" selected={hold_direction === 'N'}
                        onMouseDown={() => setHoldDirection('N')}
            />
            <EdstButton content="NE" className="button-1" selected={hold_direction === 'NE'}
                        onMouseDown={() => setHoldDirection('NE')}
            />
          </div>
          <div className="options-col hold-col-3">
            <EdstButton content="LT" className="button-1" selected={turns === 'LT'}
                        onMouseDown={() => setTurns('LT')}
            />
            <EdstButton content="RT" className="button-1" selected={turns === 'RT'}
                        onMouseDown={() => setTurns('RT')}
            />
          </div>
          <div className="options-col hold-col-3">
            <EdstButton content="STD" className="button-2" selected={!leg_length || leg_length === 'STD'}
                        onMouseDown={() => setLegLength('STD')}
            />
            <EdstButton content="15 NM" className="button-2" selected={!leg_length || leg_length === 15}
                        onMouseDown={() => setLegLength(15)}
            />
          </div>
        </div>
        <div className="options-row hold-row-1">
          <div className="options-col hold-col-3">
            <EdstButton content="W" className="button-1" selected={hold_direction === 'W'}
                        onMouseDown={() => setHoldDirection('W')}
            />
            <EdstButton className="button-1" disabled={true}/>
            <EdstButton content="E" className="button-1" selected={hold_direction === 'E'}
                        onMouseDown={() => setHoldDirection('E')}
            />
          </div>
          <div className="options-col hold-col-3">
            <EdstButton className="button-1" disabled={true}/>
            <EdstButton className="button-1" disabled={true}/>
          </div>
          <div className="options-col hold-col-3">
            <EdstButton content="5 NM" className="button-2" selected={!leg_length || leg_length === 5}
                        onMouseDown={() => setLegLength(5)}
            />
            <EdstButton content="20 NM" className="button-2" selected={!leg_length || leg_length === 20}
                        onMouseDown={() => setLegLength(20)}
            />
          </div>
        </div>
        <div className="options-row hold-row-1">
          <div className="options-col hold-col-3">
            <EdstButton content="SW" className="button-1" selected={hold_direction === 'SW'}
                        onMouseDown={() => setHoldDirection('SW')}
            />
            <EdstButton content="S" className="button-1" selected={hold_direction === 'S'}
                        onMouseDown={() => setHoldDirection('S')}
            />
            <EdstButton content="SE" className="button-1" selected={hold_direction === 'SE'}
                        onMouseDown={() => setHoldDirection('SE')}
            />
          </div>
          <div className="options-col hold-col-3">
            <EdstButton className="button-1" disabled={true}/>
            <EdstButton className="button-1" disabled={true}/>
          </div>
          <div className="options-col hold-col-3">
            <EdstButton content="10 NM" className="button-2" selected={!leg_length || leg_length === 10}
                        onMouseDown={() => setLegLength(10)}
            />
            <EdstButton content="25 NM" className="button-2" selected={!leg_length || leg_length === 25}
                        onMouseDown={() => setLegLength(25)}
            />
          </div>
        </div>
        <div className="options-row hold-row-2 bottom-border">
          <div className="options-col hold-col-4">
            <EdstButton
              content="Delete Hold Instructions"
              onMouseDown={() => {
                amendEntry(entry.cid, {hold_data: null});
                updateEntry(entry.cid, {show_hold_info: false});
                closeWindow();
              }}
              title={Tooltips.hold_delete_hold_instr}
            />
          </div>
        </div>
        <div className="options-row hold-row-1">
          <EdstTooltip className="options-col hold-col-2" title={Tooltips.hold_efc}>
            EFC
          </EdstTooltip>
        </div>
        <div className="options-row"
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'alt-menu', false)}
        >
          <div className="options-col hold-col-7">
            <div className="input efc-input">
              <input value={formatUtcMinutes(efc)}
                     readOnly={true}
                // onChange={(e) => setEfc(e.target.value)}
              />
            </div>
            <EdstButton content="-" onMouseDown={() => setEfc(efc - 1)}/>
            <EdstButton content="+" onMouseDown={() => setEfc(efc + 1)}/>
          </div>
        </div>
        <div className="options-row hold-row-2 bottom-border">
          <div className="options-col hold-col-5">
            <EdstButton content="Delete EFC" onMouseDown={() => setEfc(0)} title={Tooltips.hold_del_efc}/>
          </div>
        </div>
        <div className="options-row bottom">
          <div className="options-col left">
            <EdstButton content="Hold/SPA" disabled={entry?.hold_data}
                        onMouseDown={() => {
                          updateEntry(entry.cid, {spa: true});
                          clearedHold();
                        }}
                        title={Tooltips.hold_hold_spa_btn}
            />
            <EdstButton content="Hold" onMouseDown={clearedHold} disabled={entry?.hold_data}
                        title={Tooltips.hold_hold_btn}/>
            <EdstButton content="Cancel Hold" disabled={!entry?.hold_data}
                        onMouseDown={() => {
                          amendEntry(entry?.cid, {hold_data: null});
                          updateEntry(entry?.cid, {show_hold_info: false});
                          closeWindow();
                        }}
            />
          </div>
          <div className="options-col right">
            <EdstButton content="Exit" onMouseDown={closeWindow}/>
          </div>
        </div>
      </div>
    </div>
  );
}