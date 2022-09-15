import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { FloatingWindowOptions, FloatingWindowOptionContainer } from "../utils/FloatingWindowOptionContainer";
import { FloatingWindowBodyDiv, FloatingWindowDiv, FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { mod } from "../../lib";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useAltimeter } from "../../api/weatherApi";
import { FloatingWindowHeader } from "../utils/FloatingWindowHeader";
import { optionsBackgroundGreen } from "../../styles/colors";
import { altimeterAirportsSelector, delAltimeter } from "../../redux/slices/weatherSlice";
import { windowOptionsSelector } from "../../redux/slices/windowOptionsSlice";
import { useWindowOptionClickHandler } from "../../hooks/useWindowOptionClickHandler";

const AltimeterDiv = styled(FloatingWindowDiv)`
  min-width: 200px;
`;

const AltimCol = styled.span<{ underline?: boolean; isReportingStation?: boolean }>`
  margin: 0 4px;
  ${props => props.isReportingStation && { margin: "0 20px 0 12px" }};
  ${props => props.underline && { "text-decoration": "underline" }};
`;

type AltimeterRowProps = {
  airport: string;
  selected: boolean;
  onDelete: () => void;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
};

const AltimeterRow = ({ airport, selected, handleMouseDown, onDelete }: AltimeterRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const { data: airportAltimeterEntry } = useAltimeter(airport);

  const now = new Date();
  const utcMinutesNow = now.getUTCHours() * 60 + now.getUTCMinutes();
  const observationTime = airportAltimeterEntry
    ? Number(airportAltimeterEntry.time.slice(0, 2)) * 60 + Number(airportAltimeterEntry.time.slice(2))
    : null;

  const zIndex = zStack.indexOf(EdstWindow.ALTIMETER);
  const rect = ref.current?.getBoundingClientRect();

  return (
    <>
      <FloatingWindowRow ref={ref} selected={selected} onMouseDown={handleMouseDown}>
        {airport && (
          <>
            <AltimCol isReportingStation>{airport}</AltimCol>
            <AltimCol underline={observationTime ? mod(Number(utcMinutesNow) - observationTime, 1440) > 60 : false}>
              {airportAltimeterEntry?.time ?? ""}
            </AltimCol>
            {!airportAltimeterEntry || (observationTime && mod(Number(utcMinutesNow) - observationTime, 1440) > 120) ? (
              "-M-"
            ) : (
              <AltimCol underline={Number(airportAltimeterEntry.altimeter) < 2992}>{airportAltimeterEntry.altimeter.slice(1)}</AltimCol>
            )}
          </>
        )}
      </FloatingWindowRow>
      {selected && rect && (
        <FloatingWindowOptionContainer
          zIndex={zIndex}
          pos={{
            x: rect.left + rect.width,
            y: rect.top
          }}
          defaultBackgroundColor="#575757"
          options={{
            delete: {
              value: `DELETE ${airport}`,
              onMouseDown: onDelete
            }
          }}
        />
      )}
    </>
  );
};

export const AltimeterWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.ALTIMETER));

  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const airports = useRootSelector(altimeterAirportsSelector);
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.ALTIMETER, "mousedown");

  const [showOptions, setShowOptions] = useState(false);
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.ALTIMETER));
  const windowOptionClickHandler = useWindowOptionClickHandler(EdstWindow.ALTIMETER);

  const options: FloatingWindowOptions = useMemo(
    () => ({
      lines: { value: `LINES ${windowOptions.lines}` },
      columns: { value: `COL ${windowOptions.columns}` },
      font: {
        value: `FONT ${windowOptions.fontSize}`,
        onMouseDown: event => windowOptionClickHandler(event, "fontSize")
      },
      bright: { value: `BRIGHT ${windowOptions.brightness}`, onMouseDown: event => windowOptionClickHandler(event, "brightness") },
      template: {
        value: "TEMPLATE"
      }
    }),
    [windowOptionClickHandler, windowOptions.brightness, windowOptions.columns, windowOptions.fontSize, windowOptions.lines]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, airport: string) => {
      setShowOptions(false);
      if (selectedAirport !== airport) {
        setSelectedAirport(airport);
      } else {
        setSelectedAirport(null);
      }
    },
    [selectedAirport]
  );

  const handleOptionsMouseDown = () => {
    setShowOptions(true);
  };

  const zIndex = zStack.indexOf(EdstWindow.ALTIMETER);

  return (
    pos && (
      <AltimeterDiv
        pos={pos}
        zIndex={zIndex}
        onMouseDown={() => zIndex < zStack.length - 1 && dispatch(pushZStack(EdstWindow.ALTIMETER))}
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
        {airports.length > 0 && (
          <FloatingWindowBodyDiv>
            {airports.map(airport => (
              <AltimeterRow
                key={airport}
                airport={airport}
                selected={selectedAirport === airport}
                handleMouseDown={event => handleMouseDown(event, airport)}
                onDelete={() => {
                  dispatch(delAltimeter(airport));
                  setSelectedAirport(null);
                }}
              />
            ))}
          </FloatingWindowBodyDiv>
        )}
        {showOptions && ref.current && (
          <FloatingWindowOptionContainer
            pos={{
              x: pos.x + ref.current.clientWidth,
              y: pos.y
            }}
            zIndex={zIndex}
            header="AS"
            onClose={() => setShowOptions(false)}
            options={options}
            defaultBackgroundColor={optionsBackgroundGreen}
            backgroundColors={{
              template: "#000000"
            }}
          />
        )}
      </AltimeterDiv>
    )
  );
};
