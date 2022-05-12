import React, {useRef, useState} from 'react';

import {EdstButton} from "../../resources/EdstButton";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {useRootDispatch, useRootSelector} from "../../../redux/hooks";
import {menuEnum} from "../../../enums";
import {closeMenu, menuSelector, pushZStack, zStackSelector} from "../../../redux/slices/appSlice";
import {ToolsOptionsMenu} from "./ToolsOptionsMenu";
import {useDragging, useFocused} from "../../../hooks";
import {
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsBottomRow,
  OptionsFlexCol,
  OptionsMenu,
  OptionsMenuHeader
} from '../../../styles/optionMenuStyles';
import styled from "styled-components";
import {EdstDraggingOutline} from "../../../styles/draggingStyles";

export const ToolsBody = styled(OptionsBody)`padding: 20px 0 4px 0;`;

export const ToolsMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const menuProps = useRootSelector(menuSelector(menuEnum.toolsMenu));
  const zStack = useRootSelector(zStackSelector);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const ref = useRef(null);
  const focused = useFocused(ref);
  const {startDrag, stopDrag, dragPreviewStyle} = useDragging(ref, menuEnum.toolsMenu);

  return menuProps?.position && (<OptionsMenu
    ref={ref}
    pos={menuProps.position}
    zIndex={zStack.indexOf(menuEnum.toolsMenu)}
    onMouseDown={() => zStack.indexOf(menuEnum.toolsMenu) > 0 && dispatch(pushZStack(menuEnum.toolsMenu))}
    id="tools-menu"
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
      {optionsMenuOpen ? "Options" : "Tools"} Menu
    </OptionsMenuHeader>
    <ToolsBody>
      {optionsMenuOpen && <ToolsOptionsMenu />}
      {!optionsMenuOpen && <span>
        <OptionsBodyRow>
          <EdstTooltip style={{ flexGrow: 1 }} disabled={true}>
            <OptionsFlexCol>
              Airspace Status...
            </OptionsFlexCol>
          </EdstTooltip>
        </OptionsBodyRow>
        <OptionsBodyRow>
          <EdstTooltip style={{ flexGrow: 1 }} disabled={true}>
            <OptionsFlexCol>
              Airport Stream Filter Status...
            </OptionsFlexCol>
          </EdstTooltip>
        </OptionsBodyRow>
        <OptionsBodyRow>
          <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setOptionsMenuOpen(true)}>
            <OptionsFlexCol>
              Options...
            </OptionsFlexCol>
          </EdstTooltip>
        </OptionsBodyRow>
        <OptionsBodyRow>
          <EdstTooltip style={{ flexGrow: 1 }} disabled={true}>
            <OptionsFlexCol>
              Restrictions...
            </OptionsFlexCol>
          </EdstTooltip>
        </OptionsBodyRow>
        <OptionsBottomRow>
          <OptionsBodyCol alignRight={true}>
            <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.toolsMenu))} />
          </OptionsBodyCol>
        </OptionsBottomRow>
      </span>}
    </ToolsBody>
  </OptionsMenu>
  );
};
