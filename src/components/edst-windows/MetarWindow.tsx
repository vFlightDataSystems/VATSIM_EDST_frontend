import React, {useContext, useRef, useState} from 'react';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector, zStackSelector} from "../../redux/slices/appSlice";
import {metarSelector, removeAirportMetar} from "../../redux/slices/weatherSlice";
import {FloatingWindowOptions} from "./FloatingWindowOptions";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock,
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv, FloatingWindowRow
} from "../../styles/floatingWindowStyles";

export const MetarWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.metar));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number, y: number, w: number } | null>(null);
  const metarList = useAppSelector(metarSelector);
  const zStack = useAppSelector(zStackSelector);
  const { startDrag } = useContext(EdstContext);
  const ref = useRef(null);

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
  }

  return pos && (<FloatingWindowDiv
      width={400}
      pos={pos}
      zIndex={zStack.indexOf(windowEnum.metar)}
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
      {Object.values(metarList).length > 0 && <FloatingWindowBodyDiv>
        {Object.entries(metarList).map(([airport, airportMetarEntry]) =>
          <span style={{margin: "6px 0"}} key={`metar-list-key-${airport}`}>
            <FloatingWindowRow
              selected={selected === airport}
              onMouseDown={(event) => handleMouseDown(event, airport)}
            >
              {airportMetarEntry.metar}
            </FloatingWindowRow>
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
      </FloatingWindowBodyDiv>}
    </FloatingWindowDiv>
  );
};
