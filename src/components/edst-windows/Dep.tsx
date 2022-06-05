import React, { useRef, useState } from "react";
import styled from "styled-components";
import { DepHeader } from "./dep-components/DepHeader";
import { DepTable } from "./dep-components/DepTable";
import { useRootSelector, useRootDispatch } from "../../redux/hooks";
import { anyDraggingSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { useFocused } from "../../hooks";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "../../styles/colors";
import { DraggableDiv } from "../../styles/styles";
import { EdstWindow } from "../../namespaces";

const DepDiv = styled(DraggableDiv)<{ zIndex: number }>`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  min-height: 40%;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid ${edstWindowBorderColor};
  outline: 1px solid ${edstWindowOutlineColor};
  color: ${edstFontGrey};
  background-color: #000000;
  z-index: ${props => 10000 - props.zIndex};
`;

export const Dep: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [fullscreen, setFullscreen] = useState(true);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  return (
    <DepDiv
      anyDragging={anyDragging}
      ref={ref}
      zIndex={zStack.indexOf(EdstWindow.DEP)}
      onMouseDown={() => zStack.indexOf(EdstWindow.DEP) > 0 && !fullscreen && dispatch(pushZStack(EdstWindow.DEP))}
    >
      <DepHeader focused={focused} />
      <DepTable />
    </DepDiv>
  );
};
