import * as React from 'react';
import '../../../css/windows/titlebar-styles.scss';
import '../../../css/header-styles.scss';
import {WindowTitleBar} from "../WindowTitleBar";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";

export const PlansDisplayHeader = (props) => {
  const {focused, asel, plan_data} = props;
  const interim_disabled = asel ? !Object.keys(plan_data.plan_data ?? {}).includes('altitude') : true;

  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={props.closeWindow}
      text={['Plans Display']}
    />
    <div className="no-select">
      <EdstWindowHeaderButton disabled={asel === null}
                              onMouseDown={(e) => props.openMenu(e.target, 'plan-menu')}
                              content="Plan Options..."
                              title={Tooltips.plan_options}
      />
      <EdstWindowHeaderButton disabled={true} content="Show"/>
      <EdstWindowHeaderButton disabled={true} content="Show ALL"/>
      <EdstWindowHeaderButton disabled={asel === null} content="Amend"
                              onMouseDown={() => props.amendEntry(asel.cid, plan_data.plan_data)}
                              title={Tooltips.plans_amend}
      />
      <EdstWindowHeaderButton disabled={interim_disabled} content="Interim"
                              onMouseDown={() => {
                                const interim_plan_data = {interim: plan_data.plan_data.altitude};
                                props.amendEntry(asel.cid, interim_plan_data);
                              }}
                              title={Tooltips.plans_interim}
      />
      <EdstWindowHeaderButton disabled={true} content="Tools..."/>
      <EdstWindowHeaderButton
        onMouseDown={(e) => props.openMenu(e.target, 'template-menu')}
        content="Template..."
        title={Tooltips.template}
      />
      <EdstWindowHeaderButton disabled={true} content="ICAO"/>
      <EdstWindowHeaderButton
        onMouseDown={() => {
          props.cleanup();
          props.closeWindow();
        }}
        content="Clean Up"
        title={Tooltips.plans_clean_up}
      />
    </div>
  </div>);
}