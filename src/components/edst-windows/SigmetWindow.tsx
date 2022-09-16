import React, { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import {
  setSigmetAcknowledged,
  setSigmetSuppressed,
  setViewSuppressedSigmet,
  SigmetEntry,
  sigmetSelector,
  viewSuppressedSigmetSelector
} from "../../redux/slices/weatherSlice";
import { FloatingWindowOptionContainer } from "../utils/FloatingWindowOptionContainer";
import { FloatingWindowBodyDiv, FloatingWindowDiv, FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { ScrollContainer } from "../../styles/optionMenuStyles";
import { sectorIdSelector } from "../../redux/slices/sectorSlice";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { FloatingWindowHeader } from "../utils/FloatingWindowHeader";
import { useWindowOptions } from "../../hooks/useWindowOptions";

const SigmetDiv = styled(FloatingWindowDiv)`
  width: 1100px;
`;

const SigmetRowDiv = styled(FloatingWindowRow)`
  margin: 6px 21px 0 0;
`;

type SigmetRowProps = {
  sigmetEntry: SigmetEntry;
  selected: boolean;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onDelete: () => void;
};
const SigmetRow = ({ sigmetEntry, selected, handleMouseDown, onDelete }: SigmetRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);

  const zIndex = zStack.indexOf(EdstWindow.SIGMETS);
  const rect = ref.current?.getBoundingClientRect();

  return (
    <>
      <SigmetRowDiv ref={ref} selected={selected} suppressed={sigmetEntry.suppressed} onMouseDown={handleMouseDown}>
        {sigmetEntry.text}
      </SigmetRowDiv>
      {selected && rect && (
        <FloatingWindowOptionContainer
          pos={{
            x: rect.left + rect.width,
            y: rect.top
          }}
          zIndex={zIndex}
          options={{
            toggleSuppressed: {
              value: !sigmetEntry.suppressed ? "SUPPRESS" : "RESTORE",
              backgroundColor: "#575757",
              onMouseDown: onDelete
            }
          }}
        />
      )}
    </>
  );
};

export const SigmetWindow = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.SIGMETS));
  const sectorId = useRootSelector(sectorIdSelector);
  const viewSuppressed = useRootSelector(viewSuppressedSigmetSelector);
  const sigmetList = useRootSelector(sigmetSelector);
  const zStack = useRootSelector(zStackSelector);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.SIGMETS, "mousedown");

  const [showOptions, setShowOptions] = useState(false);
  const extraOptions = useMemo(
    () => ({
      viewSuppressed: {
        value: "VIEW SUPPRESS",
        backgroundColor: viewSuppressed ? "#575757" : "#000000",
        onMouseDown: () => dispatch(setViewSuppressedSigmet(true))
      },
      hideSuppressed: {
        value: "HIDE SUPPRESS",
        backgroundColor: !viewSuppressed ? "#575757" : "#000000",
        onMouseDown: () => dispatch(setViewSuppressedSigmet(false))
      },
      printAll: { value: "PRINT ALL", backgroundColor: "#000000" }
    }),
    [dispatch, viewSuppressed]
  );

  const options = useWindowOptions(EdstWindow.SIGMETS, extraOptions);

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, sigmetId: string) => {
    setShowOptions(false);
    if (selectedEntry !== sigmetId) {
      if (!sigmetList[sigmetId].acknowledged) {
        dispatch(setSigmetAcknowledged({ id: sigmetId, value: true }));
      }
      setSelectedEntry(sigmetId);
    } else {
      setSelectedEntry(null);
    }
  };

  const handleOptionsMouseDown = () => {
    setSelectedEntry(null);
    setShowOptions(true);
  };

  const zIndex = zStack.indexOf(EdstWindow.SIGMETS);

  return (
    pos && (
      <SigmetDiv
        ref={ref}
        pos={pos}
        zIndex={zIndex}
        onMouseDown={() => zIndex < zStack.length - 1 && dispatch(pushZStack(EdstWindow.SIGMETS))}
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
                    <SigmetRow
                      key={sigmetId}
                      sigmetEntry={sigmetEntry}
                      selected={selectedEntry === sigmetId}
                      handleMouseDown={event => handleEntryMouseDown(event, sigmetId)}
                      onDelete={() => {
                        dispatch(setSigmetSuppressed({ id: sigmetId, value: !sigmetEntry.suppressed }));
                        setSelectedEntry(null);
                      }}
                    />
                  )
              )}
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
            header="SIGMETS"
            onClose={() => setShowOptions(false)}
            options={options}
          />
        )}
      </SigmetDiv>
    )
  );
};
