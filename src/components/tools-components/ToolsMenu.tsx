import React, { useRef, useState } from "react";

import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { closeWindow, pushZStack, windowSelector, zStackSelector } from "~redux/slices/appSlice";
import { useDragging } from "hooks/useDragging";
import { useFocused } from "hooks/useFocused";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { ToolsOptionsMenu } from "components/ToolsOptionsMenu";
import { ExitButton } from "components/utils/EdstButton";
import clsx from "clsx";
import toolsStyles from "css/toolsMenu.module.scss";
import optionStyles from "css/optionMenu.module.scss";

export const ToolsMenu = () => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector((state) => windowSelector(state, "TOOLS_MENU"));
  const zStack = useRootSelector(zStackSelector);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const ref = useRef(null);
  const focused = useFocused(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "TOOLS_MENU", "mouseup");

  const renderRow = (content: string, onMouseDown?: React.MouseEventHandler) => (
    <div className={optionStyles.row}>
      <div className={clsx(optionStyles.col, "flex", { isDisabled: !onMouseDown })} onMouseDown={onMouseDown}>
        {content}
      </div>
    </div>
  );

  return (
    <div
      className={clsx(optionStyles.root, { noPointerEvents: anyDragging })}
      ref={ref}
      style={{ ...windowProps.position, zIndex: 10000 + zStack.indexOf("TOOLS_MENU") }}
      onMouseDown={() => zStack.indexOf("TOOLS_MENU") < zStack.length - 1 && dispatch(pushZStack("TOOLS_MENU"))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        {optionsMenuOpen ? "Options" : "Tools"} Menu
      </div>
      <div className={toolsStyles.body}>
        {optionsMenuOpen && <ToolsOptionsMenu />}
        {!optionsMenuOpen && (
          <>
            {renderRow("Airspace Status...")}
            {renderRow("Airport Stream Filter Status...")}
            {renderRow("Options...", () => setOptionsMenuOpen(true))}
            {renderRow("Restrictions...")}
            <div className={optionStyles.bottomRow}>
              <div className={clsx(optionStyles.col, "right")}>
                <ExitButton onMouseDown={() => dispatch(closeWindow("TOOLS_MENU"))} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
