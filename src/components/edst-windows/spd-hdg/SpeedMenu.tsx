import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { EdstButton, EdstButton20x20 } from "../../utils/EdstButton";
import { Tooltips } from "../../../tooltips";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { aselSelector, closeWindow, windowPositionSelector, zStackSelector, pushZStack } from "../../../redux/slices/appSlice";
import { aselEntrySelector, updateEntry } from "../../../redux/slices/entrySlice";
import { EdstInput, FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../../styles/optionMenuStyles";
import { Row, Row3, ScrollContainer, ScrollRow, ScrollCol, ScrollCol3 } from "./styled";
import { InputContainer } from "../../InputComponents";
import { EdstDraggingOutline } from "../../EdstDraggingOutline";
import { useDragging } from "../../../hooks/useDragging";
import { useCenterCursor } from "../../../hooks/useCenterCursor";
import { useFocused } from "../../../hooks/useFocused";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";

enum Sign {
  more = "+",
  less = "-",
  none = ""
}

const SpeedDiv = styled(OptionsMenu)`
  width: 190px;
`;

export const SpeedMenu = () => {
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.SPEED_MENU));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const [speed, setSpeed] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [sign, setSign] = useState<Sign>(Sign.none);
  const [amend, setAmend] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel]);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.SPEED_MENU, "mouseup");

  useEffect(() => {
    setSpeed(280);
    setDeltaY(0);
    setSign(Sign.none);
    setAmend(true);
  }, [asel]);

  const handleScroll = (e: React.WheelEvent) => {
    const newDeltaY = Math.min(Math.max((speed - 400) * 10, deltaY + e.deltaY), (speed - 160) * 10);
    setDeltaY(newDeltaY);
  };

  const handleMouseDown = (event: any, value: number, mach = false) => {
    event.preventDefault();
    const valueStr = !mach ? `${amend && sign === Sign.none ? "S" : ""}${value}${sign}` : `M${Math.round(value * 100)}${sign}`;
    switch (event.button) {
      case 0:
        if (amend) {
          dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { scratchpadSpeed: null } }));
          // set assigned speed
        } else {
          dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { scratchpadSpeed: valueStr } }));
          // delete assigned speed
        }
        break;
      case 1:
        if (amend) {
          // set assigned speed
        } else {
          dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { scratchpadSpeed: valueStr } }));
        }
        break;
      default:
        break;
    }
    dispatch(closeWindow(EdstWindow.SPEED_MENU));
  };

  return (
    pos &&
    entry && (
      <SpeedDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.SPEED_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.SPEED_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.SPEED_MENU))}
        anyDragging={anyDragging}
        id="speed-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
          Speed Information
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
          </FidRow>
          <Row>
            <OptionsBodyCol>
              <EdstButton content="Amend" selected={amend} onMouseDown={() => setAmend(true)} title={Tooltips.aclSpdAmend} />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Scratchpad" selected={!amend} onMouseDown={() => setAmend(false)} title={Tooltips.aclSpdScratchpad} />
            </OptionsBodyCol>
          </Row>
          <OptionsBodyRow>
            <OptionsBodyCol>
              Speed:
              <InputContainer>
                <EdstInput value={speed} onChange={e => setSpeed(Number(e.target.value))} />
              </InputContainer>
            </OptionsBodyCol>
          </OptionsBodyRow>
          <Row3 topBorder />
          <Row3 bottomBorder>
            <EdstTooltip content="KNOTS" title={Tooltips.aclSpdKnots} />
            <EdstButton20x20
              margin="0 2px 0 22px"
              content="+"
              selected={sign === Sign.more}
              onMouseDown={() => setSign(sign === Sign.more ? Sign.none : Sign.more)}
            />
            <EdstButton20x20
              margin="0 16px 0 2px"
              content="-"
              selected={sign === Sign.less}
              onMouseDown={() => setSign(sign === Sign.less ? Sign.none : Sign.less)}
            />
            <EdstTooltip content="MACH" title={Tooltips.aclSpdMach} />
          </Row3>
          <ScrollContainer onWheel={handleScroll}>
            {_.range(5, -6, -1).map(i => {
              const centerSpd = speed - Math.round(deltaY / 100) * 10 + i * 10;
              const centerMach = 0.79 - Math.round(deltaY / 100) / 100 + i / 100;
              return (
                <ScrollRow key={i}>
                  <ScrollCol onMouseDown={e => handleMouseDown(e, centerSpd)}>
                    {String(centerSpd).padStart(3, "0")}
                    {sign}
                  </ScrollCol>
                  <ScrollCol onMouseDown={e => handleMouseDown(e, centerSpd + 5)}>
                    {String(centerSpd + 5).padStart(3, "0")}
                    {sign}
                  </ScrollCol>
                  <ScrollCol3 onMouseDown={e => handleMouseDown(e, centerMach, true)}>
                    {String(centerMach.toFixed(2)).slice(1)}
                    {sign}
                  </ScrollCol3>
                </ScrollRow>
              );
            })}
            <OptionsBodyRow margin="0">
              <OptionsBodyCol alignRight>
                <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.SPEED_MENU))} />
              </OptionsBodyCol>
            </OptionsBodyRow>
          </ScrollContainer>
        </OptionsBody>
      </SpeedDiv>
    )
  );
};
