import type { CSSProperties } from "react";
import React, { useCallback, useRef, useState } from "react";
import type { AtMostOne } from "types/utility-types";
import { zStackSelector, pushZStack, windowPositionSelector, closeWindow } from "~redux/slices/appSlice";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { Tooltips } from "~/tooltips";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { EquipmentNavTemplate } from "components/EquipmentNavTemplate";
import { EquipmentSurvTemplate } from "components/EquipmentSurvTemplate";
import { EquipmentCommTemplate } from "components/EquipmentCommTemplate";
import { EquipmentAppServTemplate } from "components/EquipmentAppServTemplate";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstButton, EdstTemplateButton10ch } from "components/utils/EdstButton";
import clsx from "clsx";
import optionStyles from "css/optionMenu.module.scss";
import eqpStyles from "css/eqp.module.scss";

enum MenuOptions {
  surv,
  nav,
  comm,
  appServ,
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
  let indicatorClass = optionStyles.indicator;
  if (circle || diamond) {
    indicatorClass = circle ? optionStyles.circleIndicator : optionStyles.diamondIndicator;
  }
  return (
    <div className={eqpStyles.row} style={{ margin }}>
      <div className={eqpStyles.contentCol} title={tooltip} onMouseDown={toggleSelect}>
        <div className={clsx(indicatorClass, { selected })} />
        {buttonText}
      </div>
      {text ?? ""}
    </div>
  );
};

export type EquipmentTemplateBodyProps = {
  setReset: (callback: () => void) => void;
};

export const EquipmentTemplateMenu = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector((state) => windowPositionSelector(state, "EQUIPMENT_TEMPLATE_MENU"));
  const entry = useRootSelector(aselEntrySelector);
  const zStack = useRootSelector(zStackSelector);
  const [selectedMenu, setSelectedMenu] = useState<MenuOptions>(MenuOptions.nav);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "EQUIPMENT_TEMPLATE_MENU", "mouseup");
  const resetRef = useRef<() => void>();

  const setReset = useCallback((callback: () => void) => {
    resetRef.current = callback;
  }, []);

  return (
    <div
      className={clsx(eqpStyles.root, { noPointerEvents: anyDragging })}
      ref={ref}
      style={{ ...pos, zIndex: 10000 + zStack.indexOf("EQUIPMENT_TEMPLATE_MENU") }}
      onMouseDown={() => zStack.indexOf("EQUIPMENT_TEMPLATE_MENU") < zStack.length - 1 && dispatch(pushZStack("EQUIPMENT_TEMPLATE_MENU"))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        Equipment Template
      </div>
      <div className={clsx(optionStyles.body)}>
        <div className={optionStyles.fidRow}>{entry && `${entry.aircraftId} ${entry.aircraftType}/${entry.faaEquipmentSuffix}`}</div>
        <div className={eqpStyles.row}>
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
          <div className={clsx(optionStyles.col, "right")}>
            <EdstButton content="Reset" onMouseDown={resetRef.current} />
          </div>
        </div>
        {selectedMenu === MenuOptions.surv && <EquipmentSurvTemplate setReset={setReset} />}
        {selectedMenu === MenuOptions.nav && <EquipmentNavTemplate setReset={setReset} />}
        {selectedMenu === MenuOptions.comm && <EquipmentCommTemplate setReset={setReset} />}
        {selectedMenu === MenuOptions.appServ && <EquipmentAppServTemplate setReset={setReset} />}
        <div className={eqpStyles.bottomRow}>
          <div className={optionStyles.col}>
            <EdstButton disabled content="OK" />
          </div>
          <div className={clsx(optionStyles.col, "right")}>
            <EdstButton content="Cancel" onMouseDown={() => dispatch(closeWindow("EQUIPMENT_TEMPLATE_MENU"))} />
          </div>
        </div>
      </div>
    </div>
  );
};
