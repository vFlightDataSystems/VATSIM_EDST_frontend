import React, { PropsWithChildren, useRef } from "react";
import styled from "styled-components";
import { OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { AircraftId } from "../../types/aircraftId";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { EdstButton } from "../resources/EdstButton";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { EdstWindow } from "../../namespaces";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { useFocused } from "../../hooks/useFocused";
import { useDragging } from "../../hooks/useDragging";
import { entrySelector } from "../../redux/slices/entrySlice";

type PromptDivProps = {
  width?: number;
};
const PromptDiv = styled(OptionsMenu).attrs((props: PromptDivProps) => ({
  width: props.width ?? "auto"
}))<PromptDivProps>`
  width: ${props => props.width};
`;

type EdstPromptProps = PropsWithChildren<{
  title: string;
  width?: number;
  windowId: EdstWindow;
  aircraftId: AircraftId;
  submitText: string;
  onSubmit: () => void;
  cancelText: string;
  onCancel?: () => void;
  id: string;
}>;

export const EdstPrompt: React.FC<EdstPromptProps> = ({ ...props }) => {
  const pos = useRootSelector(windowPositionSelector(props.windowId));
  const ref = useRef<HTMLDivElement | null>(null);
  const zStack = useRootSelector(zStackSelector);
  const entry = useRootSelector(entrySelector(props.aircraftId));
  const focused = useFocused(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, props.windowId);
  const dispatch = useRootDispatch();

  return (
    pos &&
    entry && (
      <PromptDiv
        ref={ref}
        width={props.width}
        pos={pos}
        zIndex={zStack.indexOf(props.windowId)}
        anyDragging={anyDragging}
        onMouseDown={() => zStack.indexOf(props.windowId) < zStack.length - 1 && dispatch(pushZStack(props.windowId))}
        id={props.id}
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
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
