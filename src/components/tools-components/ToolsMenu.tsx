import React, { useRef, useState } from "react";

import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { closeWindow, pushZStack, windowSelector, zStackSelector } from "~redux/slices/appSlice";
import {
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsBottomRow,
  OptionsFlexCol,
  OptionsMenu,
  OptionsMenuHeader,
} from "styles/optionMenuStyles";
import { useDragging } from "hooks/useDragging";
import { useFocused } from "hooks/useFocused";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { ToolsOptionsMenu } from "components/ToolsOptionsMenu";
import { ExitButton } from "components/utils/EdstButton";

export const ToolsBody = styled(OptionsBody)`
  padding: 20px 0 4px 0;
`;

export const ToolsMenu = () => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector((state) => windowSelector(state, "TOOLS_MENU"));
  const zStack = useRootSelector(zStackSelector);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const ref = useRef(null);
  const focused = useFocused(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "TOOLS_MENU", "mouseup");

  return (
    <OptionsMenu
      ref={ref}
      pos={windowProps.position}
      zIndex={zStack.indexOf("TOOLS_MENU")}
      onMouseDown={() => zStack.indexOf("TOOLS_MENU") < zStack.length - 1 && dispatch(pushZStack("TOOLS_MENU"))}
      anyDragging={anyDragging}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
        {optionsMenuOpen ? "Options" : "Tools"} Menu
      </OptionsMenuHeader>
      <ToolsBody>
        {optionsMenuOpen && <ToolsOptionsMenu />}
        {!optionsMenuOpen && (
          <>
            <OptionsBodyRow>
              <OptionsFlexCol disabled>Airspace Status...</OptionsFlexCol>
            </OptionsBodyRow>
            <OptionsBodyRow>
              <OptionsFlexCol disabled>Airport Stream Filter Status...</OptionsFlexCol>
            </OptionsBodyRow>
            <OptionsBodyRow>
              <OptionsFlexCol onMouseDown={() => setOptionsMenuOpen(true)}>Options...</OptionsFlexCol>
            </OptionsBodyRow>
            <OptionsBodyRow>
              <OptionsFlexCol disabled>Restrictions...</OptionsFlexCol>
            </OptionsBodyRow>
            <OptionsBottomRow>
              <OptionsBodyCol alignRight>
                <ExitButton onMouseDown={() => dispatch(closeWindow("TOOLS_MENU"))} />
              </OptionsBodyCol>
            </OptionsBottomRow>
          </>
        )}
      </ToolsBody>
    </OptionsMenu>
  );
};
