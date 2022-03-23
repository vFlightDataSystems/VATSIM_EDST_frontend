import React, {useContext, useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, setShowSectorSelector, windowPositionSelector} from "../../redux/slices/appSlice";
import {EdstButton} from "../resources/EdstButton";
import {
  FloatingWindowHeaderBlock,
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";

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
      <FloatingWindowHeaderDiv>
        <FloatingWindowHeaderColDiv width={20}>M</FloatingWindowHeaderColDiv>
        <FloatingWindowHeaderColDiv
          flexGrow={1}
          onMouseDown={(event) => startDrag(event, ref, windowEnum.status)}
        >
          STATUS
        </FloatingWindowHeaderColDiv>
        <FloatingWindowHeaderColDiv width={20} onMouseDown={() => dispatch(closeWindow(windowEnum.status))}>
          <FloatingWindowHeaderBlock width={8} height={2}/>
        </FloatingWindowHeaderColDiv>
      </FloatingWindowHeaderDiv>
      <div className="floating-window-body status-body">
        <EdstButton className="floating-window-outer-row" onMouseDown={() => dispatch(setShowSectorSelector(true))}>
          Change Sectors
        </EdstButton>
        <div className="floating-window-outer-row">
          Submit Feedback <a href={"https://forms.gle/LpzgyNMNMwa8CY8e8"} target="_blank" rel="noreferrer">here</a>
        </div>
        <div className="floating-window-outer-row">
          <a href={"https://github.com/CaptainTux/VATSIM_EDST_frontend/wiki"} target="_blank" rel="noreferrer">Roadmap</a>
        </div>
      </div>
    </div>
  );
};