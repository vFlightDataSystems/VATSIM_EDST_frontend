import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { zStackSelector } from "../../redux/slices/appSlice";
import { FloatingWindowOptionContainer } from "../utils/FloatingWindowOptionContainer";
import { FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useAltimeter } from "../../api/weatherApi";
import { altimeterAirportsSelector, delAltimeter } from "../../redux/slices/weatherSlice";
import { FloatingWindow } from "../utils/FloatingWindow";
import { mod } from "../../utils/mod";
import { windowOptionsSelector } from "../../redux/slices/windowOptionsSlice";
import { Nullable } from "../../typeDefinitions/utility-types";

const AltimCol = styled.span<{ underline?: boolean; isReportingStation?: boolean }>`
  margin-left: 2ch;
  ${props => props.isReportingStation && { margin: "0 2ch 0 0" }};
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
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.ALTIMETER));

  const now = new Date();
  const utcMinutesNow = now.getUTCHours() * 60 + now.getUTCMinutes();
  const observationTime = airportAltimeterEntry
    ? Number(airportAltimeterEntry.time.slice(0, 2)) * 60 + Number(airportAltimeterEntry.time.slice(2))
    : null;

  const zIndex = zStack.indexOf(EdstWindow.ALTIMETER);
  const rect = ref.current?.getBoundingClientRect();

  return (
    <>
      <FloatingWindowRow brightness={windowOptions.brightness} ref={ref} selected={selected} onMouseDown={handleMouseDown}>
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
          parentWidth={rect.width}
          zIndex={zIndex}
          parentPos={rect}
          options={{
            delete: {
              value: `DELETE ${airport}`,
              backgroundColor: "#575757",
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

  const [showOptions, setShowOptions] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Nullable<string>>(null);
  const airports = useRootSelector(altimeterAirportsSelector);
  const extraOptions = useMemo(
    () => ({
      template: { value: "TEMPLATE", backgroundColor: "#000000" }
    }),
    []
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

  const setShowOptionsHandler = (value: boolean) => {
    if (value) {
      setSelectedAirport(null);
    }
    setShowOptions(value);
  };

  return (
    <FloatingWindow
      title="ALTIM SET"
      optionsHeaderTitle="AS"
      width="24ch"
      window={EdstWindow.ALTIMETER}
      extraOptions={extraOptions}
      showOptions={showOptions}
      setShowOptions={setShowOptionsHandler}
    >
      {airports.length > 0 && (
        <>
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
        </>
      )}
    </FloatingWindow>
  );
};
