import React, { useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { airmetSelector, setSigmetAcknowledged } from "../../redux/slices/weatherSlice";
import { FloatingWindowOptions } from "./FloatingWindowOptions";
import { FloatingWindowBodyDiv, FloatingWindowDiv, FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { ScrollContainer } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { FloatingWindowHeader } from "../utils/FloatingWindowHeader";

const GiOptions = {
  printAll: "PRINT ALL"
};

const GIDiv = styled(FloatingWindowDiv)`
  width: 1200px;
`;

export const GIWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.GI));
  const airmetMap = useRootSelector(airmetSelector);
  const zStack = useRootSelector(zStackSelector);
  const [selectedAirmet, setSelectedAirmet] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [, setSelectedPos] = useState<WindowPosition | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.GI, "mousedown");

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, airmetId: string) => {
    setShowOptions(false);
    if (selectedAirmet !== airmetId) {
      if (!airmetMap[airmetId].acknowledged) {
        dispatch(setSigmetAcknowledged({ id: airmetId, value: true }));
      }
      setSelectedAirmet(airmetId);
      // figure out how to align this correctly :/
      setSelectedPos({
        x: event.currentTarget.offsetLeft,
        y: event.currentTarget.clientTop - 1,
        w: event.currentTarget.clientWidth + 23
      });
    } else {
      setSelectedAirmet(null);
      setSelectedPos(null);
    }
  };

  const handleOptionsMouseDown = () => {
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
        <FloatingWindowHeader
          title="General Information"
          handleOptionsMouseDown={handleOptionsMouseDown}
          onClose={() => dispatch(closeWindow(EdstWindow.GI))}
          startDrag={startDrag}
        />
        {Object.values(airmetMap).length > 0 && (
          <FloatingWindowBodyDiv>
            <ScrollContainer maxHeight="600px">
              {Object.entries(airmetMap).map(([airmetId, airmetEntry]) => (
                <span style={{ margin: "6px 0" }} key={airmetId}>
                  <FloatingWindowRow selected={selectedAirmet === airmetId} onMouseDown={event => handleEntryMouseDown(event, airmetId)}>
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
            closeOptions={() => setShowOptions(false)}
            options={GiOptions}
          />
        )}
      </GIDiv>
    )
  );
};
