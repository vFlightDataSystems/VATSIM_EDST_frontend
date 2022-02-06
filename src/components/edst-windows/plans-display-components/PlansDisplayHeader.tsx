import '../../../css/windows/titlebar-styles.scss';
import '../../../css/header-styles.scss';
import {WindowTitleBar} from "../WindowTitleBar";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import React, {useContext} from "react";
import {AselProps} from "../../../interfaces";
import {EdstContext} from "../../../contexts/contexts";

interface PlansDisplayHeaderProps {
  cleanup: () => void;
  plan_data: any;
  asel: AselProps | null;
  focused: boolean;
  closeWindow: () => void;
}

export const PlansDisplayHeader: React.FC<PlansDisplayHeaderProps> = ({focused, asel, plan_data, ...props}) => {
  const {openMenu, amendEntry} = useContext(EdstContext);
  const interim_disabled = asel ? !Object.keys(plan_data.plan_data ?? {}).includes('altitude') : true;

  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={props.closeWindow}
      text={['Plans Display']}
    />
    <div className="no-select">
      <EdstWindowHeaderButton disabled={asel === null}
                              onMouseDown={(e: React.MouseEvent) => openMenu(e.target, 'plan-menu')}
                              content="Plan Options..."
                              title={Tooltips.plan_options}
      />
      <EdstWindowHeaderButton disabled={true} content="Show"/>
      <EdstWindowHeaderButton disabled={true} content="Show ALL"/>
      <EdstWindowHeaderButton disabled={asel === null} content="Amend"
                              onMouseDown={() => asel && amendEntry(asel.cid, plan_data.plan_data)}
                              title={Tooltips.plans_amend}
      />
      <EdstWindowHeaderButton disabled={interim_disabled} content="Interim"
                              onMouseDown={() => {
                                if (asel) {
                                  const interim_plan_data = {interim: plan_data.plan_data.altitude};
                                  amendEntry(asel.cid, interim_plan_data);
                                }
                              }}
                              // title={Tooltips.plans_interim}
      />
      <EdstWindowHeaderButton disabled={true} content="Tools..."/>
      <EdstWindowHeaderButton
        onMouseDown={(e: React.MouseEvent) => openMenu(e.currentTarget, 'template-menu')}
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
};