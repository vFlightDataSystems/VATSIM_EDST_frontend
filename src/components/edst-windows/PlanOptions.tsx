import React, { useRef } from "react";
import styled from "styled-components";
import { EdstButton } from "../resources/EdstButton";
import { EdstTooltip } from "../resources/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { openMenuThunk } from "../../redux/thunks/thunks";
import {
  aselSelector,
  Asel,
  closeWindow,
  setAsel,
  zStackSelector,
  pushZStack,
  windowPositionSelector
} from "../../redux/slices/appSlice";
import { deleteAclEntry, deleteDepEntry, entrySelector } from "../../redux/slices/entriesSlice";
import { useCenterCursor, useDragging, useFocused } from "../../hooks";
import { FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { EdstWindow } from "../../namespaces";

const PlanOptionsDiv = styled(OptionsMenu)`
  width: 220px;
`;
const PlanOptionsBody = styled(OptionsBody)`
  text-indent: 4px;
`;

export const PlanOptions: React.FC = () => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector) as Asel;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.PLAN_OPTIONS));
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  const entry = useRootSelector(entrySelector(asel.aircraftId));
  const dep = asel.window === EdstWindow.DEP;
  useCenterCursor(ref, [asel]);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.PLAN_OPTIONS);

  function openMenu(menu: EdstWindow) {
    dispatch(openMenuThunk(menu, ref.current, EdstWindow.PLAN_OPTIONS, true));
    dispatch(closeWindow(EdstWindow.PLAN_OPTIONS));
  }

  return (
    pos && (
      <PlanOptionsDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.PLAN_OPTIONS)}
        onMouseDown={() => zStack.indexOf(EdstWindow.PLAN_OPTIONS) > 0 && dispatch(pushZStack(EdstWindow.PLAN_OPTIONS))}
        anyDragging={anyDragging}
        id="plan-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Plan Options Menu
        </OptionsMenuHeader>
        <PlanOptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.equipment.split("/")[0]}/${entry.nasSuffix}`}
          </FidRow>
          <OptionsBodyRow>
            <EdstTooltip style={{ flexGrow: 1 }} title={Tooltips.planOptionsAlt} onMouseDown={() => openMenu(EdstWindow.ALTITUDE_MENU)}>
              <OptionsBodyCol hover>Altitude...</OptionsBodyCol>
            </EdstTooltip>
          </OptionsBodyRow>
          {!dep && (
            <OptionsBodyRow>
              <EdstTooltip style={{ flexGrow: 1 }} title={Tooltips.planOptionsSpeed} disabled>
                <OptionsBodyCol hover>Speed...</OptionsBodyCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          <OptionsBodyRow>
            <EdstTooltip style={{ flexGrow: 1 }} title={Tooltips.planOptionsRoute} onMouseDown={() => openMenu(EdstWindow.ROUTE_MENU)}>
              <OptionsBodyCol hover>Route...</OptionsBodyCol>
            </EdstTooltip>
          </OptionsBodyRow>
          <OptionsBodyRow>
            <EdstTooltip
              style={{ flexGrow: 1 }}
              title={Tooltips.planOptionsPrevRoute}
              disabled={!!entry?.previousRoute}
              onMouseDown={() => openMenu(EdstWindow.PREV_ROUTE_MENU)}
            >
              <OptionsBodyCol hover>Previous Route</OptionsBodyCol>
            </EdstTooltip>
          </OptionsBodyRow>
          {!dep && (
            <OptionsBodyRow>
              <EdstTooltip style={{ flexGrow: 1 }} title={Tooltips.planOptionsStopProbe} disabled>
                <OptionsBodyCol hover>Stop Probe...</OptionsBodyCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          <OptionsBodyRow>
            <EdstTooltip style={{ flexGrow: 1 }} title={Tooltips.planOptionsTrialRestr} disabled>
              <OptionsBodyCol hover>{`Trial ${dep ? "Departure" : "Restrictions"}...`}</OptionsBodyCol>
            </EdstTooltip>
          </OptionsBodyRow>
          {!dep && (
            <OptionsBodyRow>
              <EdstTooltip style={{ flexGrow: 1 }} title={Tooltips.planOptionsPlans}>
                <OptionsBodyCol hover>Plans</OptionsBodyCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          <OptionsBodyRow>
            <EdstTooltip style={{ flexGrow: 1 }} title={Tooltips.planOptionsKeep}>
              <OptionsBodyCol hover>Keep</OptionsBodyCol>
            </EdstTooltip>
          </OptionsBodyRow>
          <OptionsBodyRow>
            <EdstTooltip
              style={{ flexGrow: 1 }}
              title={Tooltips.planOptionsDelete}
              onMouseDown={() => {
                dispatch(asel.window === EdstWindow.ACL ? deleteAclEntry(asel.aircraftId) : deleteDepEntry(asel.aircraftId));
                dispatch(setAsel(null));
                dispatch(closeWindow(EdstWindow.PLAN_OPTIONS));
              }}
            >
              <OptionsBodyCol hover>Delete</OptionsBodyCol>
            </EdstTooltip>
          </OptionsBodyRow>
          <OptionsBodyRow margin="0">
            <OptionsBodyCol alignRight>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.PLAN_OPTIONS))} />
            </OptionsBodyCol>
          </OptionsBodyRow>
        </PlanOptionsBody>
      </PlanOptionsDiv>
    )
  );
};
