import React, {useRef} from 'react';
import {DepHeader} from "./dep-components/DepHeader";
import {DepTable} from "./dep-components/DepTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import styled from "styled-components";
import {edstFontGrey} from "../../styles/colors";
import {NoPointerEventsDiv} from "../../styles/styles";

const DepDiv = styled.div<{dragging?: boolean}>`
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

  ${props => props.dragging && NoPointerEventsDiv}
`;

export const Dep: React.FC = () => {
  const dragging = useAppSelector(draggingSelector);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);

  return (<DepDiv dragging={dragging} ref={ref}>
    <DepHeader focused={focused}/>
    <DepTable/>
  </DepDiv>);
};
