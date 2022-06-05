import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { EdstButton, EdstButton20x20 } from "../../resources/EdstButton";
import { Tooltips } from "../../../tooltips";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { aselSelector, Asel, closeWindow, windowPositionSelector, zStackSelector, pushZStack } from "../../../redux/slices/appSlice";
import { aselEntrySelector } from "../../../redux/slices/entriesSlice";
import { LocalEdstEntry } from "../../../types";
import { useCenterCursor, useDragging, useFocused } from "../../../hooks";
import { EdstInput, FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../../styles/optionMenuStyles";
import { Row, Row3, ScrollContainer, ScrollRow, ScrollCol, ScrollCol3 } from "./styled";
import { InputContainer } from "../../InputComponents";
import { EdstDraggingOutline } from "../../../styles/draggingStyles";
import { EdstWindow } from "../../../namespaces";

enum Sign {
  more = "+",
  less = "-",
  none = ""
}

const SpeedDiv = styled(OptionsMenu)`
  width: 190px;
`;

export const SpeedMenu: React.FC = () => {
  const asel = useRootSelector(aselSelector) as Asel;
  const entry = useRootSelector(aselEntrySelector) as LocalEdstEntry;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.SPEED_MENU));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const [speed, setSpeed] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [sign, setSign] = useState<Sign>(Sign.none);
  const [amend, setAmend] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel]);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.SPEED_MENU);

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
        break;
      case 1:
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
        onMouseDown={() => zStack.indexOf(EdstWindow.SPEED_MENU) > 0 && dispatch(pushZStack(EdstWindow.SPEED_MENU))}
        anyDragging={anyDragging}
        id="speed-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
          Speed Information
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.equipment.split("/")[0]}/${entry.nasSuffix}`}
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
                <ScrollRow key={`speed-menu-${i}`}>
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
