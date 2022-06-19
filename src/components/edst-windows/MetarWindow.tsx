import React, { useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { metarSelector, removeAirportMetar } from "../../redux/slices/weatherSlice";
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
import { useDragging } from "../../hooks/utils";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { EdstWindow } from "../../namespaces";

const MetarDiv = styled(FloatingWindowDiv)`
  width: 400px;
`;

export const MetarWindow: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.METAR));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number; y: number; w: number } | null>(null);
  const metarList = useRootSelector(metarSelector);
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef(null);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.METAR);

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
        onMouseDown={() => zStack.indexOf(EdstWindow.METAR) > 0 && dispatch(pushZStack(EdstWindow.METAR))}
        ref={ref}
        anyDragging={anyDragging}
        id="edst-status"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseDown={stopDrag} />}
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDiv20>M</FloatingWindowHeaderColDiv20>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>WX</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(EdstWindow.METAR))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDiv20>
        </FloatingWindowHeaderDiv>
        {Object.values(metarList).length > 0 && (
          <FloatingWindowBodyDiv>
            {Object.entries(metarList).map(([airport, airportMetarEntry]) => (
              <span style={{ margin: "6px 0" }} key={`metar-list-key-${airport}`}>
                <FloatingWindowRow selected={selected === airport} onMouseDown={event => handleMouseDown(event, airport)}>
                  {airportMetarEntry.metar}
                </FloatingWindowRow>
                {selected === airport && selectedPos && (
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
                  />
                )}
              </span>
            ))}
          </FloatingWindowBodyDiv>
        )}
      </MetarDiv>
    )
  );
};
