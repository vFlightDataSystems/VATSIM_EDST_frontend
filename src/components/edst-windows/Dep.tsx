import React, {useRef, useState} from 'react';
import {DepHeader} from "./dep-components/DepHeader";
import {DepTable} from "./dep-components/DepTable";
import {useRootSelector, useRootDispatch} from "../../redux/hooks";
import {anyDraggingSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import styled from "styled-components";
import {edstFontGrey} from "../../styles/colors";
import {NoPointerEventsDiv} from "../../styles/styles";
import {windowEnum} from "../../enums";

const DepDiv = styled.div<{ dragging?: boolean, fullscreen: boolean, zIndex: number }>`
  white-space:nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  min-height: 40%;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid #888888;
  outline: 1px solid #ADADAD;
  color: ${edstFontGrey};
  z-index: ${props => 10000 - props.zIndex};

  ${props => props.dragging && NoPointerEventsDiv};
`;

export const Dep: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [fullscreen, setFullscreen] = useState(true);
  const dragging = useRootSelector(anyDraggingSelector);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  return (<DepDiv
    dragging={dragging}
    ref={ref}
    fullscreen={fullscreen}
    zIndex={zStack.indexOf(windowEnum.dep)}
    onMouseDown={() => zStack.indexOf(windowEnum.dep) > 0 && !fullscreen && dispatch(pushZStack(windowEnum.dep))}
  >
    <DepHeader focused={focused} />
    <DepTable />
  </DepDiv>);
};
