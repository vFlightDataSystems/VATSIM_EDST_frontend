import React, { Fragment, useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { FloatingWindowOptions } from "./FloatingWindowOptions";
import { FloatingWindowBodyDiv, FloatingWindowDiv, FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { mod } from "../../lib";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useAltimeter } from "../../api/weatherApi";
import { altimeterStateSelector, delAltimeter } from "../../redux/slices/altimeterSlice";
import { FloatingWindowHeader } from "../utils/FloatingWindowHeader";
import { edstFontGreen } from "../../styles/colors";

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

  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const state = useRootSelector(altimeterStateSelector);
  const zStack = useRootSelector(zStackSelector);
  const [showOptions, setShowOptions] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [selectedPos, setSelectedPos] = useState<WindowPosition | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.ALTIMETER, "mousedown");

  const options = {
    lines: `LINES ${state.lines}`,
    columns: `COL ${state.columns}`,
    font: `FONT ${state.fontSize}`,
    bright: `BRIGHT ${state.brightness}`,
    template: "TEMPLATE"
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, airport: string) => {
    if (selectedAirport !== airport) {
      setSelectedAirport(airport);
      setSelectedPos({
        x: event.currentTarget.offsetLeft,
        y: event.currentTarget.offsetTop,
        w: event.currentTarget.offsetWidth
      });
    } else {
      setSelectedAirport(null);
      setSelectedPos(null);
    }
  };

  const handleOptionsMouseDown = () => {
    setShowOptions(true);
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
        <FloatingWindowHeader
          title="ALTIM SET"
          handleOptionsMouseDown={handleOptionsMouseDown}
          onClose={() => dispatch(closeWindow(EdstWindow.ALTIMETER))}
          startDrag={startDrag}
        />
        {state.airports.length > 0 && (
          <FloatingWindowBodyDiv>
            {state.airports.map(airport => (
              <Fragment key={airport}>
                <AltimeterRow airport={airport} selected={selectedAirport === airport} handleMouseDown={event => handleMouseDown(event, airport)} />
                {selectedAirport === airport && selectedPos && (
                  <FloatingWindowOptions
                    pos={{
                      x: selectedPos.x + selectedPos.w!,
                      y: selectedPos.y
                    }}
                    options={{ delete: `DELETE ${airport}` }}
                    handleOptionClick={() => {
                      dispatch(delAltimeter(airport));
                      setSelectedAirport(null);
                      setSelectedPos(null);
                    }}
                  />
                )}
              </Fragment>
            ))}
          </FloatingWindowBodyDiv>
        )}
        {showOptions && (
          <FloatingWindowOptions
            pos={{
              x: ref.current!.clientLeft + ref.current!.clientWidth,
              y: ref.current!.clientTop
            }}
            header="AS"
            closeOptions={() => setShowOptions(false)}
            options={options}
            defaultBackgroundColor={edstFontGreen}
            backgroundColors={{
              template: "#000000"
            }}
          />
        )}
      </AltimeterDiv>
    )
  );
};
