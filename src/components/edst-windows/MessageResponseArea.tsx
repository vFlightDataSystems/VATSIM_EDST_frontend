import React, {useContext, useRef} from 'react';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {mraMsgSelector, windowPositionSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import styled from "styled-components";
import {FloatingWindowDiv} from "../../styles/floatingWindowStyles";

const MessageResponseAreaDiv = styled(FloatingWindowDiv)`
  line-height: 1;
  padding: 0 2px;
  min-height: 80px;
  width: 340px;
  background-color: #000000;
  border: 1px solid #ADADAD;
  overflow-wrap: anywhere;
  white-space: pre-line;
  font-family: EDST;
`;

export const MessageResponseArea: React.FC = () => {
  const pos = useRootSelector(windowPositionSelector(windowEnum.messageResponseArea));
  const msg = useRootSelector(mraMsgSelector);
  const zStack = useRootSelector(zStackSelector);
  const { startDrag } = useContext(EdstContext);
  const dispatch = useRootDispatch();
  const ref = useRef(null);

  return pos && (<MessageResponseAreaDiv
    pos={pos}
    zIndex={zStack.indexOf(windowEnum.messageResponseArea)}
    ref={ref}
    id="edst-mra"
    onMouseDown={(event) => {
      startDrag(event, ref, windowEnum.messageResponseArea);
      if (zStack.indexOf(windowEnum.messageResponseArea) > 0) {
        dispatch(pushZStack(windowEnum.messageResponseArea));
      }
    }}
  >
    {msg}
  </MessageResponseAreaDiv>
  );
}
