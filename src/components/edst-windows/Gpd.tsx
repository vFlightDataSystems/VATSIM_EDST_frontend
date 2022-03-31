import React, {useRef, useState} from 'react';

import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import {GpdHeader} from "./gpd-components/GpdHeader";
import {GpdBody} from "./gpd-components/GpdBody";
import styled from "styled-components";
import {edstFontGrey} from "../../styles/colors";
import {DraggingDiv} from "../../styles/styles";

const GpdDiv = styled.div<{dragging?: boolean}>`
  white-space: nowrap;
  display: flex;
  flex-flow: column;
  overflow: hidden;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid #888888;
  outline: 1px solid #ADADAD;
  color: ${edstFontGrey};
  ${props => props.dragging && DraggingDiv}
`;

export const Gpd: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const dragging = useAppSelector(draggingSelector);
  const [zoomLevel, setZoomLevel] = useState(6);

  return (<GpdDiv ref={ref} dragging={dragging}>
    <GpdHeader focused={focused} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel}/>
    <GpdBody zoomLevel={zoomLevel}/>
  </GpdDiv>);
}
