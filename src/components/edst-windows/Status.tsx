import React, {useRef} from 'react';
import {windowEnum} from "../../enums";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {
  closeWindow,
  setShowSectorSelector,
  windowPositionSelector,
  zStackSelector,
  pushZStack
} from "../../redux/slices/appSlice";
import {EdstButton} from "../resources/EdstButton";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock8x2,
  FloatingWindowHeaderColDiv20, FloatingWindowHeaderColDivFlex,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";
import styled from "styled-components";
import {EdstDraggingOutline} from "../../styles/draggingStyles";
import {useDragging} from "../../hooks";

const StatusDiv = styled(FloatingWindowDiv)`
  width: 360px
`

const StatusBodyDiv = styled(FloatingWindowBodyDiv)`
  padding-top: 4px;
  padding-left: 20px;
`;

export const Status: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(windowEnum.status));
  const ref = useRef(null);
  const {startDrag, stopDrag, dragPreviewStyle, anyDragging} = useDragging(ref, windowEnum.status);
  const zStack = useRootSelector(zStackSelector);

  return pos && (<StatusDiv
      ref={ref}
      pos={pos}
      zIndex={zStack.indexOf(windowEnum.status)}
      onMouseDown={() => zStack.indexOf(windowEnum.status) > 0 && dispatch(pushZStack(windowEnum.status))}
      anyDragging={anyDragging}
      id="edst-status"
    >
      {dragPreviewStyle && <EdstDraggingOutline
          style={dragPreviewStyle}
          onMouseDown={stopDrag}
      />}
      <FloatingWindowHeaderDiv>
        <FloatingWindowHeaderColDiv20>M</FloatingWindowHeaderColDiv20>
        <FloatingWindowHeaderColDivFlex
          onMouseDown={startDrag}
        >
          STATUS
        </FloatingWindowHeaderColDivFlex>
        <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(windowEnum.status))}>
          <FloatingWindowHeaderBlock8x2/>
        </FloatingWindowHeaderColDiv20>
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
    </StatusDiv>
  );
};
