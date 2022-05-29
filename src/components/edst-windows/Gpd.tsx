import React, { useRef, useState } from "react";

import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { anyDraggingSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { useFocused } from "../../hooks";
import { GpdHeader } from "./gpd-components/GpdHeader";
import { GpdBody } from "./gpd-components/GpdBody";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "../../styles/colors";
import { DraggableDiv } from "../../styles/styles";
import { windowEnum } from "../../enums";

const GpdDiv = styled(DraggableDiv)<{ zIndex: number }>`
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
  z-index: ${props => 10000 - props.zIndex};
`;

export const Gpd: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [fullscreen, setFullscreen] = useState(true);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  const onMouseDownHandler = () =>
    zStack.indexOf(windowEnum.graphicPlanDisplay) > 0 && !fullscreen && dispatch(pushZStack(windowEnum.graphicPlanDisplay));

  return (
    <GpdDiv ref={ref} anyDragging={anyDragging} zIndex={zStack.indexOf(windowEnum.graphicPlanDisplay)} onMouseDown={onMouseDownHandler}>
      <GpdHeader focused={focused} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      <GpdBody zoomLevel={zoomLevel} />
    </GpdDiv>
  );
};
