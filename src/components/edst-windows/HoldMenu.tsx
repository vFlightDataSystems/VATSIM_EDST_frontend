import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {length, lineString} from '@turf/turf';
import {EdstContext} from "../../contexts/contexts";
import {formatUtcMinutes} from "../../lib";
import {EdstButton} from "../resources/EdstButton";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {EdstWindowType} from "../../types";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import _ from "lodash";
import {updateEntry} from "../../redux/slices/entriesSlice";
import {toggleAclSpa} from "../../redux/slices/aclSlice";

export const HoldMenu: React.FC<EdstWindowType> = ({pos, asel, closeWindow}) => {
  const {
    startDrag,
    stopDrag,
    amendEntry,
  } = useContext(EdstContext);
  const entry = useAppSelector(state => state.entries[asel.cid]);
  const dispatch = useAppDispatch();

  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const [holdFix, setHoldFix] = useState<string | null>(null);
  const [legLength, setLegLength] = useState<string | number | null>(null);
  const [holdDirection, setHoldDirection] = useState<string | null>(null);
  const [turns, setTurns] = useState<string | null>(null);
  const [efc, setEfc] = useState(utcMinutes);
  const [routeData, setRouteData] = useState<Array<any> | null>(null);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  const clearedHold = () => {
    if (entry) {
      const holdData = {
        hold_fix: holdFix,
        leg_length: legLength,
        hold_direction: holdDirection,
        turns: turns,
        efc: efc
      };
      amendEntry(entry.cid, {hold_data: holdData});
    }
    closeWindow();
  };

  useEffect(() => {
    const computeCrossingTimes = (routeData: Array<any> = []) => {
      let newRouteData = [];
      const now = new Date();
      const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      const groundspeed = Number(entry.flightplan?.ground_speed);
      if (routeData.length > 0 && groundspeed > 0) {
        let lineData = [[entry.flightplan?.lon, entry.flightplan?.lat]];
        for (let e of routeData) {
          lineData.push(e.pos);
          newRouteData.push({...e, minutesAtFix: utcMinutes + 60 * length(lineString(lineData), {units: 'nauticalmiles'}) / groundspeed});
        }
      }
      return newRouteData;
    };
    const routeData = computeCrossingTimes(entry._route_data);
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    setHoldFix(entry.hold_data?.hold_fix ?? 'PP');
    setLegLength(entry.hold_data?.leg_length ?? 'STD');
    setHoldDirection(entry.hold_data?.hold_direction ?? 'N');
    setTurns(entry.hold_data?.turns ?? 'RT');
    setEfc(entry.hold_data?.efc ?? utcMinutes + 30);
    setRouteData(routeData ?? null);
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
                       title={Tooltips.holdDirection}
                       content="Location"
          />
        </div>
        <div className="options-row">
          <div className="options-col">
            <EdstButton content="Present Position" selected={(!holdFix || holdFix === 'PP')}
                        onMouseDown={() => {
                          const now = new Date();
                          const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
                          setHoldFix('PP');
                          setEfc(utcMinutes + 30);
                        }}>
              Present Position
            </EdstButton>
          </div>
        </div>
        <div className="hold-fix-container">
          {_.range(0, Math.min(routeData?.length || 0, 10)).map(i =>
            <div className="options-row" key={`hold-menu-row-${i}`}>
              {_.range(0,((routeData?.length || 0) / 10 | 0) + 1).map(j => {
                const fixName = routeData?.[Number(i) + Number(j) * 10]?.name;
                const minutesAtFix = routeData?.[Number(i) + Number(j) * 10]?.minutesAtFix;
                return (fixName &&
                  <div className={`options-col hold-col-1 hover ${(holdFix === fixName) ? 'selected' : ''}`}
                       key={`hold-menu-col-${i}-${j}`}
                       onMouseDown={() => {
                         setHoldFix(fixName);
                         setEfc(minutesAtFix + 30);
                       }}
                  >
                    {fixName}
                    <div className="align-right">
                      {("0" + ((minutesAtFix / 60 | 0) % 24)).slice(-2) + ("0" + (minutesAtFix % 60 | 0)).slice(-2)}
                    </div>
                  </div>);
              })}
            </div>)}
        </div>
        <div className="options-row hold-row-1">
          <EdstTooltip className="options-col hold-col-2"
                       content="Direction"
                       title={Tooltips.holdDirection}
          />
          <EdstTooltip className="options-col hold-col-2"
                       content="Turns"
                       title={Tooltips.holdTurns}
          />
          <EdstTooltip className="options-col hold-col-2"
                       content="Leg Lengths"
                       title={Tooltips.holdLegLength}
          />
        </div>
        <div className="options-row hold-row-1">
          <div className="options-col hold-col-3">
            <EdstButton content="NW" className="button-1" selected={holdDirection === 'NW'}
                        onMouseDown={() => setHoldDirection('NW')}
            />
            <EdstButton content="N" className="button-1" selected={holdDirection === 'N'}
                        onMouseDown={() => setHoldDirection('N')}
            />
            <EdstButton content="NE" className="button-1" selected={holdDirection === 'NE'}
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
            <EdstButton content="STD" className="button-2" selected={!legLength || legLength === 'STD'}
                        onMouseDown={() => setLegLength('STD')}
            />
            <EdstButton content="15 NM" className="button-2" selected={!legLength || legLength === 15}
                        onMouseDown={() => setLegLength(15)}
            />
          </div>
        </div>
        <div className="options-row hold-row-1">
          <div className="options-col hold-col-3">
            <EdstButton content="W" className="button-1" selected={holdDirection === 'W'}
                        onMouseDown={() => setHoldDirection('W')}
            />
            <EdstButton className="button-1" disabled={true}/>
            <EdstButton content="E" className="button-1" selected={holdDirection === 'E'}
                        onMouseDown={() => setHoldDirection('E')}
            />
          </div>
          <div className="options-col hold-col-3">
            <EdstButton className="button-1" disabled={true}/>
            <EdstButton className="button-1" disabled={true}/>
          </div>
          <div className="options-col hold-col-3">
            <EdstButton content="5 NM" className="button-2" selected={!legLength || legLength === 5}
                        onMouseDown={() => setLegLength(5)}
            />
            <EdstButton content="20 NM" className="button-2" selected={!legLength || legLength === 20}
                        onMouseDown={() => setLegLength(20)}
            />
          </div>
        </div>
        <div className="options-row hold-row-1">
          <div className="options-col hold-col-3">
            <EdstButton content="SW" className="button-1" selected={holdDirection === 'SW'}
                        onMouseDown={() => setHoldDirection('SW')}
            />
            <EdstButton content="S" className="button-1" selected={holdDirection === 'S'}
                        onMouseDown={() => setHoldDirection('S')}
            />
            <EdstButton content="SE" className="button-1" selected={holdDirection === 'SE'}
                        onMouseDown={() => setHoldDirection('SE')}
            />
          </div>
          <div className="options-col hold-col-3">
            <EdstButton className="button-1" disabled={true}/>
            <EdstButton className="button-1" disabled={true}/>
          </div>
          <div className="options-col hold-col-3">
            <EdstButton content="10 NM" className="button-2" selected={!legLength || legLength === 10}
                        onMouseDown={() => setLegLength(10)}
            />
            <EdstButton content="25 NM" className="button-2" selected={!legLength || legLength === 25}
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
                dispatch(updateEntry({cid: entry.cid, data: {show_hold_info: false}}));
                closeWindow();
              }}
              title={Tooltips.holdDeleteHoldInstr}
            />
          </div>
        </div>
        <div className="options-row hold-row-1">
          <EdstTooltip className="options-col hold-col-2" title={Tooltips.holdEfc}>
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
            <EdstButton content="Delete EFC" onMouseDown={() => setEfc(0)} title={Tooltips.holdDelEfc}/>
          </div>
        </div>
        <div className="options-row bottom">
          <div className="options-col left">
            <EdstButton content="Hold/SPA" disabled={entry?.hold_data}
                        onMouseDown={() => {
                          if (!_.isNumber(entry.spa)) {
                            dispatch(toggleAclSpa(entry.cid));
                          }
                          clearedHold();
                        }}
                        title={Tooltips.holdHoldSpaBtn}
            />
            <EdstButton content="Hold" onMouseDown={clearedHold} disabled={entry?.hold_data}
                        title={Tooltips.holdHoldBtn}/>
            <EdstButton content="Cancel Hold" disabled={!entry?.hold_data}
                        onMouseDown={() => {
                          amendEntry(entry.cid, {hold_data: null});
                          dispatch(updateEntry({cid: entry.cid, data: {show_hold_info: false}}));
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