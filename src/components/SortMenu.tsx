import type { PropsWithChildren } from "react";
import React, { useRef } from "react";

import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { closeWindow, zStackSelector, pushZStack, windowSelector } from "~redux/slices/appSlice";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { EdstWindow } from "enums/edstWindow";
import { SortBody, SortHeader } from "styles/sortStyles";
import { OptionsBodyCol, OptionsBottomRow, OptionsMenu } from "styles/optionMenuStyles";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstButton, ExitButton } from "components/utils/EdstButton";
import type { CSSProperties } from "styled-components";
import styled from "styled-components";

type SortDivProps = Pick<CSSProperties, "width">;
export const SortDiv = styled(OptionsMenu)<SortDivProps>((props) => ({ width: props.width }));

type SortMenuProps = PropsWithChildren<{
  edstWindow: EdstWindow.ACL_SORT_MENU | EdstWindow.DEP_SORT_MENU;
  onSubmit: () => void;
}>;

export const SortMenu = ({ edstWindow, onSubmit, children }: SortMenuProps) => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector((state) => windowSelector(state, edstWindow));
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
              <ExitButton onMouseDown={() => dispatch(closeWindow(edstWindow))} />
            </OptionsBodyCol>
          </OptionsBottomRow>
        </SortBody>
      </SortDiv>
    )
  );
};
