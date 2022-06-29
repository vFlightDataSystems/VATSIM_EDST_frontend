import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { computeCrossingTimes, formatUtcMinutes } from "../../lib";
import { EdstButton, HoldDirButton16, HoldDirButton20, HoldDirButton50 } from "../resources/EdstButton";
import { EdstTooltip } from "../resources/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector, toggleSpa, updateEntry } from "../../redux/slices/entriesSlice";
import { zStackSelector, pushZStack, windowPositionSelector, closeWindow } from "../../redux/slices/appSlice";
import { RouteFix } from "../../types";
import { useCenterCursor, useDragging, useFocused } from "../../hooks/utils";
import { EdstInput, FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { InputContainer } from "../InputComponents";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { aselTrackSelector } from "../../redux/slices/aircraftTrackSlice";
import { EdstWindow } from "../../namespaces";

const HoldDiv = styled(OptionsMenu)`
  width: 420px;
`;
const FixContainer = styled.div`
  padding: 4px 0;
  border-bottom: 1px solid #adadad;
`;

const Row1 = styled(OptionsBodyRow)`
  justify-content: space-between;
`;
const Row2 = styled(OptionsBodyRow)`
  padding: 6px 0;
`;
const LeftCol = styled(OptionsBodyCol)`
  margin-left: 10px;
  flex-grow: 0;
  padding: 0;
  border-bottom: 1px solid #adadad;
`;
const Col1 = styled(OptionsBodyCol)`
  justify-content: left;
  display: inline-flex;
  height: 18px;
  padding: 0 4px;
  flex-grow: 0;
  width: 110px;
  margin: 0 12px;
`;
const Col2 = styled(OptionsBodyCol)`
  justify-content: left;
  flex-grow: 1;
  margin: 5px 50px 5px 8px;
  border-bottom: 1px solid #adadad;
`;
const Col3 = styled(OptionsBodyCol)`
  justify-content: left;
  margin-top: 2px;

  *[disabled] {
    pointer-events: none;
    border-color: transparent;
  }
`;
const Col5 = styled(OptionsBodyCol)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
`;
const Col7 = styled(OptionsBodyCol)`
  justify-content: left;
  align-items: center;
  margin-left: 10px;
  margin-right: auto;
`;
const EfcInputContainer = styled(InputContainer)`
  margin-left: 20px;
  margin-right: 0;
  //height: 17px;
  width: 55px;
`;

export const HoldMenu: React.FC = () => {
  const entry = useRootSelector(aselEntrySelector)!;
  const track = useRootSelector(aselTrackSelector)!;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.HOLD_MENU));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const [holdFix, setHoldFix] = useState<string | null>(null);
  const [legLength, setLegLength] = useState<string | number | null>(null);
  const [holdDirection, setHoldDirection] = useState<string | null>(null);
  const [turns, setTurns] = useState<string | null>(null);
  const [efc, setEfc] = useState(utcMinutes);
  const [routeFixes, setRouteFixes] = useState<(RouteFix & { minutesAtFix: number })[] | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.HOLD_MENU);

  useEffect(() => {
    if (!entry) {
      dispatch(closeWindow(EdstWindow.HOLD_MENU));
    } else {
      const routeFixes = computeCrossingTimes(entry, track);
      const now = new Date();
      const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      setHoldFix(entry.holdData?.holdFix ?? "PP");
      setLegLength(entry.holdData?.legLength ?? "STD");
      setHoldDirection(entry.holdData?.holdDirection ?? "N");
      setTurns(entry.holdData?.turns ?? "RT");
      setEfc(entry.holdData?.efc ?? utcMinutes + 30);
      setRouteFixes(routeFixes ?? null);
    } // eslint-disable-next-line
  }, []);

  const clearedHold = () => {
    if (entry) {
      const holdData = {
        holdFix,
        legLength,
        holdDirection,
        turns,
        efc
      };
    }
    dispatch(closeWindow(EdstWindow.HOLD_MENU));
  };

  return (
    pos &&
    entry && (
      <HoldDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.HOLD_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.HOLD_MENU) > 0 && dispatch(pushZStack(EdstWindow.HOLD_MENU))}
        anyDragging={anyDragging}
        id="hold-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Hold Data Menu
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.equipment.split("/")[0]}/${entry.nasSuffix}`}
          </FidRow>
          <OptionsBodyRow>
            <EdstTooltip title={Tooltips.holdDirection}>
              <LeftCol>Location</LeftCol>
            </EdstTooltip>
          </OptionsBodyRow>
          <OptionsBodyRow>
            <OptionsBodyCol>
              <EdstButton
                content="Present Position"
                selected={!holdFix || holdFix === "PP"}
                onMouseDown={() => {
                  const now = new Date();
                  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
                  setHoldFix("PP");
                  setEfc(utcMinutes + 30);
                }}
              >
                Present Position
              </EdstButton>
            </OptionsBodyCol>
          </OptionsBodyRow>
          <FixContainer>
            {routeFixes &&
              _.range(0, Math.min(routeFixes.length || 0, 10)).map(i => (
                <OptionsBodyRow key={`hold-menu-row-${i}`}>
                  {_.range(0, Math.round((routeFixes.length || 0) / 10) + 1).map(j => {
                    const fixName = routeFixes?.[Number(i) + Number(j) * 10]?.name;
                    const minutesAtFix = routeFixes?.[Number(i) + Number(j) * 10]?.minutesAtFix;
                    return (
                      fixName && (
                        <Col1
                          hover
                          selected={holdFix === fixName}
                          key={`hold-menu-col-${i}-${j}`}
                          onMouseDown={() => {
                            setHoldFix(fixName);
                            setEfc(minutesAtFix + 30);
                          }}
                        >
                          {fixName}
                          <OptionsBodyCol alignRight margin="0">
                            {`0${Math.round(minutesAtFix / 60) % 24}`.slice(-2) + `0${Math.round(minutesAtFix % 60)}`.slice(-2)}
                          </OptionsBodyCol>
                        </Col1>
                      )
                    );
                  })}
                </OptionsBodyRow>
              ))}
          </FixContainer>
          <Row1>
            <EdstTooltip title={Tooltips.holdDirection}>
              <Col2>Direction</Col2>
            </EdstTooltip>
            <EdstTooltip title={Tooltips.holdTurns}>
              <Col2>Turns</Col2>
            </EdstTooltip>
            <EdstTooltip title={Tooltips.holdLegLength}>
              <Col2>Leg Lengths</Col2>
            </EdstTooltip>
          </Row1>
          <Row1>
            <Col3>
              <HoldDirButton16 content="NW" selected={holdDirection === "NW"} onMouseDown={() => setHoldDirection("NW")} />
              <HoldDirButton16 content="N" selected={holdDirection === "N"} onMouseDown={() => setHoldDirection("N")} />
              <HoldDirButton16 content="NE" selected={holdDirection === "NE"} onMouseDown={() => setHoldDirection("NE")} />
            </Col3>
            <Col3>
              <HoldDirButton20 content="LT" selected={turns === "LT"} onMouseDown={() => setTurns("LT")} />
              <HoldDirButton20 content="RT" selected={turns === "RT"} onMouseDown={() => setTurns("RT")} />
            </Col3>
            <Col3>
              <HoldDirButton50 content="STD" selected={!legLength || legLength === "STD"} onMouseDown={() => setLegLength("STD")} />
              <HoldDirButton50 content="15 NM" selected={!legLength || legLength === 15} onMouseDown={() => setLegLength(15)} />
            </Col3>
          </Row1>
          <Row1>
            <Col3>
              <HoldDirButton16 content="W" selected={holdDirection === "W"} onMouseDown={() => setHoldDirection("W")} />
              <HoldDirButton16 disabled />
              <HoldDirButton16 content="E" selected={holdDirection === "E"} onMouseDown={() => setHoldDirection("E")} />
            </Col3>
            <Col3>
              <HoldDirButton20 disabled />
              <HoldDirButton20 disabled />
            </Col3>
            <Col3>
              <HoldDirButton50 content="5 NM" selected={!legLength || legLength === 5} onMouseDown={() => setLegLength(5)} />
              <HoldDirButton50 content="20 NM" selected={!legLength || legLength === 20} onMouseDown={() => setLegLength(20)} />
            </Col3>
          </Row1>
          <Row1>
            <Col3>
              <HoldDirButton16 content="SW" selected={holdDirection === "SW"} onMouseDown={() => setHoldDirection("SW")} />
              <HoldDirButton16 content="S" selected={holdDirection === "S"} onMouseDown={() => setHoldDirection("S")} />
              <HoldDirButton16 content="SE" selected={holdDirection === "SE"} onMouseDown={() => setHoldDirection("SE")} />
            </Col3>
            <Col3>
              <HoldDirButton20 disabled />
              <HoldDirButton20 disabled />
            </Col3>
            <Col3>
              <HoldDirButton50 content="10 NM" selected={!legLength || legLength === 10} onMouseDown={() => setLegLength(10)} />
              <HoldDirButton50 content="25 NM" selected={!legLength || legLength === 25} onMouseDown={() => setLegLength(25)} />
            </Col3>
          </Row1>
          <Row2 bottomBorder>
            <Col5>
              <EdstButton
                content="Delete Hold Instructions"
                padding="0 20px"
                onMouseDown={() => {
                  dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { aclRouteDisplay: null } }));
                  dispatch(closeWindow(EdstWindow.HOLD_MENU));
                }}
                title={Tooltips.holdDeleteHoldInstr}
              />
            </Col5>
          </Row2>
          <Row1>
            <EdstTooltip title={Tooltips.holdEfc}>
              <Col2>EFC</Col2>
            </EdstTooltip>
          </Row1>
          <OptionsBodyRow>
            <Col7>
              <EfcInputContainer>
                <EdstInput
                  value={formatUtcMinutes(efc)}
                  readOnly
                  // onChange={(e) => setEfc(e.target.value)}
                />
              </EfcInputContainer>
              <EdstButton content="-" margin="0 0 0 10px" width={24} onMouseDown={() => setEfc(efc - 1)} />
              <EdstButton content="+" margin="0 0 0 4px" width={24} onMouseDown={() => setEfc(efc + 1)} />
            </Col7>
          </OptionsBodyRow>
          <Row2 bottomBorder>
            <Col5>
              <EdstButton content="Delete EFC" padding="0 6px" onMouseDown={() => setEfc(0)} title={Tooltips.holdDelEfc} />
            </Col5>
          </Row2>
          <OptionsBodyRow margin="6px 0 0 0">
            <OptionsBodyCol>
              <EdstButton
                content="Hold/SPA"
                margin="0 6px 0 0"
                padding="0 6px"
                disabled={!!entry?.holdData}
                onMouseDown={() => {
                  if (!entry.spa) {
                    dispatch(toggleSpa(entry.aircraftId));
                  }
                  clearedHold();
                }}
                title={Tooltips.holdHoldSpaBtn}
              />
              <EdstButton content="Hold" margin="0 6px 0 0" onMouseDown={clearedHold} disabled={!!entry?.holdData} title={Tooltips.holdHoldBtn} />
              <EdstButton
                content="Cancel Hold"
                disabled={!entry?.holdData}
                onMouseDown={() => {
                  dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { aclRouteDisplay: null } }));
                  dispatch(closeWindow(EdstWindow.HOLD_MENU));
                }}
              />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.HOLD_MENU))} />
            </OptionsBodyCol>
          </OptionsBodyRow>
        </OptionsBody>
      </HoldDiv>
    )
  );
};
