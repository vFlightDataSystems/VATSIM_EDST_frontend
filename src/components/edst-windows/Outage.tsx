import React, {useContext, useRef} from "react";
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock,
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";

export const Outage: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(windowEnum.outage));
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);
  const zStack = useRootSelector(zStackSelector);

  return pos && (<FloatingWindowDiv
    width={340}
    pos={pos}
    ref={ref}
    zIndex={zStack.indexOf(windowEnum.outage)}
    onMouseDown={() => zStack.indexOf(windowEnum.outage) > 0 && dispatch(pushZStack(windowEnum.outage))}
    id="edst-outage"
  >
    <FloatingWindowHeaderDiv>
      <FloatingWindowHeaderColDiv width={20}>M</FloatingWindowHeaderColDiv>
      <FloatingWindowHeaderColDiv
        flexGrow={1}
        onMouseDown={(event) => startDrag(event, ref, windowEnum.outage)}
      >
        OUTAGE
      </FloatingWindowHeaderColDiv>
      <FloatingWindowHeaderColDiv width={20} onMouseDown={() => dispatch(closeWindow(windowEnum.outage))}>
        <FloatingWindowHeaderBlock width={8} height={2} />
      </FloatingWindowHeaderColDiv>
    </FloatingWindowHeaderDiv>
    <FloatingWindowBodyDiv>
      OUTAGE TEST
    </FloatingWindowBodyDiv>
  </FloatingWindowDiv>
  );
}
