import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {altimeterSelector, removeAirportAltimeter} from "../../redux/slices/weatherSlice";
import {FloatingWindowOptions} from "./FloatingWindowOptions";

export const AltimeterWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.altimeter));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number, y: number, w: number } | null>(null);
  const altimeterList = useAppSelector(altimeterSelector);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);
  const now = new Date();
  const utcMinutesNow = now.getUTCHours()*60 + now.getUTCMinutes();
  console.log(utcMinutesNow);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, airport: string) => {
    if (selected !== airport) {
      setSelected(airport);
      setSelectedPos({
        x: event.currentTarget.offsetLeft,
        y: event.currentTarget.offsetTop,
        w: event.currentTarget.offsetWidth
      });
    } else {
      setSelected(null);
      setSelectedPos(null);
    }
  };

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
          <div className="floating-window-header-block-6-2"/>
        </div>
      </div>
      {Object.values(altimeterList).length > 0 && <div className="floating-window-body">
        {Object.entries(altimeterList).map(([airport, airportAltimeterEntry]) => {
          const observationTime = Number(airportAltimeterEntry.time.slice(0, 2))*60 + Number(airportAltimeterEntry.time.slice(2));
          return (<span className="floating-window-outer-row" key={`altimeter-list-key-${airport}`}>
            <div className={`floating-window-row margin no-select ${selected === airport ? 'selected' : ''}`}
                 onMouseDown={(event) => handleMouseDown(event, airport)}
            >
            {airportAltimeterEntry.airport}&nbsp;
              <span className={(Number(utcMinutesNow) - observationTime) > 60 ? 'altim-underline' : ''}>{airportAltimeterEntry.time}</span>
              &nbsp;
              {(Number(utcMinutesNow) - observationTime) > 120 ? '-M-' :
              <span className={Number(airportAltimeterEntry.altimeter) < 2992 ? 'altim-underline' : ''}>
                {airportAltimeterEntry.altimeter.slice(1)}
              </span>}
          </div>
            {selected === airport && selectedPos &&
            <FloatingWindowOptions
              pos={{
                x: selectedPos.x + selectedPos.w,
                y: selectedPos.y
              }}
              options={[`DELETE ${airport}`]}
              handleOptionClick={() => {
                dispatch(removeAirportAltimeter(airport));
                setSelected(null);
                setSelectedPos(null);
              }}
            />}
          </span>);
        })}
      </div>}
    </div>
  );
};