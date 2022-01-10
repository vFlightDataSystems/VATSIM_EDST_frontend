import React from 'react';
import '../../../css/windows/titlebar-styles.scss';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";

export default function PlansDisplayHeader(props) {
  const {focused, asel, plan_data} = props;
  const interim_disabled = asel ? !Object.keys(plan_data.plan_data || {}).includes('altitude') : true;

  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={props.closeWindow}
      text={['Plans Display']}
    />
    <div className="no-select">
      <div className="outer-button" disabled={asel === null}
           onMouseDown={(e) => props.openMenu(e.target, 'plan-menu')}>
        <div className="edst-window-button"
             disabled={asel === null}>
          Plan Options...
        </div>
      </div>
      <div className="outer-button" disabled={true}>
        <div className="edst-window-button" disabled={true}>
          Show
        </div>
      </div>
      <div className="outer-button" disabled={true}>
        <div className="edst-window-button" disabled={true}>
          Show All
        </div>
      </div>
      <div className="outer-button" disabled={asel === null}>
        <div className="edst-window-button" disabled={asel === null}
             onMouseDown={() => props.amendEntry(asel.cid, plan_data.plan_data)}
        >
          Amend
        </div>
      </div>
      <div className="outer-button" disabled={interim_disabled}>
        <div className="edst-window-button" disabled={interim_disabled}
             onMouseDown={() => {
               const interim_plan_data = {interim: plan_data.plan_data.altitude};
               props.amendEntry(asel.cid, interim_plan_data);
             }}
        >
          Interim
        </div>
      </div>
      <div className="outer-button" disabled={true}>
        <div className="edst-window-button" disabled={true}>
          Tools...
        </div>
      </div>
      <div className="outer-button">
        <div className="edst-window-button">
          Template...
        </div>
      </div>
      <div className="outer-button" disabled={true}>
        <div className="edst-window-button" disabled={true}>
          ICAO
        </div>
      </div>
      <div className="outer-button">
        <div className="edst-window-button"
             onMouseDown={() => {
               props.cleanup();
               props.closeWindow();
             }}
        >
          Clean Up
        </div>
      </div>
    </div>
  </div>);
}