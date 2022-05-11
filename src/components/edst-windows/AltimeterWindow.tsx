import React, {useContext, useRef, useState} from 'react';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {altimeterSelector, removeAirportAltimeter} from "../../redux/slices/weatherSlice";
import {FloatingWindowOptions} from "./FloatingWindowOptions";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock,
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv, FloatingWindowRow
} from "../../styles/floatingWindowStyles";
import styled from "styled-components";

const AltimCol = styled.span<{underline?: boolean, reportingStation?: boolean}>`
  margin: 0 4px;
  ${props => props.reportingStation && {margin: "0 20px 0 12px"}};
  ${props => props.underline && {"text-decoration": "underline"}};
`;

export const AltimeterWindow: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(windowEnum.altimeter));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number, y: number, w: number } | null>(null);
  const altimeterList = useRootSelector(altimeterSelector);
  const zStack = useRootSelector(zStackSelector);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);
  const now = new Date();
  const utcMinutesNow = now.getUTCHours() * 60 + now.getUTCMinutes();

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

  return pos && (<FloatingWindowDiv
    width={180}
    pos={pos}
    zIndex={zStack.indexOf(windowEnum.altimeter)}
    onMouseDown={() => zStack.indexOf(windowEnum.altimeter) > 0 && dispatch(pushZStack(windowEnum.altimeter))}
    ref={ref}
    id="edst-altimeter"
  >
  <FloatingWindowHeaderDiv>
    <FloatingWindowHeaderColDiv width={20}>M</FloatingWindowHeaderColDiv>
    <FloatingWindowHeaderColDiv
      flexGrow={1}
      onMouseDown={(event) => startDrag(event, ref, windowEnum.altimeter)}
    >
      ALTIM SET
    </FloatingWindowHeaderColDiv>
    <FloatingWindowHeaderColDiv width={20} onMouseDown={() => dispatch(closeWindow(windowEnum.altimeter))}>
      <FloatingWindowHeaderBlock width={8} height={2} />
    </FloatingWindowHeaderColDiv>
  </FloatingWindowHeaderDiv>
{
  Object.values(altimeterList).length > 0 && <FloatingWindowBodyDiv>
    {Object.entries(altimeterList).map(([airport, airportAltimeterEntry]) => {
      const observationTime = Number(airportAltimeterEntry.time.slice(0, 2)) * 60 + Number(airportAltimeterEntry.time.slice(2));
      return (<div key={`altimeter-list-key-${airport}`}>
        <FloatingWindowRow
          selected={selected === airport}
          onMouseDown={(event) => handleMouseDown(event, airport)}
          key={`altimeter-list-key-${airport}`}
        >
          <AltimCol reportingStation={true}>{airportAltimeterEntry.airport}</AltimCol>
          <AltimCol underline={(((Number(utcMinutesNow) - observationTime) + 1440) % 1440) > 60}>{airportAltimeterEntry.time}</AltimCol>
          {(((Number(utcMinutesNow) - observationTime) + 1440) % 1440) > 120 ? '-M-' :
            <AltimCol underline={Number(airportAltimeterEntry.altimeter) < 2992}>
              {airportAltimeterEntry.altimeter.slice(1)}
            </AltimCol>}
        </FloatingWindowRow>
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
      </div>);
    })}
  </FloatingWindowBodyDiv>
}
  </FloatingWindowDiv >
  );
};
