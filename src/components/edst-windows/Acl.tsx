import React, { useRef, useState } from "react";
import styled from "styled-components";
import { AclHeader } from "./acl-components/AclHeader";
import { AclTable } from "./acl-components/AclTable";
import { useRootSelector, useRootDispatch } from "../../redux/hooks";
import { anyDraggingSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { useFocused } from "../../hooks/utils";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "../../styles/colors";
import { DraggableDiv } from "../../styles/styles";
import { EdstWindow } from "../../namespaces";

const AclDiv = styled(DraggableDiv)<{ zIndex: number }>`
  white-space: nowrap;
  display: flex;
  flex-flow: column;
  overflow: hidden;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid ${edstWindowBorderColor};
  outline: 1px solid ${edstWindowOutlineColor};
  color: ${edstFontGrey};
  background-color: #000000;
  z-index: ${props => 10000 + props.zIndex};
`;

export const Acl: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [fullscreen, setFullscreen] = useState(true);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  const onMouseDownHandler = () => {
    if (zStack.indexOf(EdstWindow.ACL) > 0 && !fullscreen) {
      dispatch(pushZStack(EdstWindow.ACL));
    }
  };

  return (
    <AclDiv anyDragging={anyDragging} ref={ref} zIndex={zStack.indexOf(EdstWindow.ACL)} onMouseDown={onMouseDownHandler}>
      <AclHeader focused={focused} />
      <AclTable />
    </AclDiv>
  );
};
