import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import '../../css/windows/spd-hdg-menu-styles.scss';
import _ from "lodash";
import {EdstContext} from "../../contexts/contexts";
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstTooltip} from "../resources/EdstTooltip";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {windowEnum} from "../../enums";
import {aselSelector, AselType, closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {EdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/asyncThunks";

enum signEnum {
  more = '+',
  less = '-',
  none = ''
}

export const SpeedMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const asel = useAppSelector(aselSelector) as AselType;
  const entry = useAppSelector(aselEntrySelector) as EdstEntryType;
  const pos = useAppSelector(windowPositionSelector(windowEnum.speedMenu));
  const dispatch = useAppDispatch();
  const [focused, setFocused] = useState(false);
  const [speed, setSpeed] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [sign, setSign] = useState<signEnum>(signEnum.none);
  const [amend, setAmend] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    setFocused(false);
    setSpeed(280);
    setDeltaY(0);
    setSign(signEnum.none);
    setAmend(true);
  }, [asel.cid]);

  const handleScroll = (e: React.WheelEvent) => {
    const newDeltaY = Math.min(Math.max((speed - 400)*10, deltaY + e.deltaY), (speed - 160)*10);
    setDeltaY(newDeltaY);
  };

  const handleMouseDown = (event: any, value: number, mach = false) => {
    event.preventDefault();
    const valueStr = !mach ? `${(amend && sign === signEnum.none) ? 'S' : ''}${value}${sign}`
      : `M${Number(value*100) | 0}${sign}`;
    switch (event.button) {
      case 0:
        dispatch(amendEntryThunk({
          cid: entry.cid, planData: {
            [amend ? 'spd' : 'scratch_spd']: valueStr,
            [!amend ? 'spd' : 'scratch_spd']: null
          }
        }));
        break;
      case 1:
        dispatch(amendEntryThunk({
          cid: entry.cid, planData: {
            [amend ? 'spd' : 'scratch_spd']: valueStr
          }
        }));
        break;
      default:
        break;
    }
    dispatch(closeWindow(windowEnum.speedMenu));
  };

  return pos && entry && (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu speed no-select"
      ref={ref}
      id="speed-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, windowEnum.speedMenu)}
           onMouseUp={(event) => stopDrag(event)}
      >
        Speed Information
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {entry.callsign} {entry.type}/{entry.equipment}
        </div>
        <div className="options-row speed-row"
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
        >
          <div className="options-col"
            // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <EdstButton content="Amend" selected={amend}
                        onMouseDown={() => setAmend(true)}
                        title={Tooltips.aclSpdAmend}
            />
          </div>
          <div className={`options-col right ${!amend ? 'selected' : ''}`}
            // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <EdstButton content="Scratchpad" selected={!amend}
                        onMouseDown={() => setAmend(false)}
                        title={Tooltips.aclSpdScratchpad}
            />
          </div>
        </div>
        <div className="options-row"
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
        >
          <div className="options-col">
            Speed:
            <div className="input speed-input">
              <input value={speed} onChange={(e) => setSpeed(Number(e.target.value))}/>
            </div>
          </div>
        </div>
        <div className="spd-hdg-menu-row top-border"/>
        <div className="spd-hdg-menu-row bottom-border">
          <EdstTooltip content="KNOTS" title={Tooltips.aclSpdKnots}/>
          <EdstButton content="+" className="button-1" selected={sign === signEnum.more}
                      onMouseDown={() => setSign(sign === signEnum.more ? signEnum.none : signEnum.more)}
          />
          <EdstButton content="-" className="button-2" selected={sign === signEnum.less}
                      onMouseDown={() => setSign(sign === signEnum.less ? signEnum.none : signEnum.less)}
          />
          <EdstTooltip content="MACH" title={Tooltips.aclSpdMach}/>
        </div>
        <div className="spd-hdg-menu-select-container"
             onWheel={handleScroll}
        >
          {_.range(5, -6, -1).map(i => {
            const centerSpd = speed - (deltaY/100 | 0)*10 + i*10;
            const centerMach = 0.79 - (deltaY/100 | 0)/100 + i/100;
            return <div className="spd-hdg-menu-container-row" key={`speed-menu-${i}`}>
              <div className="spd-hdg-menu-container-col"
                   onMouseDown={(e) => handleMouseDown(e, centerSpd)}
              >
                {String(centerSpd).padStart(3, '0')}{sign}
              </div>
              <div className="spd-hdg-menu-container-col"
                   onMouseDown={(e) => handleMouseDown(e, centerSpd + 5)}
              >
                {String(centerSpd + 5).padStart(3, '0')}{sign}
              </div>
              <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-2"
                   onMouseDown={(e) => handleMouseDown(e, centerMach, true)}>
                {String(centerMach.toFixed(2)).slice(1)}{sign}
              </div>
            </div>;
          })}
          <div className="options-row bottom">
            <div className="options-col right">
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(windowEnum.speedMenu))}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};