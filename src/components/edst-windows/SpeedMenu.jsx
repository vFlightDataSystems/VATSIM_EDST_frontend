import {forwardRef, useState, useEffect} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import '../../css/windows/spd-hdg-menu-styles.scss';
import _ from "lodash";

export const SpeedMenu = forwardRef((props, ref) => {
  const [focused, setFocused] = useState(false);
  const [speed, setSpeed] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [sign, setSign] = useState('');
  const [amend, setAmend] = useState(true);
  useEffect(() => {
    setFocused(false);
    setSpeed(280);
    setDeltaY(0);
    setSign('');
    setAmend(true);
  }, [props.data]);

  const {pos, data} = props;

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu speed no-select"
      ref={ref}
      id="speed-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => props.startDrag(event, ref)}
           onMouseUp={(event) => props.stopDrag(event)}
      >
        Speed Information
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {data.callsign} {data.type}/{data.equipment}
        </div>
        <div className="options-row speed-row"
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
        >
          <div className="options-col left"
            // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <button className={`${amend ? 'selected' : ''}`}
                    onMouseDown={() => setAmend(true)}
            >
              Amend
            </button>
          </div>
          <div className={`options-col right ${!amend ? 'selected' : ''}`}
            // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <button className={`${!amend ? 'selected' : ''}`}
                    onMouseDown={() => setAmend(false)}
            >
              Scratchpad
            </button>
          </div>
        </div>
        <div className="options-row"
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
        >
          <div className="options-col">
            Speed:
            <div className="input speed-input">
              <input value={speed} onChange={(e) => setSpeed(e.target.value)}/>
            </div>
          </div>
        </div>
        <div className="spd-hdg-menu-row top-border"/>
        <div className="spd-hdg-menu-row bottom-border">
          KNOTS
          <button className={`button-1 ${sign === '+' ? 'selected' : ''}`}
                  onMouseDown={() => setSign(sign === '+' ? '' : '+')}>
            +
          </button>
          <button className={`button-2 ${sign === '-' ? 'selected' : ''}`}
                  onMouseDown={() => setSign(sign === '-' ? '' : '-')}>
            -
          </button>
          MACH
        </div>
        <div className="spd-hdg-menu-select-container"
             onWheel={(e) => setDeltaY(deltaY + e.deltaY)}
        >
          {_.range(5, -6, -1).map(i => {
            const spd = speed - (deltaY / 100 | 0) * 10 + i * 10;
            const mach = 0.79 - (deltaY / 100 | 0) / 100 + i / 100;
            return <div className="spd-hdg-menu-container-row" key={`speed-menu-${i}`}>
              <div className="spd-hdg-menu-container-col"
                   onMouseDown={() => {
                     props.updateEntry(data.cid, {
                       scratch_spd: {
                         scratchpad: !amend,
                         val: `${(amend && sign === '') ? 'S' : ''}${spd}${sign}`
                       }
                     });
                     props.closeWindow();
                   }}
              >
                {String(spd).padStart(3, '0')}{sign}
              </div>
              <div className="spd-hdg-menu-container-col"
                   onMouseDown={() => {
                     props.updateEntry(data.cid, {
                       scratch_spd: {
                         scratchpad: !amend,
                         val: `${(amend && sign === '') ? 'S' : ''}${spd + 5}${sign}`
                       }
                     });
                     props.closeWindow();
                   }}
              >
                {String(spd + 5).padStart(3, '0')}{sign}
              </div>
              <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-2"
                   onMouseDown={() => {
                     props.updateEntry(data.cid, {
                       scratch_spd: {
                         scratchpad: !amend,
                         val: `M${Number(mach * 100)}${sign}`
                       }
                     });
                     props.closeWindow();
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
              <button onMouseDown={props.closeWindow}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})