import React, {useContext, useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {altimeterSelector} from "../../redux/slices/weatherSlice";

export const AltimeterWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.altimeter));
  const altimeterList = useAppSelector(altimeterSelector);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  return pos && (<div className="floating-window altimeter-window"
               ref={ref}
               id="edst-status"
               style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <div className="floating-window-header no-select">
        <div className="floating-window-header-left">
          M
        </div>
        <div className="floating-window-header-middle"
             onMouseDown={(event) => startDrag(event, ref, windowEnum.altimeter)}
        >
          ALTIM SET
        </div>
        <div className="floating-window-header-right" onMouseDown={() => dispatch(closeWindow(windowEnum.altimeter))}>
          <div className="floating-window-header-block-8-2"/>
        </div>
      </div>
      {Object.values(altimeterList).length > 0 && <div className="floating-window-body">
        {Object.values(altimeterList).map((airportAltimeterEntry) => <div className="floating-window-row no-select">
          {airportAltimeterEntry.airport} {airportAltimeterEntry.time} {airportAltimeterEntry.altimeter}
        </div>)}
      </div>}
    </div>
  );
}