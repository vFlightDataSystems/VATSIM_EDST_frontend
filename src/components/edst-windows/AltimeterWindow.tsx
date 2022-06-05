import React, { useRef, useState } from "react";
import styled from "styled-components";
import { EdstWindow } from "../../namespaces";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { altimeterSelector, removeAirportAltimeter } from "../../redux/slices/weatherSlice";
import { FloatingWindowOptions } from "./FloatingWindowOptions";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock8x2,
  FloatingWindowHeaderColDiv20,
  FloatingWindowHeaderColDivFlex,
  FloatingWindowHeaderDiv,
  FloatingWindowRow
} from "../../styles/floatingWindowStyles";
import { useDragging } from "../../hooks";
import { EdstDraggingOutline } from "../../styles/draggingStyles";

const AltimeterDiv = styled(FloatingWindowDiv)`
  width: 180px;
`;

const AltimCol = styled.span<{ underline?: boolean; reportingStation?: boolean }>`
  margin: 0 4px;
  ${props => props.reportingStation && { margin: "0 20px 0 12px" }};
  ${props => props.underline && { "text-decoration": "underline" }};
`;

export const AltimeterWindow: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.ALTIMETER));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number; y: number; w: number } | null>(null);
  const altimeterList = useRootSelector(altimeterSelector);
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef(null);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.ALTIMETER);

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

  return (
    pos && (
      <AltimeterDiv
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.ALTIMETER)}
        onMouseDown={() => zStack.indexOf(EdstWindow.ALTIMETER) > 0 && dispatch(pushZStack(EdstWindow.ALTIMETER))}
        ref={ref}
        anyDragging={anyDragging}
        id="edst-altimeter"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseDown={stopDrag} />}
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDiv20>M</FloatingWindowHeaderColDiv20>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>ALTIM SET</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(EdstWindow.ALTIMETER))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDiv20>
        </FloatingWindowHeaderDiv>
        {Object.values(altimeterList).length > 0 && (
          <FloatingWindowBodyDiv>
            {Object.entries(altimeterList).map(([airport, airportAltimeterEntry]) => {
              const observationTime = Number(airportAltimeterEntry.time.slice(0, 2)) * 60 + Number(airportAltimeterEntry.time.slice(2));
              return (
                <div key={`altimeter-list-key-${airport}`}>
                  <FloatingWindowRow
                    selected={selected === airport}
                    onMouseDown={event => handleMouseDown(event, airport)}
                    key={`altimeter-list-key-${airport}`}
                  >
                    <AltimCol reportingStation>{airportAltimeterEntry.airport}</AltimCol>
                    <AltimCol underline={(Number(utcMinutesNow) - observationTime + 1440) % 1440 > 60}>{airportAltimeterEntry.time}</AltimCol>
                    {(Number(utcMinutesNow) - observationTime + 1440) % 1440 > 120 ? (
                      "-M-"
                    ) : (
                      <AltimCol underline={Number(airportAltimeterEntry.altimeter) < 2992}>{airportAltimeterEntry.altimeter.slice(1)}</AltimCol>
                    )}
                  </FloatingWindowRow>
                  {selected === airport && selectedPos && (
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
                    />
                  )}
                </div>
              );
            })}
          </FloatingWindowBodyDiv>
        )}
      </AltimeterDiv>
    )
  );
};
