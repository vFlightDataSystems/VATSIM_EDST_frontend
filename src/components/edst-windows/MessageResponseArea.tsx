import React, {useContext, useRef} from 'react';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppSelector} from "../../redux/hooks";
import {mraMsgSelector, windowPositionSelector} from "../../redux/slices/appSlice";
import styled from "styled-components";
import {FloatingWindowDiv} from "../../styles/floatingWindowStyles";

const MessageResponseAreaDiv = styled(FloatingWindowDiv)`
  z-index: 1000;
  line-height: 1;
  padding: 0 2px;
  height: 80px;
  width: 340px;
  background-color: #000000;
  border: 1px solid #ADADAD;
  overflow-wrap: anywhere;
  white-space: pre-line;
  font-family: EDST;
`;

export const MessageResponseArea: React.FC = () => {
  const pos = useAppSelector(windowPositionSelector(windowEnum.messageResponseArea));
  const msg = useAppSelector(mraMsgSelector);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  return pos && (<MessageResponseAreaDiv
      pos={pos}
      ref={ref}
      id="edst-mra"
      onMouseDown={(event) => startDrag(event, ref, windowEnum.messageResponseArea)}
    >
      {msg}
    </MessageResponseAreaDiv>
  );
}