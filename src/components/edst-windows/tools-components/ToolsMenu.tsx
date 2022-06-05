import React, { useRef, useState } from "react";

import styled from "styled-components";
import { EdstButton } from "../../resources/EdstButton";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { closeWindow, pushZStack, windowSelector, zStackSelector } from "../../../redux/slices/appSlice";
import { ToolsOptionsMenu } from "./ToolsOptionsMenu";
import { useDragging, useFocused } from "../../../hooks";
import {
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsBottomRow,
  OptionsFlexCol,
  OptionsMenu,
  OptionsMenuHeader
} from "../../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../../../styles/draggingStyles";
import { EdstWindow } from "../../../namespaces";

export const ToolsBody = styled(OptionsBody)`
  padding: 20px 0 4px 0;
`;

export const ToolsMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector(windowSelector(EdstWindow.TOOLS_MENU));
  const zStack = useRootSelector(zStackSelector);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const ref = useRef(null);
  const focused = useFocused(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.TOOLS_MENU);

  return (
    windowProps?.position && (
      <OptionsMenu
        ref={ref}
        pos={windowProps.position}
        zIndex={zStack.indexOf(EdstWindow.TOOLS_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.TOOLS_MENU) > 0 && dispatch(pushZStack(EdstWindow.TOOLS_MENU))}
        anyDragging={anyDragging}
        id="tools-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          {optionsMenuOpen ? "Options" : "Tools"} Menu
        </OptionsMenuHeader>
        <ToolsBody>
          {optionsMenuOpen && <ToolsOptionsMenu />}
          {!optionsMenuOpen && (
            <span>
              <OptionsBodyRow>
                <EdstTooltip style={{ flexGrow: 1 }} disabled>
                  <OptionsFlexCol>Airspace Status...</OptionsFlexCol>
                </EdstTooltip>
              </OptionsBodyRow>
              <OptionsBodyRow>
                <EdstTooltip style={{ flexGrow: 1 }} disabled>
                  <OptionsFlexCol>Airport Stream Filter Status...</OptionsFlexCol>
                </EdstTooltip>
              </OptionsBodyRow>
              <OptionsBodyRow>
                <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setOptionsMenuOpen(true)}>
                  <OptionsFlexCol>Options...</OptionsFlexCol>
                </EdstTooltip>
              </OptionsBodyRow>
              <OptionsBodyRow>
                <EdstTooltip style={{ flexGrow: 1 }} disabled>
                  <OptionsFlexCol>Restrictions...</OptionsFlexCol>
                </EdstTooltip>
              </OptionsBodyRow>
              <OptionsBottomRow>
                <OptionsBodyCol alignRight>
                  <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.TOOLS_MENU))} />
                </OptionsBodyCol>
              </OptionsBottomRow>
            </span>
          )}
        </ToolsBody>
      </OptionsMenu>
    )
  );
};
