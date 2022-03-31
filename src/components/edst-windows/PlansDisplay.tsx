import React, {useRef} from 'react';

import {PlansDisplayHeader} from "./plans-display-components/PlansDisplayHeader";
import {PlansDisplayTable} from "./plans-display-components/PlansDisplayTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import styled from "styled-components";
import {DraggingDiv} from "../../styles/styles";
import {edstFontGrey} from "../../styles/colors";

const PlansDisplayDiv = styled.div<{dragging?: boolean}>`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  min-height: 400px;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid #888888;
  outline: 1px solid #ADADAD;
  color: ${edstFontGrey};
  
  ${(props: {dragging?: boolean}) => props.dragging && `${DraggingDiv}`}
`;

export const PlansDisplay: React.FC = () => {
  const dragging = useAppSelector(draggingSelector);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);

  return (<PlansDisplayDiv dragging={dragging} ref={ref}>
    <div>
      <PlansDisplayHeader focused={focused}/>
      <PlansDisplayTable/>
    </div>
  </PlansDisplayDiv>);
};
