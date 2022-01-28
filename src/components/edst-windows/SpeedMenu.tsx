import {useState, useEffect, useRef, useContext} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import '../../css/windows/spd-hdg-menu-styles.scss';
import _ from "lodash";
import {EdstContext} from "../../contexts/contexts";
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstTooltip} from "../resources/EdstTooltip";

export function SpeedMenu(props) {
  const {
    edst_data,
    asel,
    startDrag,
    stopDrag,
    amendEntry
  } = useContext(EdstContext);
  const {pos} = props;
  const [focused, setFocused] = useState(false);
  const [speed, setSpeed] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [sign, setSign] = useState('');
  const [amend, setAmend] = useState(true);
  const ref = useRef(null);
  useEffect(() => {
    setFocused(false);
    setSpeed(280);
    setDeltaY(0);
    setSign('');
    setAmend(true);
  }, [asel]);
  const entry = edst_data[asel.cid];

  const handleScroll = (e) => {
    const new_deltaY = Math.min(Math.max((speed - 400) * 10, deltaY + e.deltaY), (speed - 160) * 10);
    setDeltaY(new_deltaY);
  }

  const handleMouseDown = (event: any, value: number, mach = false) => {
    event.preventDefault();
    const value_str = !mach ? `${(amend && sign === '') ? 'S' : ''}${value}${sign}`
      : `M${Number(value * 100) | 0}${sign}`;
    switch (event.button) {
      case 0:
        amendEntry(entry.cid, {
          [amend ? 'spd' : 'scratch_spd']: value_str,
          [!amend ? 'spd' : 'scratch_spd']: null
        });
        break;
      case 1:
        amendEntry(entry.cid, {
          [amend ? 'spd' : 'scratch_spd']: value_str
        });
        break;
      default:
        break;
    }
    props.closeWindow();
  }

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu speed no-select"
      ref={ref}
      id="speed-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref)}
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
                        title={Tooltips.acl_spd_amend}
            />
          </div>
          <div className={`options-col right ${!amend ? 'selected' : ''}`}
            // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <EdstButton content="Scratchpad" selected={!amend}
                        onMouseDown={() => setAmend(false)}
                        title={Tooltips.acl_spd_scratchpad}
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
          <EdstTooltip content="KNOTS" title={Tooltips.acl_spd_knots}/>
          <EdstButton content="+" className="button-1" selected={sign === '+'}
                      onMouseDown={() => setSign(sign === '+' ? '' : '+')}
          />
          <EdstButton content="-" className="button-2" selected={sign === '-'}
                      onMouseDown={() => setSign(sign === '-' ? '' : '-')}
          />
          <EdstTooltip content="MACH" title={Tooltips.acl_spd_mach}/>
        </div>
        <div className="spd-hdg-menu-select-container"
             onWheel={handleScroll}
        >
          {_.range(5, -6, -1).map(i => {
            const spd = speed - (deltaY / 100 | 0) * 10 + i * 10;
            const mach = 0.79 - (deltaY / 100 | 0) / 100 + i / 100;
            return <div className="spd-hdg-menu-container-row" key={`speed-menu-${i}`}>
              <div className="spd-hdg-menu-container-col"
                   onMouseDown={(e) => handleMouseDown(e, spd)}
              >
                {String(spd).padStart(3, '0')}{sign}
              </div>
              <div className="spd-hdg-menu-container-col"
                   onMouseDown={(e) => handleMouseDown(e, spd + 5)}
              >
                {String(spd + 5).padStart(3, '0')}{sign}
              </div>
              <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-2"
                   onMouseDown={(e) => handleMouseDown(e, mach, true)}>
                {String(mach.toFixed(2)).slice(1)}{sign}
              </div>
            </div>;
          })}
          <div className="options-row bottom">
            <div className="options-col right">
              <EdstButton content="Exit" onMouseDown={props.closeWindow}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}