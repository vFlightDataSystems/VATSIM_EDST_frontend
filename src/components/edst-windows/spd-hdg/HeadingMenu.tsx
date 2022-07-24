import React, { useEffect, useRef, useState } from "react";

import _ from "lodash";
import styled from "styled-components";
import { EdstButton } from "../../resources/EdstButton";
import { Tooltips } from "../../../tooltips";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { aselSelector, zStackSelector, pushZStack, windowPositionSelector, closeWindow } from "../../../redux/slices/appSlice";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { useCenterCursor, useDragging, useFocused } from "../../../hooks/utils";
import { EdstInput, FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../../styles/optionMenuStyles";
import { Row, Row2, Col1, Col2, ScrollContainer, ScrollRow, ScrollCol, ScrollCol2 } from "./styled";
import { InputContainer } from "../../InputComponents";
import { EdstDraggingOutline } from "../../../styles/draggingStyles";
import { EdstWindow } from "../../../namespaces";
import { mod } from "../../../lib";

const HeadingDiv = styled(OptionsMenu)`
  width: 190px;
`;

export const HeadingMenu: React.FC = () => {
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.HEADING_MENU));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  const [heading, setHeading] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [amend, setAmend] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel]);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.HEADING_MENU);

  useEffect(() => {
    setHeading(280);
    setDeltaY(0);
    setAmend(true);
  }, [asel]);

  const handleMouseDown = (event: React.MouseEvent, value: number, direction: string | null = null) => {
    const valueStr = direction === null ? `${amend ? "H" : ""}${value}` : `${value}${direction}`;

    switch (event.button) {
      case 0:
        break;
      case 1:
        break;
      default:
        break;
    }
    dispatch(closeWindow(EdstWindow.HEADING_MENU));
  };

  return (
    pos &&
    entry && (
      <HeadingDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.HEADING_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.HEADING_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.HEADING_MENU))}
        anyDragging={anyDragging}
        id="heading-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Heading Information
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.equipment.split("/")[0]}/${entry.nasSuffix}`}
          </FidRow>
          <Row
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
          >
            <OptionsBodyCol
            // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
            >
              <EdstButton content="Amend" selected={amend} onMouseDown={() => setAmend(true)} title={Tooltips.aclHdgAmend} />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Scratchpad" selected={!amend} onMouseDown={() => setAmend(false)} title={Tooltips.aclHdgScratchpad} />
            </OptionsBodyCol>
          </Row>
          <Row>
            <OptionsBodyCol>
              Heading:
              <InputContainer>
                <EdstInput value={heading} onChange={e => setHeading(Number(e.target.value))} />
              </InputContainer>
            </OptionsBodyCol>
          </Row>
          <Row2 topBorder justifyContent="space-between">
            <EdstTooltip title={Tooltips.aclHdgHdg}>
              <Col1>Heading</Col1>
            </EdstTooltip>
            <EdstTooltip title={Tooltips.aclHdgTurn}>
              <Col1>Turn</Col1>
            </EdstTooltip>
          </Row2>
          <Row2 bottomBorder>
            <Col2>L &nbsp;&nbsp; R</Col2>
          </Row2>
          <ScrollContainer onWheel={e => setDeltaY(deltaY + e.deltaY)}>
            {_.range(50, -70, -10).map(i => {
              const centerHdg = mod(heading - Math.round(deltaY / 100) * 10 + i, 360);
              const centerRelHdg = 35 + i / 2;
              return (
                <ScrollRow key={`heading-menu-${i}`}>
                  <ScrollCol onMouseDown={e => handleMouseDown(e, centerHdg)}>{String(centerHdg).padStart(3, "0")}</ScrollCol>
                  <ScrollCol onMouseDown={e => handleMouseDown(e, centerHdg + 5)}>{String(centerHdg + 5).padStart(3, "0")}</ScrollCol>
                  <ScrollCol2 onMouseDown={e => handleMouseDown(e, centerRelHdg, "L")}>{centerRelHdg}</ScrollCol2>
                  <ScrollCol2 onMouseDown={e => handleMouseDown(e, centerRelHdg, "R")}>{centerRelHdg}</ScrollCol2>
                </ScrollRow>
              );
            })}
            <Row margin="8px 0 0 0" justifyContent="center">
              <EdstButton
                content="Present Heading"
                onMouseDown={event => {
                  switch (event.button) {
                    case 0:
                      break;
                    case 1:
                      break;
                    default:
                      break;
                  }
                  dispatch(closeWindow(EdstWindow.HEADING_MENU));
                }}
              />
            </Row>
            <OptionsBodyRow margin="0">
              <OptionsBodyCol alignRight>
                <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.HEADING_MENU))} />
              </OptionsBodyCol>
            </OptionsBodyRow>
          </ScrollContainer>
        </OptionsBody>
      </HeadingDiv>
    )
  );
};
