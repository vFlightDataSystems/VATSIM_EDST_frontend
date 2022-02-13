import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {AselType} from "../../types";
import {EdstContext} from "../../contexts/contexts";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {useAppSelector} from "../../redux/hooks";

interface PlanOptionsProps {
  asel: AselType;
  pos: { x: number, y: number };
  clearAsel: () => void;
  closeWindow: () => void;
}

export const PlanOptions: React.FC<PlanOptionsProps> = ({asel, pos, ...props}) => {
  const {startDrag, stopDrag, deleteEntry, openMenu} = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  const entry = useAppSelector(state => state.entries[asel.cid]);
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
          <EdstTooltip
            className="options-col hover"
            content="Altitude..."
            title={Tooltips.planOptionsAlt}
            onMouseDown={() => openMenu(ref.current, 'alt-menu', true)}
          />
        </div>
        {!dep && <div className="options-row">
          <EdstTooltip
            className="options-col hover"
            content="Speed..."
            title={Tooltips.planOptionsSpeed} // @ts-ignore
            disabled={true}
          />
        </div>}
        <div className="options-row">
          <EdstTooltip
            className="options-col hover"
            content="Route..."
            title={Tooltips.planOptionsRoute}
            onMouseDown={() => openMenu(ref.current, 'route-menu', true)}
          />
        </div>
        <div className="options-row">
          <EdstTooltip
            className="options-col hover"
            content="Previous Route"
            title={Tooltips.planOptionsPrevRoute} // @ts-ignore
            disabled={entry?.previous_route === undefined}
            onMouseDown={() => openMenu(ref.current, 'prev-route-menu', true)}
          />
        </div>
        {!dep && <div className="options-row">
          <EdstTooltip
            className="options-col hover"
            content="Stop Probe..."
            title={Tooltips.planOptionsStopProbe} // @ts-ignore
            disabled={true}
          />
        </div>}
        <div className="options-row">
          <EdstTooltip
            className="options-col hover"
            content={`Trial ${dep ? 'Departure' : 'Restrictions'}...`}
            title={Tooltips.planOptionsTrialRestr} // @ts-ignore
            disabled={true}
          />
        </div>
        {!dep && <div className="options-row">
          <EdstTooltip
            className="options-col hover"
            content="Plans"
            title={Tooltips.planOptionsPlans}
          />
        </div>}
        <div className="options-row">
          <EdstTooltip
            className="options-col hover"
            content="Keep"
            title={Tooltips.planOptionsKeep}
          />
        </div>
        <div className="options-row">
          <EdstTooltip
            className="options-col hover"
            content="Delete"
            title={Tooltips.planOptionsDelete}
            onMouseDown={() => {
              deleteEntry(dep ? 'dep' : 'acl', asel?.cid);
              props.clearAsel();
              props.closeWindow();
            }}
          />
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