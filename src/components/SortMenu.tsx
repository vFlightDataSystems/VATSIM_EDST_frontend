import type { PropsWithChildren } from "react";
import React, { useRef } from "react";

import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { closeWindow, zStackSelector, pushZStack, windowSelector } from "~redux/slices/appSlice";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { SortBody, SortHeader } from "styles/sortStyles";
import { OptionsBodyCol, OptionsBottomRow, OptionsMenu } from "styles/optionMenuStyles";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstButton, ExitButton } from "components/utils/EdstButton";
import type { CSSProperties } from "styled-components";
import styled from "styled-components";

type SortDivProps = Pick<CSSProperties, "width">;
export const SortDiv = styled(OptionsMenu)<SortDivProps>((props) => ({ width: props.width }));

type SortMenuProps = PropsWithChildren<{
  menu: "ACL_SORT_MENU" | "DEP_SORT_MENU";
  onSubmit: () => void;
}>;

export const SortMenu = ({ menu, onSubmit, children }: SortMenuProps) => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector((state) => windowSelector(state, menu));
  const zStack = useRootSelector(zStackSelector);

  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, menu, "mouseup");

  return (
    windowProps.position && (
      <SortDiv
        ref={ref}
        width={menu === "ACL_SORT_MENU" ? "220px" : "190px"}
        pos={windowProps.position}
        zIndex={zStack.indexOf(menu)}
        onMouseDown={() => zStack.indexOf(menu) < zStack.length - 1 && dispatch(pushZStack(menu))}
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
                  dispatch(closeWindow(menu));
                }}
              />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <ExitButton onMouseDown={() => dispatch(closeWindow(menu))} />
            </OptionsBodyCol>
          </OptionsBottomRow>
        </SortBody>
      </SortDiv>
    )
  );
};
