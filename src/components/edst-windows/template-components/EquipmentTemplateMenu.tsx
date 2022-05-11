import React, {useRef, useState} from "react";
import {useRootDispatch, useRootSelector} from "../../../redux/hooks";
import {closeMenu, menuPositionSelector, zStackSelector, pushZStack} from "../../../redux/slices/appSlice";
import {aselEntrySelector} from "../../../redux/slices/entriesSlice";
import {menuEnum} from "../../../enums";
import {EdstButton} from "../../resources/EdstButton";
import {EquipmentNavTemplate} from "./EquipmentNavTemplate";
import {EquipmentSurvTemplate} from "./EquipmentSurvTemplate";
import {EquipmentCommTemplate} from "./EquipmentCommTemplate";
import {EquipmentAppServTemplate} from "./EquipmentAppServTemplate";
import {Tooltips} from "../../../tooltips";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {useCenterCursor, useDragging, useFocused} from "../../../hooks";
import {
  OptionsBodyCol,
  OptionsBody, OptionsBodyRow,
  OptionSelectedIndicator,
  OptionsMenu,
  OptionsMenuHeader,
  FidRow
} from "../../../styles/optionMenuStyles";
import styled from "styled-components";
import {EqpContentCol, EqpRow} from "./styled";
import {EdstDraggingOutline} from "../../../styles/draggingStyles";

const EqpTemplateBody = styled(OptionsBody)`height: 100%`;
const EqpTemplateRow = styled(OptionsBodyRow)`
  display: flex;
  align-items: center;
`;
const EqpTemplateBottomRow = styled(EqpTemplateRow)`
  margin-bottom: 4px;
  padding-top: 6px;
  margin-top: 10px;
  border-top: 1px solid #ADADAD;
`;

enum menuOptions {
  surv,
  nav,
  comm,
  appServ
}

export type EquipmentTemplateRowProps = {
  margin?: string
  circle?: boolean,
  diamond?: boolean
  buttonText: string,
  selected: boolean,
  tooltip: string,
  text?: string,
  toggleSelect(): void
};

export const EquipmentTemplateRow: React.FC<EquipmentTemplateRowProps> = (props) => {
  return <EqpRow margin={props.margin}>
    <EdstTooltip title={props.tooltip}
                 onMouseDown={props.toggleSelect}
    >
      <EqpContentCol>
        <OptionSelectedIndicator selected={props.selected} circle={props.circle} diamond={props.diamond}/>
        {props.buttonText}
      </EqpContentCol>

    </EdstTooltip>
    {props.text ?? ''}
  </EqpRow>;
}

export const EquipmentTemplateMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(menuPositionSelector(menuEnum.equipmentTemplateMenu));
  const entry = useRootSelector(aselEntrySelector);
  const zStack = useRootSelector(zStackSelector);
  const [selectedMenu, setSelectedMenu] = useState<menuOptions>(menuOptions.nav);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const {startDrag, stopDrag, dragPreviewStyle} = useDragging(ref, menuEnum.equipmentTemplateMenu);

  return pos && (<OptionsMenu
    ref={ref}
    width={900}
    pos={pos}
    zIndex={zStack.indexOf(menuEnum.equipmentTemplateMenu)}
    onMouseDown={() => zStack.indexOf(menuEnum.equipmentTemplateMenu) > 0 && dispatch(pushZStack(menuEnum.equipmentTemplateMenu))}
    id="equipment-template-menu"
  >
      {dragPreviewStyle && <EdstDraggingOutline
          style={dragPreviewStyle}
          onMouseUp={stopDrag}
      />}
    <OptionsMenuHeader
      focused={focused}
      onMouseDown={startDrag}
      onMouseUp={stopDrag}
    >
      Equipment Template
    </OptionsMenuHeader>
    <EqpTemplateBody>
      <FidRow>
        {entry && `${entry.callsign} ${entry.type}/${entry.equipment}`}
      </FidRow>
      <EqpTemplateRow>
        <EdstButton
          width={85}
          margin="0 4px"
          selected={selectedMenu === menuOptions.surv}
          content="SURV"
          onMouseDown={() => setSelectedMenu(menuOptions.surv)}
          title={Tooltips.equipmentTemplateMenuSurv}
        />
        <EdstButton
          width={85}
          margin="0 4px"
          selected={selectedMenu === menuOptions.nav}
          content="NAV"
          onMouseDown={() => setSelectedMenu(menuOptions.nav)}
          title={Tooltips.equipmentTemplateMenuNAV}
        />
        <EdstButton
          width={85}
          margin="0 4px"
          selected={selectedMenu === menuOptions.comm}
          content="COMM"
          onMouseDown={() => setSelectedMenu(menuOptions.comm)}
          title={Tooltips.equipmentTemplateMenuComm}
        />
        <EdstButton
          width={85}
          margin="0 4px"
          selected={selectedMenu === menuOptions.appServ}
          content="APP/SERV"
          onMouseDown={() => setSelectedMenu(menuOptions.appServ)}
          title={Tooltips.equipmentTemplateMenuAppServ}
        />
        <OptionsBodyCol alignRight={true}>
          <EdstButton content="Reset" />
        </OptionsBodyCol>
      </EqpTemplateRow>
      {selectedMenu === menuOptions.surv && <EquipmentSurvTemplate />}
      {selectedMenu === menuOptions.nav && <EquipmentNavTemplate />}
      {selectedMenu === menuOptions.comm && <EquipmentCommTemplate />}
      {selectedMenu === menuOptions.appServ && <EquipmentAppServTemplate />}
      <EqpTemplateBottomRow>
        <OptionsBodyCol>
          <EdstButton disabled={true} content="OK" />
        </OptionsBodyCol>
        <OptionsBodyCol alignRight={true}>
          <EdstButton content="Cancel"
            onMouseDown={() => dispatch(closeMenu(menuEnum.equipmentTemplateMenu))}
          />
        </OptionsBodyCol>
      </EqpTemplateBottomRow>
    </EqpTemplateBody>
  </OptionsMenu>
  );
};
