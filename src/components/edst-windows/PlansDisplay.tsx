import React, {useRef, useState} from 'react';

import {PlansDisplayHeader} from "./plans-display-components/PlansDisplayHeader";
import {PlansDisplayTable} from "./plans-display-components/PlansDisplayTable";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {anyDraggingSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import styled from "styled-components";
import {DraggableDiv} from "../../styles/styles";
import {edstFontGrey} from "../../styles/colors";
import {windowEnum} from "../../enums";

const PlansDisplayDiv = styled(DraggableDiv)<{ zIndex: number }>`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  min-height: 400px;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid #888888;
  outline: 1px solid #ADADAD;
  color: ${edstFontGrey};
  z-index: ${props => 10000 - props.zIndex};
`;

export const PlansDisplay: React.FC = () => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [fullscreen, setFullscreen] = useState(true);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const zStack = useRootSelector(zStackSelector);

  return (<PlansDisplayDiv
    anyDragging={anyDragging}
    ref={ref}
    zIndex={zStack.indexOf(windowEnum.plansDisplay)}
    onMouseDown={() => zStack.indexOf(windowEnum.plansDisplay) > 0 && !fullscreen && dispatch(pushZStack(windowEnum.plansDisplay))}
  >
    <PlansDisplayHeader focused={focused}/>
    <PlansDisplayTable/>
  </PlansDisplayDiv>);
};
