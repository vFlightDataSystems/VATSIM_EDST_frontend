import React, {useContext, useRef} from 'react';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {closeWindow, setShowSectorSelector, windowPositionSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {EdstButton} from "../resources/EdstButton";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock,
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";
import styled from "styled-components";

const StatusBodyDiv = styled(FloatingWindowBodyDiv)`
  padding-top: 4px;
  padding-left: 20px;
`;

export const Status: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(windowEnum.status));
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);
  const zStack = useRootSelector(zStackSelector);

  return pos && (<FloatingWindowDiv
    ref={ref}
    width={360}
    pos={pos}
    zIndex={zStack.indexOf(windowEnum.status)}
    onMouseDown={() => zStack.indexOf(windowEnum.status) > 0 && dispatch(pushZStack(windowEnum.status))}
    id="edst-status"
  >
    <FloatingWindowHeaderDiv>
      <FloatingWindowHeaderColDiv width={20}>M</FloatingWindowHeaderColDiv>
      <FloatingWindowHeaderColDiv
        flexGrow={1}
        onMouseDown={(event) => startDrag(event, ref, windowEnum.status)}
      >
        STATUS
      </FloatingWindowHeaderColDiv>
      <FloatingWindowHeaderColDiv width={20} onMouseDown={() => dispatch(closeWindow(windowEnum.status))}>
        <FloatingWindowHeaderBlock width={8} height={2} />
      </FloatingWindowHeaderColDiv>
    </FloatingWindowHeaderDiv>
    <StatusBodyDiv>
      <EdstButton onMouseDown={() => dispatch(setShowSectorSelector(true))}>
        Change Sectors
      </EdstButton>
      <div>
        Submit Feedback <a href={"https://forms.gle/LpzgyNMNMwa8CY8e8"} target="_blank" rel="noreferrer">here</a>
      </div>
      <div>
        <a href={"https://github.com/CaptainTux/VATSIM_EDST_frontend/wiki"} target="_blank"
          rel="noreferrer">Roadmap</a>
      </div>
    </StatusBodyDiv>
  </FloatingWindowDiv>
  );
};
