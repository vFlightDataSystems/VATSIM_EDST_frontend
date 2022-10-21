import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import { ExitButton } from "../utils/EdstButton";
import { EdstTooltip } from "../utils/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselSelector, closeAllMenus, closeWindow, pushZStack, setAsel, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { delEntry, entrySelector, updateEntry } from "../../redux/slices/entrySlice";
import { FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { openMenuThunk } from "../../redux/thunks/openMenuThunk";
import { useDragging } from "../../hooks/useDragging";
import { useCenterCursor } from "../../hooks/useCenterCursor";
import { useFocused } from "../../hooks/useFocused";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useSharedUiListener } from "../../hooks/useSharedUiListener";
import socket from "../../sharedState/socket";
import { SharedUiEvent } from "../../typeDefinitions/types/sharedStateTypes/sharedUiEvent";

const PlanOptionsDiv = styled(OptionsMenu)`
  width: 20ch;
`;
const PlanOptionsBody = styled(OptionsBody)`
  text-indent: 4px;
`;

export const PlanOptions = () => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector)!;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.PLAN_OPTIONS));
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const entry = useRootSelector(entrySelector(asel.aircraftId));
  const dep = asel.window === EdstWindow.DEP;
  useCenterCursor(ref, [asel.aircraftId]);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.PLAN_OPTIONS, "mouseup");

  const openMenu = useCallback(
    (menu: EdstWindow, eventId?: SharedUiEvent, triggerSharedState = true) => {
      dispatch(openMenuThunk(menu, ref.current, false, true));
      dispatch(closeWindow(EdstWindow.PLAN_OPTIONS, false));
      if (triggerSharedState) {
        socket.dispatchUiEvent("planOptionsOpenMenu", menu);
      }
    },
    [dispatch]
  );

  useSharedUiListener<EdstWindow>("planOptionsOpenMenu", openMenu);

  const onKeepClick = () => {
    dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { keep: true } }));
  };

  return (
    pos && (
      <PlanOptionsDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.PLAN_OPTIONS)}
        onMouseDown={() => zStack.indexOf(EdstWindow.PLAN_OPTIONS) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.PLAN_OPTIONS))}
        anyDragging={anyDragging}
        id="plan-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
          Plan Options Menu
        </OptionsMenuHeader>
        <PlanOptionsBody>
          <FidRow>
            {entry.cid} {entry.aircraftId}
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
              <OptionsBodyCol hover onMouseDown={onKeepClick}>
                Keep
              </OptionsBodyCol>
            </EdstTooltip>
          </OptionsBodyRow>
          <OptionsBodyRow>
            <EdstTooltip
              style={{ flexGrow: 1 }}
              title={Tooltips.planOptionsDelete}
              onMouseDown={() => {
                dispatch(setAsel(null));
                dispatch(closeAllMenus());
                dispatch(delEntry(entry.aircraftId));
                dispatch(closeWindow(EdstWindow.PLAN_OPTIONS));
              }}
            >
              <OptionsBodyCol hover>Delete</OptionsBodyCol>
            </EdstTooltip>
          </OptionsBodyRow>
          <OptionsBodyRow margin="0">
            <OptionsBodyCol alignRight>
              <ExitButton onMouseDown={() => dispatch(closeWindow(EdstWindow.PLAN_OPTIONS))} />
            </OptionsBodyCol>
          </OptionsBodyRow>
        </PlanOptionsBody>
      </PlanOptionsDiv>
    )
  );
};
