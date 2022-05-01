import React, {useRef, useState} from 'react';

import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {anyDraggingSelector, zStackSelector, setZStack} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import {GpdHeader} from "./gpd-components/GpdHeader";
import {GpdBody} from "./gpd-components/GpdBody";
import styled from "styled-components";
import {edstFontGrey} from "../../styles/colors";
import {NoPointerEventsDiv} from "../../styles/styles";
import {windowEnum} from "../../enums";

const GpdDiv = styled.div<{ dragging?: boolean, fullscreen: boolean, zIndex: number }>`
  white-space: nowrap;
  display: flex;
  flex-flow: column;
  overflow: hidden;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid #888888;
  outline: 1px solid #ADADAD;
  color: ${edstFontGrey};
  z-index: ${props => (props.fullscreen ? 5000 : 10000) - props.zIndex};

  ${props => props.dragging && NoPointerEventsDiv}
`;

export const Gpd: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [fullscreen, setFullscreen] = useState(true);
  const dragging = useAppSelector(anyDraggingSelector);
  const zStack = useAppSelector(zStackSelector);
  const dispatch = useAppDispatch();

  return (<GpdDiv
    ref={ref}
    dragging={dragging}
    fullscreen={fullscreen}
    zIndex={zStack.indexOf(windowEnum.graphicPlanDisplay)}
    onMouseDown={() => zStack.indexOf(windowEnum.graphicPlanDisplay) > 0 && dispatch(setZStack(windowEnum.graphicPlanDisplay))}
  >
    <GpdHeader focused={focused} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
    <GpdBody zoomLevel={zoomLevel} />
  </GpdDiv>);
}
