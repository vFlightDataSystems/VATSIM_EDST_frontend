import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { FloatingWindowOptionContainer, FloatingWindowOptions } from "../utils/FloatingWindowOptionContainer";
import { FloatingWindowBodyDiv, FloatingWindowDiv, FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useMetar } from "../../api/weatherApi";
import { FloatingWindowHeader } from "../utils/FloatingWindowHeader";
import { optionsBackgroundGreen } from "../../styles/colors";
import { delMetar, metarAirportsSelector } from "../../redux/slices/weatherSlice";
import { windowOptionsSelector } from "../../redux/slices/windowOptionsSlice";
import { useWindowOptionClickHandler } from "../../hooks/useWindowOptionClickHandler";

const MetarDiv = styled(FloatingWindowDiv)`
  width: 400px;
`;

const MetarRowDiv = styled(FloatingWindowRow)`
  margin: 10px 21px 0 0;
`;

type MetarRowProps = {
  airport: string;
  selected: boolean;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onDelete: () => void;
};
const MetarRow = ({ airport, selected, handleMouseDown, onDelete }: MetarRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const { data: airportMetar, isFetching } = useMetar(airport);

  useEffect(() => {
    if (!airportMetar && !isFetching) {
      dispatch(delMetar(airport));
    }
  }, [isFetching, airportMetar, dispatch, airport]);

  const zIndex = zStack.indexOf(EdstWindow.METAR);
  const rect = ref.current?.getBoundingClientRect();

  return !airportMetar ? null : (
    <>
      <MetarRowDiv ref={ref} selected={selected} onMouseDown={handleMouseDown}>
        {airportMetar ?? "..."}
      </MetarRowDiv>
      {selected && rect && (
        <FloatingWindowOptionContainer
          pos={{
            x: rect.left + rect.width,
            y: rect.top
          }}
          zIndex={zIndex}
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

export const MetarWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.METAR));
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const airports = useRootSelector(metarAirportsSelector);
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.METAR, "mousedown");

  const [showOptions, setShowOptions] = useState(false);
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.METAR));
  const windowOptionClickHandler = useWindowOptionClickHandler(EdstWindow.METAR);

  const options: FloatingWindowOptions = useMemo(
    () => ({
      lines: { value: `LINES ${windowOptions.lines}` },
      font: {
        value: `FONT ${windowOptions.fontSize}`,
        onMouseDown: event => windowOptionClickHandler(event, "fontSize")
      },
      bright: { value: `BRIGHT ${windowOptions.brightness}`, onMouseDown: event => windowOptionClickHandler(event, "brightness") },
      printAll: { value: "PRINT ALL" }
    }),
    [windowOptionClickHandler, windowOptions.brightness, windowOptions.fontSize, windowOptions.lines]
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

  const zIndex = zStack.indexOf(EdstWindow.METAR);

  return (
    pos && (
      <MetarDiv
        pos={pos}
        zIndex={zIndex}
        onMouseDown={() => zIndex < zStack.length - 1 && dispatch(pushZStack(EdstWindow.METAR))}
        ref={ref}
        anyDragging={anyDragging}
        id="edst-status"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <FloatingWindowHeader
          title="WX"
          handleOptionsMouseDown={handleOptionsMouseDown}
          onClose={() => dispatch(closeWindow(EdstWindow.METAR))}
          startDrag={startDrag}
        />
        {airports.length > 0 && (
          <FloatingWindowBodyDiv>
            {airports.map(airport => (
              <MetarRow
                key={airport}
                airport={airport}
                selected={selectedAirport === airport}
                handleMouseDown={event => handleMouseDown(event, airport)}
                onDelete={() => {
                  dispatch(delMetar(airport));
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
            header="WX"
            onClose={() => setShowOptions(false)}
            options={options}
            defaultBackgroundColor={optionsBackgroundGreen}
            backgroundColors={{
              printAll: "#000000"
            }}
          />
        )}
      </MetarDiv>
    )
  );
};
