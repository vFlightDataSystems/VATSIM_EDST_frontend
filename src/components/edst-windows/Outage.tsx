import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import React, {FunctionComponent, useContext, useRef} from "react";
import {EdstContext} from "../../contexts/contexts";

interface OutageProps {
  pos: {x: number, y: number};
  closeWindow: () => void;
}

export const Outage: FunctionComponent<OutageProps> = ({pos, closeWindow}) => {
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  return (<div className="floating-window outage-window"
               ref={ref}
               id="edst-outage"
               style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <div className="floating-window-header no-select">
        <div className="floating-window-header-left">
          M
        </div>
        <div className="floating-window-header-middle"
             onMouseDown={(event) => startDrag(event, ref)}
        >
          OUTAGE
        </div>
        <div className="floating-window-header-right" onMouseDown={closeWindow}>
          <div className="floating-window-header-block-8-2"/>
        </div>
      </div>
      <div className="floating-window-body">
        OUTAGE TEST
      </div>
    </div>
  );
}