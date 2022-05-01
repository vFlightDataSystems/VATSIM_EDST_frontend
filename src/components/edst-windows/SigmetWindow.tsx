import React, {useContext, useRef, useState} from 'react';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector, zStackSelector, setZStack} from "../../redux/slices/appSlice";
import {
  setSigmetAcknowledged,
  setSigmetSuppressionState, setViewSigmetSuppressed,
  sigmetSelector,
  viewSigmetSuppressedSelector
} from "../../redux/slices/weatherSlice";
import {FloatingWindowOptions} from "./FloatingWindowOptions";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock,
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv, FloatingWindowRow
} from "../../styles/floatingWindowStyles";
import {ScrollContainer} from '../../styles/optionMenuStyles';
import {sectorIdSelector} from "../../redux/slices/sectorSlice";

enum sigmetOptionEnum {
  viewSuppressed = "VIEW SUPPRESS",
  hideSuppressed = "HIDE SUPPRESS",
  printAll = "PRINT ALL"
}

export const SigmetWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.sigmets));
  const sectorId = useAppSelector(sectorIdSelector);
  const viewSuppressed = useAppSelector(viewSigmetSuppressedSelector);
  const sigmetList = useAppSelector(sigmetSelector);
  const zStack = useAppSelector(zStackSelector);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number, y: number, w: number } | null>(null);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef<HTMLDivElement>(null);

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, sigmetId: string) => {
    setShowOptions(false);
    if (selectedOption !== sigmetId) {
      if (!sigmetList[sigmetId].acknowledged) {
        dispatch(setSigmetAcknowledged({id: sigmetId, value: true}));
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

  return pos && (<FloatingWindowDiv
    ref={ref}
    width={1100}
    pos={pos}
    zIndex={zStack.indexOf(windowEnum.sigmets)}
    onMouseDown={() => zStack.indexOf(windowEnum.sigmets) > 0 && dispatch(setZStack(windowEnum.sigmets))}
    id="edst-status"
  >
    <FloatingWindowHeaderDiv>
      <FloatingWindowHeaderColDiv width={20} onMouseDown={handleOptionsMouseDown}>M</FloatingWindowHeaderColDiv>
      <FloatingWindowHeaderColDiv
        flexGrow={1}
        onMouseDown={(event) => startDrag(event, ref, windowEnum.sigmets)}
      >
        SIGMETS SECTOR {sectorId}
      </FloatingWindowHeaderColDiv>
      <FloatingWindowHeaderColDiv width={20} onMouseDown={() => dispatch(closeWindow(windowEnum.sigmets))}>
        <FloatingWindowHeaderBlock width={8} height={2} />
      </FloatingWindowHeaderColDiv>
    </FloatingWindowHeaderDiv>
    {Object.values(sigmetList).length > 0 &&
      <FloatingWindowBodyDiv>
        <ScrollContainer maxHeight={600}>
          {Object.entries(sigmetList).map(([sigmetId, sigmetEntry]) => (!sigmetEntry.suppressed || viewSuppressed) &&
            <span style={{ margin: "6px 0" }} key={`sigmet-list-key-${sigmetId}`}>
              <FloatingWindowRow
                selected={selectedOption === sigmetId}
                suppressed={sigmetEntry.suppressed}
                onMouseDown={(event) => handleEntryMouseDown(event, sigmetId)}
              >
                {sigmetEntry.text}
              </FloatingWindowRow>
              {selectedOption === sigmetId && selectedPos &&
                <FloatingWindowOptions
                  pos={{
                    x: (ref.current as HTMLDivElement).clientLeft + (ref.current as HTMLDivElement).clientWidth,
                    y: (ref.current as HTMLDivElement).clientTop
                  }}
                  options={[!sigmetEntry.suppressed ? 'SUPPRESS' : 'RESTORE']}
                  handleOptionClick={() => {
                    dispatch(setSigmetSuppressionState({ id: sigmetId, value: !sigmetEntry.suppressed }));
                    setSelectedOption(null);
                    setSelectedPos(null);
                  }}
                />}
            </span>)}
        </ScrollContainer>
      </FloatingWindowBodyDiv>}
    {showOptions && <FloatingWindowOptions
      pos={{
        x: (ref.current as HTMLDivElement).clientLeft + (ref.current as HTMLDivElement).clientWidth,
        y: (ref.current as HTMLDivElement).clientTop
      }}
      header="SIGMETS"
      closeOptions={() => setShowOptions(false)}
      options={Object.values(sigmetOptionEnum)}
      selectedOptions={[viewSuppressed ? sigmetOptionEnum.viewSuppressed : sigmetOptionEnum.hideSuppressed
      ]}
      handleOptionClick={(option) => {
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
    />}
  </FloatingWindowDiv>
  );
};
