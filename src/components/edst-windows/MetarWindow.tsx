import React, { Fragment, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { delMetar, metarStateSelector } from "../../redux/slices/metarSlice";
import { FloatingWindowOptions } from "../utils/FloatingWindowOptions";
import { FloatingWindowBodyDiv, FloatingWindowDiv, FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useMetar } from "../../api/weatherApi";
import { FloatingWindowHeader } from "../utils/FloatingWindowHeader";
import { edstFontGreen } from "../../styles/colors";

const MetarDiv = styled(FloatingWindowDiv)`
  width: 400px;
`;

type MetarRowProps = {
  airport: string;
  selected: boolean;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
};
const MetarRow = ({ airport, selected, handleMouseDown }: MetarRowProps) => {
  const dispatch = useRootDispatch();
  const { data: airportMetar, isFetching } = useMetar(airport);

  useEffect(() => {
    if (!airportMetar && !isFetching) {
      dispatch(delMetar(airport));
    }
  }, [isFetching, airportMetar, dispatch, airport]);

  return !airportMetar ? null : (
    <span style={{ margin: "6px 0" }}>
      <FloatingWindowRow selected={selected} onMouseDown={handleMouseDown}>
        {airportMetar ?? "..."}
      </FloatingWindowRow>
    </span>
  );
};

export const MetarWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.METAR));
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const state = useRootSelector(metarStateSelector);
  const zStack = useRootSelector(zStackSelector);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedPos, setSelectedPos] = useState<WindowPosition | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.METAR, "mousedown");

  const options = {
    lines: `LINES ${state.lines}`,
    font: `FONT ${state.fontSize}`,
    bright: `BRIGHT ${state.brightness}`,
    printAll: "PRINT ALL"
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
      <MetarDiv
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.METAR)}
        onMouseDown={() => zStack.indexOf(EdstWindow.METAR) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.METAR))}
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
        {state.airports.length > 0 && (
          <FloatingWindowBodyDiv>
            {state.airports.map(airport => (
              <Fragment key={airport}>
                <MetarRow airport={airport} selected={selectedAirport === airport} handleMouseDown={event => handleMouseDown(event, airport)} />
                {selectedAirport === airport && selectedPos && (
                  <FloatingWindowOptions
                    pos={{
                      x: selectedPos.x + selectedPos.w!,
                      y: selectedPos.y
                    }}
                    options={{ delete: `DELETE ${airport}` }}
                    handleOptionClick={() => {
                      dispatch(delMetar(airport));
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
            header="WX"
            onClose={() => setShowOptions(false)}
            options={options}
            defaultBackgroundColor={edstFontGreen}
            backgroundColors={{
              printAll: "#000000"
            }}
          />
        )}
      </MetarDiv>
    )
  );
};
