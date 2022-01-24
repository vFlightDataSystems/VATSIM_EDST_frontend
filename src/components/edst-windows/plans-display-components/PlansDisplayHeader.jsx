import React from 'react';
import '../../../css/windows/titlebar-styles.scss';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";
import {EdstHeaderButton} from "../../resources/EdstButton";

export default function PlansDisplayHeader(props) {
  const {focused, asel, plan_data} = props;
  const interim_disabled = asel ? !Object.keys(plan_data.plan_data ?? {}).includes('altitude') : true;

  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={props.closeWindow}
      text={['Plans Display']}
    />
    <div className="no-select">
      <EdstHeaderButton disabled={asel === null}
                        onMouseDown={(e) => props.openMenu(e.target, 'plan-menu')}
                        content="Plan Options..."
      />
      <EdstHeaderButton disabled={true} content="Show"/>
      <EdstHeaderButton disabled={true} content="Show ALL"/>
      <EdstHeaderButton disabled={asel === null} content="Amend"
                        onMouseDown={() => props.amendEntry(asel.cid, plan_data.plan_data)}
      />
      <EdstHeaderButton disabled={interim_disabled} content="Interim"
                        onMouseDown={() => {
                          const interim_plan_data = {interim: plan_data.plan_data.altitude};
                          props.amendEntry(asel.cid, interim_plan_data);
                        }}
      />
      <EdstHeaderButton disabled={true} content="Tools..."/>
      <EdstHeaderButton
        onMouseDown={(e) => props.openMenu(e.target, 'template-menu')}
        content="Template..."
      />
      <EdstHeaderButton disabled={true} content="ICAO"/>
      <EdstHeaderButton
        onMouseDown={() => {
          props.cleanup();
          props.closeWindow();
        }}
        content="Clean Up"
      />
    </div>
  </div>);
}