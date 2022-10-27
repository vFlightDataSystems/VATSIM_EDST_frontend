import React, { useCallback, useRef, useState } from "react";
import styled, { CSSProperties } from "styled-components";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { zStackSelector, pushZStack, windowPositionSelector, closeWindow } from "../../../redux/slices/appSlice";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EdstButton, EdstTemplateButton10ch } from "../../utils/EdstButton";
import { EquipmentNavTemplate } from "./EquipmentNavTemplate";
import { EquipmentSurvTemplate } from "./EquipmentSurvTemplate";
import { EquipmentCommTemplate } from "./EquipmentCommTemplate";
import { EquipmentAppServTemplate } from "./EquipmentAppServTemplate";
import { Tooltips } from "../../../tooltips";
import { EdstTooltip } from "../../utils/EdstTooltip";
import {
  OptionsBodyCol,
  OptionsBody,
  OptionsBodyRow,
  OptionIndicator,
  OptionsMenu,
  OptionsMenuHeader,
  FidRow,
  OptionIndicatorDiamond,
  OptionIndicatorCircle
} from "../../../styles/optionMenuStyles";
import { EqpContentCol, EqpRow } from "./EqpStyled";
import { EdstDraggingOutline } from "../../utils/EdstDraggingOutline";
import { useDragging } from "../../../hooks/useDragging";
import { useCenterCursor } from "../../../hooks/useCenterCursor";
import { useFocused } from "../../../hooks/useFocused";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { AtMostOne } from "../../../typeDefinitions/utility-types";

const EqpTemplateDiv = styled(OptionsMenu)`
  width: 92ch;
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

enum MenuOptions {
  surv,
  nav,
  comm,
  appServ
}

type EquipmentTemplateRowProps = {
  margin?: CSSProperties["margin"];
  buttonText: string;
  selected: boolean;
  tooltip: string;
  text?: string;
  toggleSelect(): void;
} & AtMostOne<Record<"diamond" | "circle", boolean>>;

export const EquipmentTemplateRow = ({ margin, tooltip, toggleSelect, selected, circle, diamond, buttonText, text }: EquipmentTemplateRowProps) => {
  let Indicator = OptionIndicator;
  if (circle || diamond) {
    Indicator = circle ? OptionIndicatorCircle : OptionIndicatorDiamond;
  }
  return (
    <EqpRow margin={margin}>
      <EdstTooltip title={tooltip} onMouseDown={toggleSelect}>
        <EqpContentCol>
          <Indicator selected={selected} />
          {buttonText}
        </EqpContentCol>
      </EdstTooltip>
      {text ?? ""}
    </EqpRow>
  );
};

export type EquipmentTemplateBodyProps = {
  setReset: (callback: () => void) => void;
};

export const EquipmentTemplateMenu = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(state => windowPositionSelector(state, EdstWindow.EQUIPMENT_TEMPLATE_MENU));
  const entry = useRootSelector(aselEntrySelector);
  const zStack = useRootSelector(zStackSelector);
  const [selectedMenu, setSelectedMenu] = useState<MenuOptions>(MenuOptions.nav);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.EQUIPMENT_TEMPLATE_MENU, "mouseup");
  const resetRef = useRef<() => void>();

  const setReset = useCallback((callback: () => void) => {
    resetRef.current = callback;
  }, []);

  return (
    pos && (
      <EqpTemplateDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.EQUIPMENT_TEMPLATE_MENU)}
        onMouseDown={() =>
          zStack.indexOf(EdstWindow.EQUIPMENT_TEMPLATE_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.EQUIPMENT_TEMPLATE_MENU))
        }
        anyDragging={anyDragging}
        id="equipment-template-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
          Equipment Template
        </OptionsMenuHeader>
        <EqpTemplateBody>
          <FidRow>{entry && `${entry.aircraftId} ${entry.aircraftType}/${entry.faaEquipmentSuffix}`}</FidRow>
          <EqpTemplateRow>
            <EdstTemplateButton10ch
              selected={selectedMenu === MenuOptions.surv}
              content="SURV"
              onMouseDown={() => setSelectedMenu(MenuOptions.surv)}
              title={Tooltips.equipmentTemplateMenuSurv}
            />
            <EdstTemplateButton10ch
              selected={selectedMenu === MenuOptions.nav}
              content="NAV"
              onMouseDown={() => setSelectedMenu(MenuOptions.nav)}
              title={Tooltips.equipmentTemplateMenuNAV}
            />
            <EdstTemplateButton10ch
              selected={selectedMenu === MenuOptions.comm}
              content="COMM"
              onMouseDown={() => setSelectedMenu(MenuOptions.comm)}
              title={Tooltips.equipmentTemplateMenuComm}
            />
            <EdstTemplateButton10ch
              selected={selectedMenu === MenuOptions.appServ}
              content="APP/SERV"
              onMouseDown={() => setSelectedMenu(MenuOptions.appServ)}
              title={Tooltips.equipmentTemplateMenuAppServ}
            />
            <OptionsBodyCol alignRight>
              <EdstButton content="Reset" onMouseDown={resetRef.current} />
            </OptionsBodyCol>
          </EqpTemplateRow>
          {selectedMenu === MenuOptions.surv && <EquipmentSurvTemplate setReset={setReset} />}
          {selectedMenu === MenuOptions.nav && <EquipmentNavTemplate setReset={setReset} />}
          {selectedMenu === MenuOptions.comm && <EquipmentCommTemplate setReset={setReset} />}
          {selectedMenu === MenuOptions.appServ && <EquipmentAppServTemplate setReset={setReset} />}
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
