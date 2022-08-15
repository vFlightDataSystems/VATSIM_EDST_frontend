import React, { useRef, useState } from "react";
import styled from "styled-components";
import { useEventListener } from "usehooks-ts";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { airmetSelector, setSigmetAcknowledged } from "../../redux/slices/weatherSlice";
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
import { ScrollContainer } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { WindowPosition } from "../../types/windowPosition";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../enums/edstWindow";

enum giOption {
  printAll = "PRINT ALL"
}

const GIDiv = styled(FloatingWindowDiv)`
  width: 1200px;
`;

export const GIWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.GI));
  const airmetMap = useRootSelector(airmetSelector);
  const zStack = useRootSelector(zStackSelector);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [, setSelectedPos] = useState<WindowPosition | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.GI, "mousedown");

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, airmetId: string) => {
    setShowOptions(false);
    if (selectedOption !== airmetId) {
      if (!airmetMap[airmetId].acknowledged) {
        dispatch(setSigmetAcknowledged({ id: airmetId, value: true }));
      }
      setSelectedOption(airmetId);
      // figure out how to align this correctly :/
      setSelectedPos({
        x: event.currentTarget.offsetLeft,
        y: event.currentTarget.clientTop - 1,
        w: event.currentTarget.clientWidth + 23
      });
    } else {
      setSelectedOption(null);
      setSelectedPos(null);
    }
  };

  const handleOptionsMouseDown = () => {
    setSelectedOption(null);
    setShowOptions(true);
  };

  return (
    pos && (
      <GIDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.GI)}
        onMouseDown={() => zStack.indexOf(EdstWindow.GI) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.GI))}
        anyDragging={anyDragging}
        id="edst-status"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDiv20 onMouseDown={handleOptionsMouseDown}>M</FloatingWindowHeaderColDiv20>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>General Information</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(EdstWindow.GI))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDiv20>
        </FloatingWindowHeaderDiv>
        {Object.values(airmetMap).length > 0 && (
          <FloatingWindowBodyDiv>
            <ScrollContainer maxHeight={600}>
              {Object.entries(airmetMap).map(([airmetId, airmetEntry]) => (
                <span style={{ margin: "6px 0" }} key={`gi-list-key-${airmetId}`}>
                  <FloatingWindowRow selected={selectedOption === airmetId} onMouseDown={event => handleEntryMouseDown(event, airmetId)}>
                    {airmetEntry.text}
                  </FloatingWindowRow>
                </span>
              ))}
            </ScrollContainer>
          </FloatingWindowBodyDiv>
        )}
        {showOptions && (
          <FloatingWindowOptions
            pos={{
              x: ref.current!.clientLeft + ref.current!.clientWidth,
              y: ref.current!.clientTop
            }}
            header="GI"
            selectedOptions={[]}
            closeOptions={() => setShowOptions(false)}
            options={Object.values(giOption)}
          />
        )}
      </GIDiv>
    )
  );
};
