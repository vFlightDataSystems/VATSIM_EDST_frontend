import React, { useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { zStackSelector, pushZStack, windowPositionSelector, closeWindow } from "../../../redux/slices/appSlice";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EdstButton, EdstTemplateButton85 } from "../../resources/EdstButton";
import { EquipmentNavTemplate } from "./EquipmentNavTemplate";
import { EquipmentSurvTemplate } from "./EquipmentSurvTemplate";
import { EquipmentCommTemplate } from "./EquipmentCommTemplate";
import { EquipmentAppServTemplate } from "./EquipmentAppServTemplate";
import { Tooltips } from "../../../tooltips";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { useCenterCursor, useDragging, useFocused } from "../../../hooks/utils";
import {
  OptionsBodyCol,
  OptionsBody,
  OptionsBodyRow,
  OptionSelectedIndicator,
  OptionsMenu,
  OptionsMenuHeader,
  FidRow
} from "../../../styles/optionMenuStyles";
import { EqpContentCol, EqpRow } from "./styled";
import { EdstDraggingOutline } from "../../../styles/draggingStyles";
import { EdstWindow } from "../../../namespaces";

const EqpTemplateDiv = styled(OptionsMenu)`
  width: 900px;
`;
const EqpTemplateBody = styled(OptionsBody)`
  height: 100%;
`;
const EqpTemplateRow = styled(OptionsBodyRow)`
  display: flex;
  align-items: center;
`;
const EqpTemplateBottomRow = styled(EqpTemplateRow)`
  margin-bottom: 4px;
  padding-top: 6px;
  margin-top: 10px;
  border-top: 1px solid #adadad;
`;

enum menuOptions {
  surv,
  nav,
  comm,
  appServ
}

export type EquipmentTemplateRowProps = {
  margin?: string;
  circle?: boolean;
  diamond?: boolean;
  buttonText: string;
  selected: boolean;
  tooltip: string;
  text?: string;
  toggleSelect(): void;
};

export const EquipmentTemplateRow: React.FC<EquipmentTemplateRowProps> = ({
  margin,
  tooltip,
  toggleSelect,
  selected,
  circle,
  diamond,
  buttonText,
  text
}) => {
  return (
    <EqpRow margin={margin}>
      <EdstTooltip title={tooltip} onMouseDown={toggleSelect}>
        <EqpContentCol>
          <OptionSelectedIndicator selected={selected} circle={circle} diamond={diamond} />
          {buttonText}
        </EqpContentCol>
      </EdstTooltip>
      {text ?? ""}
    </EqpRow>
  );
};

export const EquipmentTemplateMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.EQUIPMENT_TEMPLATE_MENU));
  const entry = useRootSelector(aselEntrySelector);
  const zStack = useRootSelector(zStackSelector);
  const [selectedMenu, setSelectedMenu] = useState<menuOptions>(menuOptions.nav);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.EQUIPMENT_TEMPLATE_MENU);

  return (
    pos && (
      <EqpTemplateDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.EQUIPMENT_TEMPLATE_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.EQUIPMENT_TEMPLATE_MENU) > 0 && dispatch(pushZStack(EdstWindow.EQUIPMENT_TEMPLATE_MENU))}
        anyDragging={anyDragging}
        id="equipment-template-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Equipment Template
        </OptionsMenuHeader>
        <EqpTemplateBody>
          <FidRow>{entry && `${entry.aircraftId} ${entry.equipment.split("/")[0]}/${entry.nasSuffix}`}</FidRow>
          <EqpTemplateRow>
            <EdstTemplateButton85
              selected={selectedMenu === menuOptions.surv}
              content="SURV"
              onMouseDown={() => setSelectedMenu(menuOptions.surv)}
              title={Tooltips.equipmentTemplateMenuSurv}
            />
            <EdstTemplateButton85
              selected={selectedMenu === menuOptions.nav}
              content="NAV"
              onMouseDown={() => setSelectedMenu(menuOptions.nav)}
              title={Tooltips.equipmentTemplateMenuNAV}
            />
            <EdstTemplateButton85
              selected={selectedMenu === menuOptions.comm}
              content="COMM"
              onMouseDown={() => setSelectedMenu(menuOptions.comm)}
              title={Tooltips.equipmentTemplateMenuComm}
            />
            <EdstTemplateButton85
              selected={selectedMenu === menuOptions.appServ}
              content="APP/SERV"
              onMouseDown={() => setSelectedMenu(menuOptions.appServ)}
              title={Tooltips.equipmentTemplateMenuAppServ}
            />
            <OptionsBodyCol alignRight>
              <EdstButton content="Reset" />
            </OptionsBodyCol>
          </EqpTemplateRow>
          {selectedMenu === menuOptions.surv && <EquipmentSurvTemplate />}
          {selectedMenu === menuOptions.nav && <EquipmentNavTemplate />}
          {selectedMenu === menuOptions.comm && <EquipmentCommTemplate />}
          {selectedMenu === menuOptions.appServ && <EquipmentAppServTemplate />}
          <EqpTemplateBottomRow>
            <OptionsBodyCol>
              <EdstButton disabled content="OK" />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Cancel" onMouseDown={() => dispatch(closeWindow(EdstWindow.EQUIPMENT_TEMPLATE_MENU))} />
            </OptionsBodyCol>
          </EqpTemplateBottomRow>
        </EqpTemplateBody>
      </EqpTemplateDiv>
    )
  );
};
