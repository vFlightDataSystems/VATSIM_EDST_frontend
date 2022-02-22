import React, {useContext, useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {metarSelector} from "../../redux/slices/weatherSlice";

export const MetarWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.metar));
  const metarList = useAppSelector(metarSelector);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  return pos && (<div className="floating-window metar-window"
               ref={ref}
               id="edst-status"
               style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <div className="floating-window-header no-select">
        <div className="floating-window-header-left">
          M
        </div>
        <div className="floating-window-header-middle"
             onMouseDown={(event) => startDrag(event, ref, windowEnum.metar)}
        >
          WX
        </div>
        <div className="floating-window-header-right" onMouseDown={() => dispatch(closeWindow(windowEnum.metar))}>
          <div className="floating-window-header-block-8-2"/>
        </div>
      </div>
      {Object.values(metarList).length > 0 && <div className="floating-window-body">
        {Object.values(metarList).map((airportAltimeterEntry) => <div className="floating-window-row no-select margin">
          {airportAltimeterEntry.metar}
        </div>)}
      </div>}
    </div>
  );
}