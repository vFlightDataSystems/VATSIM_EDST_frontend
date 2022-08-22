import React, { useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { delMetar, metarAirportsSelector } from "../../redux/slices/weatherSlice";
import { FloatingWindowOptions } from "./FloatingWindowOptions";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock8x2,
  FloatingWindowHeaderColDivFlex,
  FloatingWindowHeaderColDiv20,
  FloatingWindowHeaderDiv,
  FloatingWindowRow
} from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { WindowPosition } from "../../types/windowPosition";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../enums/edstWindow";
import { useMetar } from "../../api/weatherApi";

const MetarDiv = styled(FloatingWindowDiv)`
  width: 400px;
`;

type MetarRowProps = {
  airport: string;
  selected: boolean;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
};
const MetarRow = ({ airport, selected, handleMouseDown }: MetarRowProps) => {
  const airportMetar = useMetar(airport);

  return !airportMetar ? null : (
    <span style={{ margin: "6px 0" }}>
      <FloatingWindowRow selected={selected} onMouseDown={handleMouseDown}>
        {airportMetar}
      </FloatingWindowRow>
    </span>
  );
};

export const MetarWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.METAR));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<WindowPosition | null>(null);
  const metarAirports = useRootSelector(metarAirportsSelector);
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.METAR, "mousedown");

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
      <MetarDiv
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.METAR)}
        onMouseDown={() => zStack.indexOf(EdstWindow.METAR) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.METAR))}
        ref={ref}
        anyDragging={anyDragging}
        id="edst-status"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDiv20>M</FloatingWindowHeaderColDiv20>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>WX</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(EdstWindow.METAR))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDiv20>
        </FloatingWindowHeaderDiv>
        {metarAirports.length > 0 && (
          <FloatingWindowBodyDiv>
            {metarAirports.map(airport => (
              <>
                <MetarRow
                  key={airport}
                  airport={airport}
                  selected={selected === airport}
                  handleMouseDown={event => handleMouseDown(event, airport)}
                />
                {selected === airport && selectedPos && (
                  <FloatingWindowOptions
                    pos={{
                      x: selectedPos.x + selectedPos.w!,
                      y: selectedPos.y
                    }}
                    options={[`DELETE ${airport}`]}
                    handleOptionClick={() => {
                      dispatch(delMetar(airport));
                      setSelected(null);
                      setSelectedPos(null);
                    }}
                  />
                )}
              </>
            ))}
          </FloatingWindowBodyDiv>
        )}
      </MetarDiv>
    )
  );
};
