import React, {useContext, useRef, useState} from "react";
import {EdstContext} from "../../../contexts/contexts";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {closeMenu, menuPositionSelector} from "../../../redux/slices/appSlice";
import {aselEntrySelector} from "../../../redux/slices/entriesSlice";
import {menuEnum} from "../../../enums";
import {EdstButton} from "../../resources/EdstButton";
import {EquipmentNavTemplate} from "./EquipmentNavTemplate";
import {EquipmentSurvTemplate} from "./EquipmentSurvTemplate";
import {EquipmentCommTemplate} from "./EquipmentCommTemplate";
import {EquipmentAppServTemplate} from "./EquipmentAppServTemplate";
import {Tooltips} from "../../../tooltips";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {useFocused} from "../../../hooks";

enum menuOptions {
  surv,
  nav,
  comm,
  appServ
}

export type EquipmentTemplateRowProps = {
  rowClassName?: string
  buttonClassName?: string,
  buttonText: string,
  selected: boolean,
  tooltip: string,
  text?: string,
  key?: string,
  toggleSelect: () => void
};

export const EquipmentTemplateRow: React.FC<EquipmentTemplateRowProps> = (props) => {
  return <div className={`eqp-template-row ${props.rowClassName ?? ''}`} key={props.key}>
    <EdstTooltip className="eqp-content-col btn"
                 title={props.tooltip}
                 onMouseDown={props.toggleSelect}
    >
      <div className={`button-indicator ${props.buttonClassName ?? ''} ${props.selected ? 'selected' : ''}`}/>
      {props.buttonText}
    </EdstTooltip>
    {props.text ?? ''}
  </div>;
}

export const EquipmentTemplateMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const dispatch = useAppDispatch();
  const pos = useAppSelector(menuPositionSelector(menuEnum.equipmentTemplateMenu));
  const entry = useAppSelector(aselEntrySelector);
  const [selectedMenu, setSelectedMenu] = useState<menuOptions>(menuOptions.nav);

  const ref = useRef(null);
  const focused = useFocused(ref);

  return pos && (<div
      className="options-menu equipment-template no-select"
      ref={ref}
      id="equipment-template-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, menuEnum.equipmentTemplateMenu)}
           onMouseUp={(event) => stopDrag(event)}
      >
        Equipment Template
      </div>
      <div className="options-body eqp-template-body">
        <div className="options-row fid">
          {entry && `${entry.callsign} ${entry.type}/${entry.equipment}`}
        </div>
        <div className="options-row eqp-template-row">
          <div className="eqp-template-header-col">
            <EdstButton className={selectedMenu === menuOptions.surv ? 'selected' : ''}
                        content="SURV"
                        onMouseDown={() => setSelectedMenu(menuOptions.surv)}
                        title={Tooltips.equipmentTemplateMenuSurv}
            />
            <EdstButton className={selectedMenu === menuOptions.nav ? 'selected' : ''}
                        content="NAV"
                        onMouseDown={() => setSelectedMenu(menuOptions.nav)}
                        title={Tooltips.equipmentTemplateMenuNAV}
            />
            <EdstButton className={selectedMenu === menuOptions.comm ? 'selected' : ''}
                        content="COMM"
                        onMouseDown={() => setSelectedMenu(menuOptions.comm)}
                        title={Tooltips.equipmentTemplateMenuComm}
            />
            <EdstButton className={selectedMenu === menuOptions.appServ ? 'selected' : ''}
                        content="APP/SERV"
                        onMouseDown={() => setSelectedMenu(menuOptions.appServ)}
                        title={Tooltips.equipmentTemplateMenuAppServ}
            />
          </div>
          <div className="options-col right">
            <EdstButton content="Reset"/>
          </div>
        </div>
        {selectedMenu === menuOptions.surv && <EquipmentSurvTemplate/>}
        {selectedMenu === menuOptions.nav && <EquipmentNavTemplate/>}
        {selectedMenu === menuOptions.comm && <EquipmentCommTemplate/>}
        {selectedMenu === menuOptions.appServ && <EquipmentAppServTemplate/>}
        <div className="eqp-template-row bottom top-border">
          <div className="options-col">
            <EdstButton disabled={true} content="OK"/>
          </div>
          <div className="options-col right">
            <EdstButton className="exit-button" content="Cancel"
                        onMouseDown={() => dispatch(closeMenu(menuEnum.equipmentTemplateMenu))}/>
          </div>
        </div>
      </div>
    </div>
  );
};