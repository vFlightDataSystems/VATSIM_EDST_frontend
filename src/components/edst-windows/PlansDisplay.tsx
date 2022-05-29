import React, { useRef, useState } from "react";

import styled from "styled-components";
import { PlansDisplayHeader } from "./plans-display-components/PlansDisplayHeader";
import { PlansDisplayTable } from "./plans-display-components/PlansDisplayTable";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { anyDraggingSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { useFocused } from "../../hooks";
import { DraggableDiv } from "../../styles/styles";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "../../styles/colors";
import { windowEnum } from "../../enums";

const PlansDisplayDiv = styled(DraggableDiv)<{ zIndex: number }>`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  min-height: 400px;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid ${edstWindowBorderColor};
  outline: 1px solid ${edstWindowOutlineColor};
  color: ${edstFontGrey};
  background-color: #000000;
  z-index: ${props => 10000 - props.zIndex};
`;

export const PlansDisplay: React.FC = () => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [fullscreen, setFullscreen] = useState(true);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const zStack = useRootSelector(zStackSelector);

  return (
    <PlansDisplayDiv
      anyDragging={anyDragging}
      ref={ref}
      zIndex={zStack.indexOf(windowEnum.plansDisplay)}
      onMouseDown={() => zStack.indexOf(windowEnum.plansDisplay) > 0 && !fullscreen && dispatch(pushZStack(windowEnum.plansDisplay))}
    >
      <PlansDisplayHeader focused={focused} />
      <PlansDisplayTable />
    </PlansDisplayDiv>
  );
};
