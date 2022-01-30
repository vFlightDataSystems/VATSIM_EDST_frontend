import React, {useState, useEffect, useRef, useContext, FunctionComponent} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import '../../css/windows/spd-hdg-menu-styles.scss';
import _ from "lodash";
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstTooltip} from "../resources/EdstTooltip";
import {EdstContext} from "../../contexts/contexts";
import {EdstWindowProps} from "../../interfaces";

export const HeadingMenu: FunctionComponent<EdstWindowProps> = ({asel, pos, ...props} ) => {
  const {
    edst_data,
    startDrag,
    stopDrag,
    amendEntry
  } = useContext(EdstContext);
  let entry = edst_data[asel.cid];

  const [focused, setFocused] = useState(false);
  const [heading, setHeading] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [amend, setAmend] = useState(true);
  useEffect(() => {
    setFocused(false);
    setHeading(280);
    setDeltaY(0);
    setAmend(true);
  }, [asel]);
  const ref = useRef(null);

  const handleMouseDown = (event: React.MouseEvent, value: number, direction: string | null = null) => {
    const value_str = direction === null ? `${amend ? 'H' : ''}${value}`
      : `${value}${direction}`;

    switch (event.button) {
      case 0:
        amendEntry(entry.cid, {
          [amend ? 'hdg' : 'scratch_hdg']: value_str,
          [!amend ? 'hdg' : 'scratch_hdg']: null
        });
        break;
      case 1:
        amendEntry(entry.cid, {
          [amend ? 'hdg' : 'scratch_hdg']: value_str
        });
        break;
      default:
        break;
    }
    props.closeWindow();
  };

  return (<div
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
    className="options-menu heading no-select"
    ref={ref}
    id="heading-menu"
    style={{left: pos.x, top: pos.y}}
  >
    <div className={`options-menu-header ${focused ? 'focused' : ''}`}
         onMouseDown={(event) => startDrag(event, ref)}
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
                      title={Tooltips.acl_hdg_amend}
          />
        </div>
        <div className={`options-col right ${!amend ? 'selected' : ''}`}
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
        >
          <EdstButton content="Scratchpad" selected={!amend}
                      onMouseDown={() => setAmend(false)}
                      title={Tooltips.acl_hdg_scratchpad}
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
        <EdstTooltip className="hdg-col-1" content="Heading" title={Tooltips.acl_hdg_hdg}/>
        <EdstTooltip className="hdg-col-1" content="Turn" title={Tooltips.acl_hdg_turn}/>
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
          const hdg = ((heading - (deltaY / 100 | 0) * 10 + i) % 360 + 360) % 360;
          const rel_hdg = 35 + i / 2;
          return <div className="spd-hdg-menu-container-row" key={`heading-menu-${i}`}>
            <div className="spd-hdg-menu-container-col"
                 onMouseDown={(e) => handleMouseDown(e, hdg)}
            >
              {String(hdg).padStart(3, '0')}
            </div>
            <div className="spd-hdg-menu-container-col"
                 onMouseDown={(e) => handleMouseDown(e, hdg + 5)}
            >
              {String(hdg + 5).padStart(3, '0')}
            </div>
            <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-3"
                 onMouseDown={(e) => handleMouseDown(e, rel_hdg, 'L')}
            >
              {rel_hdg}
            </div>
            <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-3"
                 onMouseDown={(e) => handleMouseDown(e, rel_hdg, 'R')}
            >
              {rel_hdg}
            </div>
          </div>;
        })}
        <div className="options-row present-headging-row">
          <EdstButton content="Present Heading" onMouseDown={(event) => {
            switch (event.button) {
              case 0:
                amendEntry(entry.cid, {
                  [amend ? 'hdg' : 'scratch_hdg']: 'PH',
                  [!amend ? 'hdg' : 'scratch_hdg']: null
                });
                break;
              case 1:
                amendEntry(entry.cid, {
                  [amend ? 'hdg' : 'scratch_hdg']: 'PH'
                });
                break;
              default:
                break;
            }
            props.closeWindow();
          }}/>
        </div>
        <div className="options-row bottom">
          <div className="options-col right">
            <EdstButton content="Exit" onMouseDown={props.closeWindow}/>
          </div>
        </div>
      </div>
    </div>
  </div>);
}