import React, { useRef, useState } from "react";
import styled from "styled-components";
import { windowEnum } from "../../enums";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import {
  setSigmetAcknowledged,
  setSigmetSuppressionState,
  setViewSigmetSuppressed,
  sigmetSelector,
  viewSigmetSuppressedSelector
} from "../../redux/slices/weatherSlice";
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
import { sectorIdSelector } from "../../redux/slices/sectorSlice";
import { useDragging } from "../../hooks";
import { EdstDraggingOutline } from "../../styles/draggingStyles";

enum sigmetOptionEnum {
  viewSuppressed = "VIEW SUPPRESS",
  hideSuppressed = "HIDE SUPPRESS",
  printAll = "PRINT ALL"
}

const SigmetDiv = styled(FloatingWindowDiv)`
  width: 1100px;
`;

export const SigmetWindow: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(windowEnum.sigmets));
  const sectorId = useRootSelector(sectorIdSelector);
  const viewSuppressed = useRootSelector(viewSigmetSuppressedSelector);
  const sigmetList = useRootSelector(sigmetSelector);
  const zStack = useRootSelector(zStackSelector);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number; y: number; w: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, windowEnum.sigmets);

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
        zIndex={zStack.indexOf(windowEnum.sigmets)}
        onMouseDown={() => zStack.indexOf(windowEnum.sigmets) > 0 && dispatch(pushZStack(windowEnum.sigmets))}
        anyDragging={anyDragging}
        id="edst-status"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseDown={stopDrag} />}
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDiv20 onMouseDown={handleOptionsMouseDown}>M</FloatingWindowHeaderColDiv20>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>SIGMETS SECTOR {sectorId}</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(windowEnum.sigmets))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDiv20>
        </FloatingWindowHeaderDiv>
        {Object.values(sigmetList).length > 0 && (
          <FloatingWindowBodyDiv>
            <ScrollContainer maxHeight={600}>
              {Object.entries(sigmetList).map(
                ([sigmetId, sigmetEntry]) =>
                  (!sigmetEntry.suppressed || viewSuppressed) && (
                    <span style={{ margin: "6px 0" }} key={`sigmet-list-key-${sigmetId}`}>
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
                            x: (ref.current as HTMLDivElement).clientLeft + (ref.current as HTMLDivElement).clientWidth,
                            y: (ref.current as HTMLDivElement).clientTop
                          }}
                          options={[!sigmetEntry.suppressed ? "SUPPRESS" : "RESTORE"]}
                          handleOptionClick={() => {
                            dispatch(setSigmetSuppressionState({ id: sigmetId, value: !sigmetEntry.suppressed }));
                            setSelectedOption(null);
                            setSelectedPos(null);
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
              x: (ref.current as HTMLDivElement).clientLeft + (ref.current as HTMLDivElement).clientWidth,
              y: (ref.current as HTMLDivElement).clientTop
            }}
            header="SIGMETS"
            closeOptions={() => setShowOptions(false)}
            options={Object.values(sigmetOptionEnum)}
            selectedOptions={[viewSuppressed ? sigmetOptionEnum.viewSuppressed : sigmetOptionEnum.hideSuppressed]}
            handleOptionClick={option => {
              switch (option as sigmetOptionEnum) {
                case sigmetOptionEnum.viewSuppressed:
                  dispatch(setViewSigmetSuppressed(true));
                  break;
                case sigmetOptionEnum.hideSuppressed:
                  dispatch(setViewSigmetSuppressed(false));
                  break;
                default:
                  break;
              }
            }}
          />
        )}
      </SigmetDiv>
    )
  );
};
