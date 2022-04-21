import React, {useRef, useState} from 'react';
import {AclHeader} from "./acl-components/AclHeader";
import {AclTable} from "./acl-components/AclTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector, zStackSelector} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import styled from "styled-components";
import {edstFontGrey} from "../../styles/colors";
import {NoPointerEventsDiv} from "../../styles/styles";
import {windowEnum} from "../../enums";

const AclDiv = styled.div<{ dragging?: boolean, fullscreen: boolean, zIndex: number }>`
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

  ${props => props.dragging && NoPointerEventsDiv};
`;

export const Acl: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [fullscreen, setFullscreen] = useState(true);
  const dragging = useAppSelector(draggingSelector);
  const zStack = useAppSelector(zStackSelector);

  return (<AclDiv dragging={dragging} ref={ref} fullscreen={fullscreen} zIndex={zStack.indexOf(windowEnum.acl)}>
    <AclHeader focused={focused}/>
    <AclTable/>
  </AclDiv>);
}
