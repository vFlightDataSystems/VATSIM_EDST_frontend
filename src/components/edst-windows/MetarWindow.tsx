import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {metarSelector, removeAirportMetar} from "../../redux/slices/weatherSlice";
import {FloatingWindowOptions} from "./FloatingWindowOptions";
import {
  FloatingWindowHeaderBlock,
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";

export const MetarWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.metar));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{x: number, y: number, w: number} | null>(null);
  const metarList = useAppSelector(metarSelector);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, airport: string) => {
    if (selected !== airport) {
      setSelected(airport);
      setSelectedPos({x: event.currentTarget.offsetLeft, y: event.currentTarget.offsetTop, w: event.currentTarget.offsetWidth});
    }
    else {
      setSelected(null);
      setSelectedPos(null);
    }
  }

  return pos && (<div className="floating-window metar-window"
                      ref={ref}
                      id="edst-status"
                      style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <FloatingWindowHeaderDiv>
        <FloatingWindowHeaderColDiv width={20}>M</FloatingWindowHeaderColDiv>
        <FloatingWindowHeaderColDiv
          flexGrow={1}
          onMouseDown={(event) => startDrag(event, ref, windowEnum.metar)}
        >
          WX
        </FloatingWindowHeaderColDiv>
        <FloatingWindowHeaderColDiv width={20} onMouseDown={() => dispatch(closeWindow(windowEnum.metar))}>
          <FloatingWindowHeaderBlock width={8} height={2}/>
        </FloatingWindowHeaderColDiv>
      </FloatingWindowHeaderDiv>
      {Object.values(metarList).length > 0 && <div className="floating-window-body">
        {Object.entries(metarList).map(([airport, airportMetarEntry]) =>
          <span className="floating-window-outer-row" key={`metar-list-key-${airport}`}>
            <div className={`floating-window-row no-select margin ${selected === airport ? 'selected' : ''}`}
                 onMouseDown={(event) => handleMouseDown(event, airport)}
            >
              {airportMetarEntry.metar}
            </div>
            {selected === airport && selectedPos &&
            <FloatingWindowOptions
              pos={{
                x: selectedPos.x + selectedPos.w,
                y: selectedPos.y
              }}
              options={[`DELETE ${airport}`]}
              handleOptionClick={() => {
                dispatch(removeAirportMetar(airport));
                setSelected(null);
                setSelectedPos(null);
              }}
            />}
          </span>)}
      </div>}
    </div>
  );
};