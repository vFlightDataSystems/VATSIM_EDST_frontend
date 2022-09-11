import React, { PropsWithChildren, useRef } from "react";
import styled from "styled-components";
import { OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { EdstButton } from "../utils/EdstButton";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { useFocused } from "../../hooks/useFocused";
import { useDragging } from "../../hooks/useDragging";
import { useCenterCursor } from "../../hooks/useCenterCursor";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";

type PromptDivProps = {
  width?: string;
};
const PromptDiv = styled(OptionsMenu).attrs((props: PromptDivProps) => ({
  width: props.width ?? "auto"
}))<PromptDivProps>`
  width: ${props => props.width};
`;

type EdstPromptProps = PropsWithChildren<{
  title: string;
  width?: string;
  windowId: EdstWindow;
  submitText: string;
  onSubmit: () => void;
  cancelText: string;
  onCancel?: () => void;
  id: string;
  stopDragOn?: "mousedown" | "mouseup";
}>;

export const EdstPrompt = ({ stopDragOn = "mouseup", ...props }: EdstPromptProps) => {
  const pos = useRootSelector(windowPositionSelector(props.windowId));
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const focused = useFocused(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, props.windowId, stopDragOn);
  const dispatch = useRootDispatch();
  useCenterCursor(ref);

  return (
    pos && (
      <PromptDiv
        ref={ref}
        width={props.width}
        pos={pos}
        zIndex={zStack.indexOf(props.windowId)}
        anyDragging={anyDragging}
        onMouseDown={() => zStack.indexOf(props.windowId) < zStack.length - 1 && dispatch(pushZStack(props.windowId))}
        id={props.id}
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
          {props.title}
        </OptionsMenuHeader>
        <OptionsBody>
          {props.children}
          <OptionsBodyRow margin="0">
            <OptionsBodyCol>
              <EdstButton content={props.submitText} onMouseDown={props.onSubmit} />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton
                content={props.cancelText}
                onMouseDown={() => {
                  dispatch(closeWindow(props.windowId));
                  props.onCancel?.();
                }}
              />
            </OptionsBodyCol>
          </OptionsBodyRow>
        </OptionsBody>
      </PromptDiv>
    )
  );
};
