import React, {useRef} from 'react';
import '../../css/header-styles.scss';
import {AclHeader} from "./acl-components/AclHeader";
import {AclTable} from "./acl-components/AclTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import styled from "styled-components";
import {edstFontGrey} from "../../styles/colors";
import {DraggingDiv} from "../../styles/styles";

const AclStyleDiv = styled.div`
  white-space: nowrap;
  display: flex;
  flex-flow: column;
  overflow: hidden;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid #888888;
  outline: 1px solid #ADADAD;
  color: ${edstFontGrey};
  
  ${(props: {dragging?: boolean}) => props.dragging && `${DraggingDiv}`}
`;

export const Acl: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const dragging = useAppSelector(draggingSelector);

  return (<AclStyleDiv dragging={dragging}
    ref={ref}
    // style={{zIndex: props.z_index}}
  >
    <AclHeader focused={focused}/>
    <AclTable/>
  </AclStyleDiv>);
}
