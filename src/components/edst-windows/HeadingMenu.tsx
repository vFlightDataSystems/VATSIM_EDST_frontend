import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import '../../css/windows/spd-hdg-menu-styles.scss';
import _ from "lodash";
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstTooltip} from "../resources/EdstTooltip";
import {EdstContext} from "../../contexts/contexts";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {menuEnum} from "../../enums";
import {
  aselSelector,
  AselType, closeMenu,
  menuPositionSelector
} from "../../redux/slices/appSlice";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {LocalEdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";

export const HeadingMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const asel = useAppSelector(aselSelector) as AselType;
  const entry = useAppSelector(aselEntrySelector) as LocalEdstEntryType;
  const pos = useAppSelector(menuPositionSelector(menuEnum.headingMenu));
  const dispatch = useAppDispatch();

  const [focused, setFocused] = useState(false);
  const [heading, setHeading] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [amend, setAmend] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    setFocused(false);
    setHeading(280);
    setDeltaY(0);
    setAmend(true);
  }, [asel]);

  const handleMouseDown = (event: React.MouseEvent, value: number, direction: string | null = null) => {
    const valueStr = direction === null ? `${amend ? 'H' : ''}${value}`
      : `${value}${direction}`;

    switch (event.button) {
      case 0:
        dispatch(amendEntryThunk({cid: entry.cid, planData: {
          [amend ? 'hdg' : 'scratch_hdg']: valueStr,
          [!amend ? 'hdg' : 'scratch_hdg']: null
        }}));
        break;
      case 1:
        dispatch(amendEntryThunk({cid: entry.cid, planData: {
          [amend ? 'hdg' : 'scratch_hdg']: valueStr
        }}));
        break;
      default:
        break;
    }
    dispatch(closeMenu(menuEnum.headingMenu));
  };

  return pos && entry && (<div
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
    className="options-menu heading no-select"
    ref={ref}
    id="heading-menu"
    style={{left: pos.x, top: pos.y}}
  >
    <div className={`options-menu-header ${focused ? 'focused' : ''}`}
         onMouseDown={(event) => startDrag(event, ref, menuEnum.headingMenu)}
         onMouseUp={(event) => stopDrag(event)}
    >
      Heading Information
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
                      title={Tooltips.aclHdgAmend}
          />
        </div>
        <div className={`options-col right ${!amend ? 'selected' : ''}`}
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
        >
          <EdstButton content="Scratchpad" selected={!amend}
                      onMouseDown={() => setAmend(false)}
                      title={Tooltips.aclHdgScratchpad}
          />
        </div>
      </div>
      <div className="options-row">
        <div className="options-col">
          Heading:
          <div className="input speed-input">
            <input value={heading} onChange={(e) => setHeading(Number(e.target.value))}/>
          </div>
        </div>
      </div>
      <div className="spd-hdg-menu-row top-border">
        <EdstTooltip className="hdg-col-1" content="Heading" title={Tooltips.aclHdgHdg}/>
        <EdstTooltip className="hdg-col-1" content="Turn" title={Tooltips.aclHdgTurn}/>
      </div>
      <div className="spd-hdg-menu-row bottom-border">
        <div className="hdg-col-2">
          L &nbsp;&nbsp; R
        </div>
      </div>
      <div className="spd-hdg-menu-select-container"
           onWheel={(e) => setDeltaY(deltaY + e.deltaY)}
      >
        {_.range(50, -70, -10).map(i => {
          const centerHdg = ((heading - (deltaY / 100 | 0) * 10 + i) % 360 + 360) % 360;
          const centerRelHdg = 35 + i / 2;
          return <div className="spd-hdg-menu-container-row" key={`heading-menu-${i}`}>
            <div className="spd-hdg-menu-container-col"
                 onMouseDown={(e) => handleMouseDown(e, centerHdg)}
            >
              {String(centerHdg).padStart(3, '0')}
            </div>
            <div className="spd-hdg-menu-container-col"
                 onMouseDown={(e) => handleMouseDown(e, centerHdg + 5)}
            >
              {String(centerHdg + 5).padStart(3, '0')}
            </div>
            <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-3"
                 onMouseDown={(e) => handleMouseDown(e, centerRelHdg, 'L')}
            >
              {centerRelHdg}
            </div>
            <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-3"
                 onMouseDown={(e) => handleMouseDown(e, centerRelHdg, 'R')}
            >
              {centerRelHdg}
            </div>
          </div>;
        })}
        <div className="options-row present-headging-row">
          <EdstButton content="Present Heading" onMouseDown={(event) => {
            switch (event.button) {
              case 0:
                dispatch(amendEntryThunk({cid: entry.cid, planData: {
                  [amend ? 'hdg' : 'scratch_hdg']: 'PH',
                  [!amend ? 'hdg' : 'scratch_hdg']: null
                }}));
                break;
              case 1:
                dispatch(amendEntryThunk({cid: entry.cid, planData: {
                  [amend ? 'hdg' : 'scratch_hdg']: 'PH'
                }}));
                break;
              default:
                break;
            }
            dispatch(closeMenu(menuEnum.headingMenu));
          }}/>
        </div>
        <div className="options-row bottom">
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.headingMenu))}/>
          </div>
        </div>
      </div>
    </div>
  </div>);
}