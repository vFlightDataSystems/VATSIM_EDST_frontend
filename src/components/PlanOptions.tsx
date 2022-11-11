import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselSelector, closeAllMenus, closeWindow, pushZStack, setAsel, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { delEntry, entrySelector, updateEntry } from "~redux/slices/entrySlice";
import { FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "styles/optionMenuStyles";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { EdstWindow } from "enums/edstWindow";
import { useSharedUiListener } from "hooks/useSharedUiListener";
import type { SharedUiEvent } from "types/sharedStateTypes/sharedUiEvent";
import socket from "~socket";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { ExitButton } from "components/utils/EdstButton";

const PlanOptionsDiv = styled(OptionsMenu)`
  width: 24ch;
`;
const PlanOptionsBody = styled(OptionsBody)`
  text-indent: 4px;
`;

type PlanOptionsRowProps = {
  title?: string;
  content: string;
  onMouseDown?: React.MouseEventHandler;
  disabled?: boolean;
};
const PlanOptionsRow = ({ content, ...props }: PlanOptionsRowProps) => (
  <OptionsBodyRow>
    <OptionsBodyCol {...props} hover>
      {content}
    </OptionsBodyCol>
  </OptionsBodyRow>
);

export const PlanOptions = () => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, EdstWindow.PLAN_OPTIONS));
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const entry = useRootSelector((state) => entrySelector(state, asel.aircraftId));
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
    <PlanOptionsDiv
      ref={ref}
      pos={pos}
      zIndex={zStack.indexOf(EdstWindow.PLAN_OPTIONS)}
      onMouseDown={() => zStack.indexOf(EdstWindow.PLAN_OPTIONS) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.PLAN_OPTIONS))}
      anyDragging={anyDragging}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
        Plan Options Menu
      </OptionsMenuHeader>
      <PlanOptionsBody>
        <FidRow>
          {entry.cid} {entry.aircraftId}
        </FidRow>
        <PlanOptionsRow title={Tooltips.planOptionsAlt} content="Altitude..." onMouseDown={() => openMenu(EdstWindow.ALTITUDE_MENU)} />
        {!dep && <PlanOptionsRow title={Tooltips.planOptionsSpeed} content="Speed..." disabled />}
        <PlanOptionsRow title={Tooltips.planOptionsRoute} content="Route..." onMouseDown={() => openMenu(EdstWindow.ROUTE_MENU)} />
        <PlanOptionsRow
          title={Tooltips.planOptionsPrevRoute}
          content="Previous Route"
          onMouseDown={() => openMenu(EdstWindow.PREV_ROUTE_MENU)}
          disabled={!!entry?.previousRoute}
        />
        {!dep && <PlanOptionsRow title={Tooltips.planOptionsStopProbe} content="Stop Probe..." disabled />}
        <PlanOptionsRow title={Tooltips.planOptionsTrialRestr} content={`Trial ${dep ? "Departure" : "Restrictions"}...`} disabled />
        {!dep && <PlanOptionsRow title={Tooltips.planOptionsPlans} content="Plans" disabled />}
        <PlanOptionsRow title={Tooltips.planOptionsKeep} content="Keep" onMouseDown={onKeepClick} />
        <PlanOptionsRow
          title={Tooltips.planOptionsDelete}
          content="Delete"
          onMouseDown={() => {
            dispatch(setAsel(null));
            dispatch(closeAllMenus());
            dispatch(delEntry(entry.aircraftId));
            dispatch(closeWindow(EdstWindow.PLAN_OPTIONS));
          }}
        />
        <OptionsBodyRow margin="0">
          <OptionsBodyCol alignRight>
            <ExitButton onMouseDown={() => dispatch(closeWindow(EdstWindow.PLAN_OPTIONS))} />
          </OptionsBodyCol>
        </OptionsBodyRow>
      </PlanOptionsBody>
    </PlanOptionsDiv>
  );
};
