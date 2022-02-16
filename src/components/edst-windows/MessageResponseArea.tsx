import React, {useContext, useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppSelector} from "../../redux/hooks";
import {mraMsgSelector, windowPositionSelector} from "../../redux/slices/appSlice";

export const MessageResponseArea: React.FC = () => {
  const pos = useAppSelector(windowPositionSelector(windowEnum.edstMra));
  const msg = useAppSelector(mraMsgSelector);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  return pos && (<div className="floating-window mra no-select"
               ref={ref}
               id="edst-mra"
               style={{left: pos.x + "px", top: pos.y + "px"}}
               onMouseDown={(event) => startDrag(event, ref, windowEnum.edstMra)}
    >
      {msg}
    </div>
  );
}