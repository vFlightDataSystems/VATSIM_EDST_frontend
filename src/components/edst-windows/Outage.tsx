import React, {useRef} from "react";
import {windowEnum} from "../../enums";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {closeWindow, pushZStack, windowPositionSelector, zStackSelector} from "../../redux/slices/appSlice";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock,
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";
import {useDragging} from "../../hooks";
import {EdstDraggingOutline} from "../../styles/draggingStyles";
import styled from "styled-components";

const OutageDiv = styled(FloatingWindowDiv)`
  width: 340px
`;

export const Outage: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(windowEnum.outage));
  const ref = useRef(null);
  const {startDrag, stopDrag, dragPreviewStyle} = useDragging(ref, windowEnum.outage);
  const zStack = useRootSelector(zStackSelector);

  return pos && (<OutageDiv
      pos={pos}
      ref={ref}
      zIndex={zStack.indexOf(windowEnum.outage)}
      onMouseDown={() => zStack.indexOf(windowEnum.outage) > 0 && dispatch(pushZStack(windowEnum.outage))}
      id="edst-outage"
    >
      {dragPreviewStyle && <EdstDraggingOutline
          style={dragPreviewStyle}
          onMouseDown={stopDrag}
      />}
      <FloatingWindowHeaderDiv>
        <FloatingWindowHeaderColDiv width={20}>M</FloatingWindowHeaderColDiv>
        <FloatingWindowHeaderColDiv
          flexGrow={1}
          onMouseDown={startDrag}
        >
          OUTAGE
        </FloatingWindowHeaderColDiv>
        <FloatingWindowHeaderColDiv width={20} onMouseDown={() => dispatch(closeWindow(windowEnum.outage))}>
          <FloatingWindowHeaderBlock width={8} height={2}/>
        </FloatingWindowHeaderColDiv>
      </FloatingWindowHeaderDiv>
      <FloatingWindowBodyDiv>
        OUTAGE TEST
      </FloatingWindowBodyDiv>
    </OutageDiv>
  );
}
