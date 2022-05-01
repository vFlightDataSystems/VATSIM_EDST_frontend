import React, {useRef, useState} from 'react';
import {AclHeader} from "./acl-components/AclHeader";
import {AclTable} from "./acl-components/AclTable";
import {useAppSelector, useAppDispatch} from "../../redux/hooks";
import {anyDraggingSelector, zStackSelector, setZStack} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import styled from "styled-components";
import {edstFontGrey} from "../../styles/colors";
import {NoPointerEventsDiv} from "../../styles/styles";
import {windowEnum} from "../../enums";

const AclDiv = styled.div<{ anyDragging?: boolean, fullscreen: boolean, zIndex: number }>`
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

  ${props => props.anyDragging && NoPointerEventsDiv};
`;

export const Acl: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [fullscreen, setFullscreen] = useState(true);
  const anyDragging = useAppSelector(anyDraggingSelector);
  const zStack = useAppSelector(zStackSelector);
  const dispatch = useAppDispatch();

  return (<AclDiv
    anyDragging={anyDragging}
    ref={ref}
    fullscreen={fullscreen}
    zIndex={zStack.indexOf(windowEnum.acl)}
    onMouseDown={() => zStack.indexOf(windowEnum.acl) > 0 && dispatch(setZStack(windowEnum.acl))}
  >
    <AclHeader focused={focused}/>
    <AclTable/>
  </AclDiv>);
}
