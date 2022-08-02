import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { computeCrossingTimes, formatUtcMinutes } from "../../lib";
import { EdstButton, HoldDirButton16, HoldDirButton20, HoldDirButton50 } from "../resources/EdstButton";
import { EdstTooltip } from "../resources/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector, toggleSpa, updateEntry } from "../../redux/slices/entrySlice";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { EdstInput, FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { InputContainer } from "../InputComponents";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { aselTrackSelector } from "../../redux/slices/trackSlice";
import { RouteFix } from "../../types/routeFix";
import { useDragging } from "../../hooks/useDragging";
import { useCenterCursor } from "../../hooks/useCenterCursor";
import { useFocused } from "../../hooks/useFocused";
import { EdstWindow } from "../../enums/edstWindow";
import { CompassDirection } from "../../enums/hold/compassDirection";
import { TurnDirection } from "../../enums/hold/turnDirection";
import { HoldAnnotations } from "../../enums/hold/holdAnnotations";
import { useHubActions } from "../../hooks/useHubActions";
import { openWindowThunk } from "../../redux/thunks/openWindowThunk";

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

export const HoldMenu = () => {
  const entry = useRootSelector(aselEntrySelector)!;
  const track = useRootSelector(aselTrackSelector)!;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.HOLD_MENU));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const [fix, setFix] = useState<string | null>(null);
  const [legLength, setLegLength] = useState<number | null>(null);
  const [direction, setDirection] = useState<CompassDirection>(CompassDirection.NORTH);
  const [turns, setTurns] = useState<TurnDirection>(TurnDirection.RIGHT);
  const [efcTime, setEfcTime] = useState(utcMinutes);
  const [routeFixes, setRouteFixes] = useState<(RouteFix & { minutesAtFix: number })[] | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.HOLD_MENU);
  const hubActions = useHubActions();

  useEffect(() => {
    if (!entry) {
      dispatch(closeWindow(EdstWindow.HOLD_MENU));
    } else {
      const routeFixes = computeCrossingTimes(entry, track);
      const now = new Date();
      const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      setFix(entry.holdAnnotations?.fix ?? null);
      setLegLength(entry.holdAnnotations?.legLength ?? null);
      setDirection(entry.holdAnnotations?.direction ?? CompassDirection.NORTH);
      setTurns(entry.holdAnnotations?.turns ?? TurnDirection.RIGHT);
      setEfcTime(entry.holdAnnotations?.efcTime ?? utcMinutes + 30);
      setRouteFixes(routeFixes ?? null);
    }
  }, []);

  const clearedHold = () => {
    if (entry) {
      const holdAnnotations: HoldAnnotations = {
        fix,
        legLength,
        legLengthInNm: true,
        direction,
        turns,
        efcTime
      };
      hubActions.setHoldAnnotations(entry.aircraftId, holdAnnotations).then();
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
        onMouseDown={() => zStack.indexOf(EdstWindow.HOLD_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.HOLD_MENU))}
        anyDragging={anyDragging}
        id="hold-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Hold Data Menu
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
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
                selected={fix === null}
                onMouseDown={() => {
                  const now = new Date();
                  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
                  setFix(null);
                  setEfcTime(utcMinutes + 30);
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
                          selected={fix === fixName}
                          key={`hold-menu-col-${i}-${j}`}
                          onMouseDown={() => {
                            setFix(fixName);
                            setEfcTime(minutesAtFix + 30);
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
              <HoldDirButton16
                content="NW"
                selected={direction === CompassDirection.NORTH_WEST}
                onMouseDown={() => setDirection(CompassDirection.NORTH_WEST)}
              />
              <HoldDirButton16 content="N" selected={direction === CompassDirection.NORTH} onMouseDown={() => setDirection(CompassDirection.NORTH)} />
              <HoldDirButton16
                content="NE"
                selected={direction === CompassDirection.NORTH_EAST}
                onMouseDown={() => setDirection(CompassDirection.NORTH_EAST)}
              />
            </Col3>
            <Col3>
              <HoldDirButton20 content="LT" selected={turns === TurnDirection.LEFT} onMouseDown={() => setTurns(TurnDirection.LEFT)} />
              <HoldDirButton20 content="RT" selected={turns === TurnDirection.RIGHT} onMouseDown={() => setTurns(TurnDirection.RIGHT)} />
            </Col3>
            <Col3>
              <HoldDirButton50 content="STD" selected={legLength === null} onMouseDown={() => setLegLength(null)} />
              <HoldDirButton50 content="15 NM" selected={!legLength || legLength === 15} onMouseDown={() => setLegLength(15)} />
            </Col3>
          </Row1>
          <Row1>
            <Col3>
              <HoldDirButton16 content="W" selected={direction === CompassDirection.WEST} onMouseDown={() => setDirection(CompassDirection.WEST)} />
              <HoldDirButton16 disabled />
              <HoldDirButton16 content="E" selected={direction === CompassDirection.EAST} onMouseDown={() => setDirection(CompassDirection.EAST)} />
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
              <HoldDirButton16
                content="SW"
                selected={direction === CompassDirection.SOUTH_WEST}
                onMouseDown={() => setDirection(CompassDirection.SOUTH_WEST)}
              />
              <HoldDirButton16 content="S" selected={direction === CompassDirection.SOUTH} onMouseDown={() => setDirection(CompassDirection.SOUTH)} />
              <HoldDirButton16
                content="SE"
                selected={direction === CompassDirection.SOUTH_EAST}
                onMouseDown={() => setDirection(CompassDirection.SOUTH_EAST)}
              />
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
                  value={formatUtcMinutes(efcTime)}
                  readOnly
                  // onChange={(e) => setEfc(e.target.value)}
                />
              </EfcInputContainer>
              <EdstButton content="-" margin="0 0 0 10px" width={24} onMouseDown={() => setEfcTime(efcTime - 1)} />
              <EdstButton content="+" margin="0 0 0 4px" width={24} onMouseDown={() => setEfcTime(efcTime + 1)} />
            </Col7>
          </OptionsBodyRow>
          <Row2 bottomBorder>
            <Col5>
              <EdstButton content="Delete EFC" padding="0 6px" onMouseDown={() => setEfcTime(0)} title={Tooltips.holdDelEfc} />
            </Col5>
          </Row2>
          <OptionsBodyRow margin="6px 0 0 0">
            <OptionsBodyCol>
              <EdstButton
                content="Hold/SPA"
                margin="0 6px 0 0"
                padding="0 6px"
                disabled={!!entry?.holdAnnotations}
                onMouseDown={() => {
                  if (!entry.spa) {
                    dispatch(toggleSpa(entry.aircraftId));
                  }
                  clearedHold();
                }}
                title={Tooltips.holdHoldSpaBtn}
              />
              <EdstButton
                content="Hold"
                margin="0 6px 0 0"
                onMouseDown={clearedHold}
                disabled={!!entry?.holdAnnotations}
                title={Tooltips.holdHoldBtn}
              />
              <EdstButton
                content="Cancel Hold"
                disabled={!entry?.holdAnnotations}
                onMouseDown={() => {
                  dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { aclRouteDisplay: null } }));
                  dispatch(openWindowThunk(EdstWindow.CANCEL_HOLD_MENU));
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
