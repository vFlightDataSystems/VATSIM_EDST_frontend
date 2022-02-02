import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {AselProps} from "../../interfaces";
import {EdstContext} from "../../contexts/contexts";

interface PlanOptionsProps {
  asel: AselProps;
  pos: { x: number, y: number };
  clearAsel: () => void;
  closeWindow: () => void;
}

export const PlanOptions: React.FC<PlanOptionsProps> = ({asel, pos, ...props}) => {
  const {startDrag, stopDrag, deleteEntry, openMenu, edst_data} = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  const entry = edst_data[asel.cid];
  const dep = asel.window === 'dep';

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu plan no-select"
      ref={ref}
      id="plan-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref)}
           onMouseUp={(event) => stopDrag(event)}
      >
        Plan Options Menu
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {entry.cid} {entry.callsign}
        </div>
        <div className="options-row">
          <div className="options-col hover"
               onMouseDown={() => openMenu(ref.current, 'alt-menu', true)}
          >
            Altitude...
          </div>
        </div>
        {!dep && <div className="options-row">
          <div className="options-col hover"
            // @ts-ignore
               disabled={true}>
            Speed...
          </div>
        </div>}
        <div className="options-row">
          <div className="options-col hover"
               onMouseDown={() => openMenu(ref.current, 'route-menu', true)}
          >
            Route...
          </div>
        </div>
        <div className="options-row">
          <div className="options-col hover"
            // @ts-ignore
               disabled={entry?.previous_route === undefined}
               onMouseDown={() => openMenu(ref.current, 'prev-route-menu', true)}
          >
            Previous Route
          </div>
        </div>
        {!dep && <div className="options-row">
          <div className="options-col hover"
            // @ts-ignore
               disabled={true}>
            Stop Probe...
          </div>
        </div>}
        <div className="options-row">
          <div className="options-col hover"
            // @ts-ignore
               disabled={true}>
            Trial {dep ? 'Departure' : 'Restrictions'}...
          </div>
        </div>
        {!dep && <div className="options-row">
          <div className="options-col hover">
            Plans
          </div>
        </div>}
        <div className="options-row">
          <div className="options-col hover">
            Keep
          </div>
        </div>
        <div className="options-row">
          <div className="options-col hover"
               onMouseDown={() => {
                 deleteEntry(dep ? 'dep' : 'acl', asel?.cid);
                 props.clearAsel();
                 props.closeWindow();
               }}
          >
            Delete
          </div>
        </div>
        <div className="options-row bottom">
          <div className="options-col right">
            <EdstButton content="Exit" onMouseDown={props.closeWindow}/>
          </div>
        </div>
      </div>
    </div>
  );
};