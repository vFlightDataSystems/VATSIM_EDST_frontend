import React, { useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { airmetSelector, setSigmetAcknowledged } from "../../redux/slices/weatherSlice";
import { FloatingWindowOptionContainer, FloatingWindowOptions } from "../utils/FloatingWindowOptionContainer";
import { FloatingWindowBodyDiv, FloatingWindowDiv, FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { ScrollContainer } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { FloatingWindowHeader } from "../utils/FloatingWindowHeader";
import { windowOptionsSelector } from "../../redux/slices/windowOptionsSlice";
import { useWindowOptionClickHandler } from "../../hooks/useWindowOptionClickHandler";
import { optionsBackgroundGreen } from "../../styles/colors";

const GIDiv = styled(FloatingWindowDiv)`
  width: 1200px;
`;

export const GIWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.GI));
  const airmetMap = useRootSelector(airmetSelector);
  const zStack = useRootSelector(zStackSelector);
  const [selectedAirmet, setSelectedAirmet] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.GI, "mousedown");

  const [showOptions, setShowOptions] = useState(false);
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.GI));
  const windowOptionClickHandler = useWindowOptionClickHandler(EdstWindow.GI);

  const options: FloatingWindowOptions = {
    lines: { value: `LINES ${windowOptions.lines}` },
    font: {
      value: `FONT ${windowOptions.fontSize}`,
      onMouseDown: event => windowOptionClickHandler(event, "fontSize")
    },
    bright: { value: `BRIGHT ${windowOptions.brightness}`, onMouseDown: event => windowOptionClickHandler(event, "brightness") },
    printAll: { value: "PRINT ALL" }
  };

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, airmetId: string) => {
    setShowOptions(false);
    if (selectedAirmet !== airmetId) {
      if (!airmetMap[airmetId].acknowledged) {
        dispatch(setSigmetAcknowledged({ id: airmetId, value: true }));
      }
      setSelectedAirmet(airmetId);
    } else {
      setSelectedAirmet(null);
    }
  };

  const handleOptionsMouseDown = () => {
    setShowOptions(true);
  };

  const zIndex = zStack.indexOf(EdstWindow.GI);

  return (
    pos && (
      <GIDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.GI)}
        onMouseDown={() => zIndex < zStack.length - 1 && dispatch(pushZStack(EdstWindow.GI))}
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
        {showOptions && ref.current && (
          <FloatingWindowOptionContainer
            pos={{
              x: pos.x + ref.current.clientWidth,
              y: pos.y
            }}
            zIndex={zIndex}
            header="GI"
            onClose={() => setShowOptions(false)}
            options={options}
            defaultBackgroundColor={optionsBackgroundGreen}
            backgroundColors={{
              printAll: "#000000"
            }}
          />
        )}
      </GIDiv>
    )
  );
};
