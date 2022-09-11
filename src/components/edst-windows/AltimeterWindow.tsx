import React, { Fragment, useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { FloatingWindowOptions } from "./FloatingWindowOptions";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock8x2,
  FloatingWindowHeaderColDivRect,
  FloatingWindowHeaderColDivFlex,
  FloatingWindowHeaderDiv,
  FloatingWindowRow
} from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { mod } from "../../lib";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useAltimeter } from "../../api/weatherApi";
import { altimeterAirportsSelector, delAltimeter } from "../../redux/slices/altimeterSlice";

const AltimeterDiv = styled(FloatingWindowDiv)`
  width: 180px;
`;

const AltimCol = styled.span<{ underline?: boolean; reportingStation?: boolean }>`
  margin: 0 4px;
  ${props => props.reportingStation && { margin: "0 20px 0 12px" }};
  ${props => props.underline && { "text-decoration": "underline" }};
`;

type AltimeterRowProps = {
  airport: string;
  selected: boolean;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
};
const AltimeterRow = ({ airport, selected, handleMouseDown }: AltimeterRowProps) => {
  const { data: airportAltimeterEntry } = useAltimeter(airport);

  const now = new Date();
  const utcMinutesNow = now.getUTCHours() * 60 + now.getUTCMinutes();
  const observationTime = airportAltimeterEntry
    ? Number(airportAltimeterEntry.time.slice(0, 2)) * 60 + Number(airportAltimeterEntry.time.slice(2))
    : null;

  return (
    <div>
      <FloatingWindowRow selected={selected} onMouseDown={handleMouseDown}>
        <AltimCol reportingStation>{airport}</AltimCol>
        <AltimCol underline={observationTime ? mod(Number(utcMinutesNow) - observationTime, 1440) > 60 : false}>
          {airportAltimeterEntry?.time ?? ""}
        </AltimCol>
        {!airportAltimeterEntry || (observationTime && mod(Number(utcMinutesNow) - observationTime, 1440) > 120) ? (
          "-M-"
        ) : (
          <AltimCol underline={Number(airportAltimeterEntry.altimeter) < 2992}>{airportAltimeterEntry.altimeter.slice(1)}</AltimCol>
        )}
      </FloatingWindowRow>
    </div>
  );
};

export const AltimeterWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.ALTIMETER));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<WindowPosition | null>(null);
  const altimeterAirports = useRootSelector(altimeterAirportsSelector);
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.ALTIMETER, "mousedown");

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
        onMouseDown={() => zStack.indexOf(EdstWindow.ALTIMETER) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.ALTIMETER))}
        ref={ref}
        anyDragging={anyDragging}
        id="edst-altimeter"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDivRect>M</FloatingWindowHeaderColDivRect>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>ALTIM SET</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDivRect onMouseDown={() => dispatch(closeWindow(EdstWindow.ALTIMETER))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDivRect>
        </FloatingWindowHeaderDiv>
        {altimeterAirports.length > 0 && (
          <FloatingWindowBodyDiv>
            {altimeterAirports.map(airport => (
              <Fragment key={airport}>
                <AltimeterRow airport={airport} selected={selected === airport} handleMouseDown={event => handleMouseDown(event, airport)} />
                {selected === airport && selectedPos && (
                  <FloatingWindowOptions
                    pos={{
                      x: selectedPos.x + selectedPos.w!,
                      y: selectedPos.y
                    }}
                    options={[`DELETE ${airport}`]}
                    handleOptionClick={() => {
                      dispatch(delAltimeter(airport));
                      setSelected(null);
                      setSelectedPos(null);
                    }}
                  />
                )}
              </Fragment>
            ))}
          </FloatingWindowBodyDiv>
        )}
      </AltimeterDiv>
    )
  );
};
