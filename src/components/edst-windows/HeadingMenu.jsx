import {useState, useEffect, forwardRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import '../../css/windows/spd-hdg-menu-styles.scss';
import _ from "lodash";

export const HeadingMenu = forwardRef((props, ref) => {
  const [focused, setFocused] = useState(false);
  const [heading, setHeading] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [amend, setAmend] = useState(true);
  useEffect(() => {
    setFocused(false);
    setHeading(280);
    setDeltaY(0);
    setAmend(true);
  }, [props.data]);

  const {pos, data} = props;

  return (<div
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
    className="options-menu heading no-select"
    ref={ref}
    id="heading-menu"
    style={{left: pos.x, top: pos.y}}
  >
    <div className={`options-menu-header ${focused ? 'focused' : ''}`}
         onMouseDown={(event) => props.startDrag(event, ref)}
         onMouseUp={(event) => props.stopDrag(event)}
    >
      Heading Information
    </div>
    <div className="options-body">
      <div className="options-row fid">
        {data.callsign} {data.type}/{data.equipment}
      </div>
      <div className="options-row speed-row"
        // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
      >
        <div className="options-col"
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
                  onMouseDown={() => setAmend(true)}
          >
            Scratchpad
          </button>
        </div>
      </div>
      <div className="options-row"
        // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
      >
        <div className="options-col">
          Heading:
          <div className="input speed-input">
            <input value={heading} onChange={(e) => setHeading(e.target.value)}/>
          </div>
        </div>
      </div>
      <div className="spd-hdg-menu-row top-border">
        <div className="hdg-col-1">
          Heading
        </div>
        <div className="hdg-col-1">
          Turn
        </div>
      </div>
      <div className="spd-hdg-menu-row bottom-border">
        <div className="hdg-col-2">
          L &nbsp;&nbsp;R
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
                 onMouseDown={() => {
                   props.updateEntry(data.cid, {
                     scratch_hdg: {
                       scratchpad: !amend,
                       val: `${amend ? 'H' : ''}${hdg}`
                     }
                   });
                   props.closeWindow();
                 }}
            >
              {String(hdg).padStart(3, '0')}
            </div>
            <div className="spd-hdg-menu-container-col"
                 onMouseDown={() => {
                   props.updateEntry(data.cid, {
                     scratch_hdg: {
                       scratchpad: !amend,
                       val: `${amend ? 'H' : ''}${hdg + 5}`
                     }
                   });
                   props.closeWindow();
                 }}
            >
              {String(hdg + 5).padStart(3, '0')}
            </div>
            <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-3"
                 onMouseDown={() => {
                   props.updateEntry(data.cid, {scratch_hdg: {scratchpad: !amend, val: `${rel_hdg}L`}});
                   props.closeWindow();
                 }}
            >
              {rel_hdg}
            </div>
            <div className="spd-hdg-menu-container-col spd-hdg-menu-container-col-3"
                 onMouseDown={() => {
                   props.updateEntry(data.cid, {scratch_hdg: {scratchpad: !amend, val: `${rel_hdg}R`}});
                   props.closeWindow();
                 }}
            >
              {rel_hdg}
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
  </div>);
})