import React, { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import {
  setSigmetAcknowledged,
  setSigmetSuppressed,
  setViewSuppressedSigmet,
  sigmetSelector,
  viewSuppressedSigmetSelector
} from "../../redux/slices/weatherSlice";
import { FloatingWindowOptions } from "../utils/FloatingWindowOptions";
import { FloatingWindowBodyDiv, FloatingWindowDiv, FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { ScrollContainer } from "../../styles/optionMenuStyles";
import { sectorIdSelector } from "../../redux/slices/sectorSlice";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { FloatingWindowHeader } from "../utils/FloatingWindowHeader";

const SigmetDiv = styled(FloatingWindowDiv)`
  width: 1100px;
`;

export const SigmetWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.SIGMETS));
  const sectorId = useRootSelector(sectorIdSelector);
  const viewSuppressed = useRootSelector(viewSuppressedSigmetSelector);
  const sigmetList = useRootSelector(sigmetSelector);
  const zStack = useRootSelector(zStackSelector);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<WindowPosition | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.SIGMETS, "mousedown");

  const SigmetOptions = useMemo(
    () => ({
      viewSuppressed: { value: "VIEW SUPPRESS", onMouseDown: () => dispatch(setViewSuppressedSigmet(true)) },
      hideSuppressed: { value: "HIDE SUPPRESS", onMouseDown: () => dispatch(setViewSuppressedSigmet(false)) },
      printAll: { value: "PRINT ALL" }
    }),
    [dispatch]
  );

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, sigmetId: string) => {
    setShowOptions(false);
    if (selectedOption !== sigmetId) {
      if (!sigmetList[sigmetId].acknowledged) {
        dispatch(setSigmetAcknowledged({ id: sigmetId, value: true }));
      }
      setSelectedOption(sigmetId);
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
      <SigmetDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.SIGMETS)}
        onMouseDown={() => zStack.indexOf(EdstWindow.SIGMETS) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.SIGMETS))}
        anyDragging={anyDragging}
        id="edst-status"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <FloatingWindowHeader
          title={`SIGMETS SECTOR ${sectorId}`}
          handleOptionsMouseDown={handleOptionsMouseDown}
          onClose={() => dispatch(closeWindow(EdstWindow.SIGMETS))}
          startDrag={startDrag}
        />
        {Object.values(sigmetList).length > 0 && (
          <FloatingWindowBodyDiv>
            <ScrollContainer maxHeight="600px">
              {Object.entries(sigmetList).map(
                ([sigmetId, sigmetEntry]) =>
                  (!sigmetEntry.suppressed || viewSuppressed) && (
                    <span style={{ margin: "6px 0" }} key={sigmetId}>
                      <FloatingWindowRow
                        selected={selectedOption === sigmetId}
                        suppressed={sigmetEntry.suppressed}
                        onMouseDown={event => handleEntryMouseDown(event, sigmetId)}
                      >
                        {sigmetEntry.text}
                      </FloatingWindowRow>
                      {selectedOption === sigmetId && selectedPos && (
                        <FloatingWindowOptions
                          pos={{
                            x: ref.current!.clientLeft + ref.current!.clientWidth,
                            y: ref.current!.clientTop
                          }}
                          defaultBackgroundColor="#575757"
                          options={{
                            toggleSuppressed: {
                              value: !sigmetEntry.suppressed ? "SUPPRESS" : "RESTORE",
                              onMouseDown: () => {
                                dispatch(setSigmetSuppressed({ id: sigmetId, value: !sigmetEntry.suppressed }));
                                setSelectedOption(null);
                                setSelectedPos(null);
                              }
                            }
                          }}
                        />
                      )}
                    </span>
                  )
              )}
            </ScrollContainer>
          </FloatingWindowBodyDiv>
        )}
        {showOptions && (
          <FloatingWindowOptions
            pos={{
              x: ref.current!.clientLeft + ref.current!.clientWidth,
              y: ref.current!.clientTop
            }}
            header="SIGMETS"
            onClose={() => setShowOptions(false)}
            options={SigmetOptions}
            backgroundColors={{
              [viewSuppressed ? "viewSuppressed" : "hideSuppressed"]: "#575757"
            }}
          />
        )}
      </SigmetDiv>
    )
  );
};
