import React, {useContext, useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";

export const Status: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.status));
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  return pos && (<div className="floating-window status-window"
                      ref={ref}
                      id="edst-status"
                      style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <div className="floating-window-header no-select">
        <div className="floating-window-header-left">
          M
        </div>
        <div className="floating-window-header-middle"
             onMouseDown={(event) => startDrag(event, ref, windowEnum.status)}
        >
          STATUS
        </div>
        <div className="floating-window-header-right" onMouseDown={() => dispatch(closeWindow(windowEnum.status))}>
          <div className="floating-window-header-block-6-2"/>
        </div>
      </div>
      <div className="floating-window-body">
        <div className="floating-window-outer-row">
          Submit Feedback <a href={"https://forms.gle/LpzgyNMNMwa8CY8e8"} target="_blank" rel="noreferrer">here</a>
        </div>
        <div className="floating-window-outer-row">
          <a href={"https://github.com/CaptainTux/VATSIM_EDST_frontend/wiki"} target="_blank"
             rel="noreferrer">Roadmap</a>
        </div>
      </div>
    </div>
  );
};