import React, { PropsWithChildren, useRef } from "react";

import { EdstButton } from "../utils/EdstButton";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, zStackSelector, pushZStack, windowSelector } from "../../redux/slices/appSlice";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { useDragging } from "../../hooks/useDragging";
import { useCenterCursor } from "../../hooks/useCenterCursor";
import { useFocused } from "../../hooks/useFocused";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { SortBody, SortDiv, SortHeader } from "../../styles/sortStyles";
import { OptionsBodyCol, OptionsBottomRow } from "../../styles/optionMenuStyles";

type SortMenuProps = {
  edstWindow: EdstWindow.ACL_SORT_MENU | EdstWindow.DEP_SORT_MENU;
  onSubmit: () => void;
};

export const SortMenu = ({ edstWindow, onSubmit, children }: PropsWithChildren<SortMenuProps>) => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector(windowSelector(edstWindow));
  const zStack = useRootSelector(zStackSelector);

  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, edstWindow, "mouseup");

  return (
    windowProps.position && (
      <SortDiv
        ref={ref}
        width={edstWindow === EdstWindow.ACL_SORT_MENU ? 220 : 190}
        pos={windowProps.position}
        zIndex={zStack.indexOf(edstWindow)}
        onMouseDown={() => zStack.indexOf(edstWindow) < zStack.length - 1 && dispatch(pushZStack(edstWindow))}
        anyDragging={anyDragging}
        id="sort-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <SortHeader focused={focused} onMouseDown={startDrag}>
          Sort Menu
        </SortHeader>
        <SortBody>
          {children}
          <OptionsBottomRow>
            <OptionsBodyCol>
              <EdstButton
                content="OK"
                onMouseDown={() => {
                  onSubmit();
                  dispatch(closeWindow(edstWindow));
                }}
              />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(edstWindow))} />
            </OptionsBodyCol>
          </OptionsBottomRow>
        </SortBody>
      </SortDiv>
    )
  );
};
