import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import React, {useContext, useRef} from "react";
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {
  FloatingWindowHeaderBlock,
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";

export const Outage: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.outage));
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  return pos && (<div className="floating-window outage-window"
               ref={ref}
               id="edst-outage"
               style={{left: pos.x + "px", top: pos.y + "px"}}
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
          <FloatingWindowHeaderBlock width={8} height={2}/>
        </FloatingWindowHeaderColDiv>
      </FloatingWindowHeaderDiv>
      <div className="floating-window-body">
        OUTAGE TEST
      </div>
    </div>
  );
}