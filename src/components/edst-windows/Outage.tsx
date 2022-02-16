import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import React, {useContext, useRef} from "react";
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";

export const Outage: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.edstOutage));
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  return pos && (<div className="floating-window outage-window"
               ref={ref}
               id="edst-outage"
               style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <div className="floating-window-header no-select">
        <div className="floating-window-header-left">
          M
        </div>
        <div className="floating-window-header-middle"
             onMouseDown={(event) => startDrag(event, ref, windowEnum.edstOutage)}
        >
          OUTAGE
        </div>
        <div className="floating-window-header-right" onMouseDown={() => dispatch(closeWindow(windowEnum.edstOutage))}>
          <div className="floating-window-header-block-8-2"/>
        </div>
      </div>
      <div className="floating-window-body">
        OUTAGE TEST
      </div>
    </div>
  );
}