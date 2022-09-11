import React, { Fragment, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { delMetar, metarAirportsSelector } from "../../redux/slices/metarSlice";
import { FloatingWindowOptions } from "./FloatingWindowOptions";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock8x2,
  FloatingWindowHeaderColDivFlex,
  FloatingWindowHeaderColDivRect,
  FloatingWindowHeaderDiv,
  FloatingWindowRow
} from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
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
          <FloatingWindowHeaderColDivRect>M</FloatingWindowHeaderColDivRect>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>WX</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDivRect onMouseDown={() => dispatch(closeWindow(EdstWindow.METAR))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDivRect>
        </FloatingWindowHeaderDiv>
        {metarAirports.length > 0 && (
          <FloatingWindowBodyDiv>
            {metarAirports.map(airport => (
              <Fragment key={airport}>
                <MetarRow airport={airport} selected={selected === airport} handleMouseDown={event => handleMouseDown(event, airport)} />
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
              </Fragment>
            ))}
          </FloatingWindowBodyDiv>
        )}
      </MetarDiv>
    )
  );
};
