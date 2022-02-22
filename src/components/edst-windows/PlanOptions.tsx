import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {EdstContext} from "../../contexts/contexts";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {windowEnum} from "../../enums";
import {openWindowThunk} from "../../redux/thunks";
import {aselSelector, AselType, closeWindow, setAsel, windowPositionSelector} from "../../redux/slices/appSlice";
import {deleteAclEntry, deleteDepEntry} from "../../redux/slices/entriesSlice";

export const PlanOptions: React.FC = () => {
  const dispatch = useAppDispatch();
  const asel = useAppSelector(aselSelector) as AselType;
  const pos = useAppSelector(windowPositionSelector(windowEnum.planOptions));
  const {startDrag, stopDrag} = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  const entry = useAppSelector(state => state.entries[asel.cid]);
  const dep = asel.window === windowEnum.dep;

  return pos && (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu plan no-select"
      ref={ref}
      id="plan-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, windowEnum.planOptions)}
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
            onMouseDown={() => dispatch(openWindowThunk(windowEnum.altitudeMenu, ref.current, windowEnum.planOptions, true))}
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
            onMouseDown={() => dispatch(openWindowThunk(windowEnum.routeMenu, ref.current, windowEnum.planOptions, true))}
          />
        </div>
        <div className="options-row">
          <EdstTooltip
            className="options-col hover"
            content="Previous Route"
            title={Tooltips.planOptionsPrevRoute} // @ts-ignore
            disabled={entry?.previous_route === undefined}
            onMouseDown={() => dispatch(openWindowThunk(windowEnum.prevRouteMenu, ref.current, windowEnum.planOptions, true))}
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

              dispatch(asel.window === windowEnum.acl ? deleteAclEntry(asel.cid) : deleteDepEntry(asel.cid));
              dispatch(setAsel(null));
              dispatch(closeWindow(windowEnum.planOptions));
            }}
          />
        </div>
        <div className="options-row bottom">
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit" onMouseDown={() => dispatch(closeWindow(windowEnum.planOptions))}/>
          </div>
        </div>
      </div>
    </div>
  );
};