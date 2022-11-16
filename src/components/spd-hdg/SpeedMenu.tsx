import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselSelector, closeWindow, windowPositionSelector, zStackSelector, pushZStack } from "~redux/slices/appSlice";
import { aselEntrySelector, updateEntry } from "~redux/slices/entrySlice";
import { EdstInput, FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "styles/optionMenuStyles";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { InputContainer } from "components/utils/InputComponents";
import { Row, Row3, ScrollContainer, ScrollRow, ScrollCol, ScrollCol3 } from "components/spd-hdg/styled";
import { EdstTooltip } from "components/utils/EdstTooltip";
import { EdstButton, ExitButton } from "components/utils/EdstButton";

enum Sign {
  more = "+",
  less = "-",
  none = "",
}

const SpeedDiv = styled(OptionsMenu)`
  width: 20ch;
`;

export const SpeedMenu = () => {
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, "SPEED_MENU"));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const [speed, setSpeed] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [sign, setSign] = useState<Sign>(Sign.none);
  const [amend, setAmend] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel.aircraftId]);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "SPEED_MENU", "mouseup");

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
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { scratchpadSpeed: null },
            })
          );
          // set assigned speed
        } else {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { scratchpadSpeed: valueStr },
            })
          );
          // delete assigned speed
        }
        break;
      case 1:
        if (amend) {
          // set assigned speed
        } else {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { scratchpadSpeed: valueStr },
            })
          );
        }
        break;
      default:
        break;
    }
    dispatch(closeWindow("SPEED_MENU"));
  };

  return (
    <SpeedDiv
      ref={ref}
      pos={pos}
      zIndex={zStack.indexOf("SPEED_MENU")}
      onMouseDown={() => zStack.indexOf("SPEED_MENU") < zStack.length - 1 && dispatch(pushZStack("SPEED_MENU"))}
      anyDragging={anyDragging}
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
              <EdstInput value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
            </InputContainer>
          </OptionsBodyCol>
        </OptionsBodyRow>
        <Row3 topBorder />
        <Row3 bottomBorder>
          <EdstTooltip style={{ marginLeft: "0.5ch" }} content="KNOTS" title={Tooltips.aclSpdKnots} />
          <div style={{ justifyContent: "center", margin: "auto" }}>
            <EdstButton
              margin="0 2px"
              content="+"
              selected={sign === Sign.more}
              onMouseDown={() => setSign(sign === Sign.more ? Sign.none : Sign.more)}
            />
            <EdstButton
              margin="0 2px"
              content="-"
              selected={sign === Sign.less}
              onMouseDown={() => setSign(sign === Sign.less ? Sign.none : Sign.less)}
            />
          </div>
          <EdstTooltip style={{ marginRight: "0.5ch" }} content="MACH" title={Tooltips.aclSpdMach} />
        </Row3>
        <ScrollContainer onWheel={handleScroll}>
          {_.range(5, -6, -1).map((i) => {
            const centerSpd = speed - Math.round(deltaY / 100) * 10 + i * 10;
            const centerMach = 0.79 - Math.round(deltaY / 100) / 100 + i / 100;
            return (
              <ScrollRow key={i}>
                <ScrollCol onMouseDown={(e) => handleMouseDown(e, centerSpd)}>
                  {centerSpd.toString().padStart(3, "0")}
                  {sign}
                </ScrollCol>
                <ScrollCol onMouseDown={(e) => handleMouseDown(e, centerSpd + 5)}>
                  {(centerSpd + 5).toString().padStart(3, "0")}
                  {sign}
                </ScrollCol>
                <ScrollCol3 onMouseDown={(e) => handleMouseDown(e, centerMach, true)}>
                  {centerMach.toFixed(2).toString().slice(1)}
                  {sign}
                </ScrollCol3>
              </ScrollRow>
            );
          })}
          <OptionsBodyRow margin="0">
            <OptionsBodyCol alignRight>
              <ExitButton onMouseDown={() => dispatch(closeWindow("SPEED_MENU"))} />
            </OptionsBodyCol>
          </OptionsBodyRow>
        </ScrollContainer>
      </OptionsBody>
    </SpeedDiv>
  );
};
