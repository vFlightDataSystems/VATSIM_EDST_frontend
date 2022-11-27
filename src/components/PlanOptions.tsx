import React, { useCallback, useRef } from "react";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselSelector, closeAllMenus, closeWindow, pushZStack, setAsel, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { delEntry, entrySelector, updateEntry } from "~redux/slices/entrySlice";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import type { EdstWindow } from "types/edstWindow";
import { useSharedUiListener } from "hooks/useSharedUiListener";
import type { SharedUiEvent } from "types/sharedStateTypes/sharedUiEvent";
import socket from "~socket";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { ExitButton } from "components/utils/EdstButton";
import optionStyles from "css/optionMenu.module.scss";
import clsx from "clsx";
import planOptionStyles from "css/planOptions.module.scss";

type PlanOptionsRowProps = {
  title?: string;
  content: string;
  onMouseDown?: React.MouseEventHandler;
  disabled?: boolean;
};
const PlanOptionsRow = ({ content, disabled, ...props }: PlanOptionsRowProps) => (
  <div className={optionStyles.row}>
    <div className={clsx(optionStyles.col, "withHover", { isDisabled: disabled })} {...props}>
      {content}
    </div>
  </div>
);

export const PlanOptions = () => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, "PLAN_OPTIONS"));
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const entry = useRootSelector((state) => entrySelector(state, asel.aircraftId));
  const dep = asel.window === "DEP";
  useCenterCursor(ref, [asel.aircraftId]);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "PLAN_OPTIONS", "mouseup");

  const openMenu = useCallback(
    (menu: EdstWindow, eventId?: SharedUiEvent, triggerSharedState = true) => {
      dispatch(openMenuThunk(menu, ref.current, false, true));
      dispatch(closeWindow("PLAN_OPTIONS", false));
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
    <div
      className={clsx(planOptionStyles.root, { noPointerEvents: anyDragging })}
      ref={ref}
      style={{ ...pos, zIndex: 10000 + zStack.indexOf("PLAN_OPTIONS") }}
      onMouseDown={() => zStack.indexOf("PLAN_OPTIONS") < zStack.length - 1 && dispatch(pushZStack("PLAN_OPTIONS"))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        Plan Options Menu
      </div>
      <div className={planOptionStyles.body}>
        <div className={optionStyles.fidRow}>
          {entry.cid} {entry.aircraftId}
        </div>
        <PlanOptionsRow title={Tooltips.planOptionsAlt} content="Altitude..." onMouseDown={() => openMenu("ALTITUDE_MENU")} />
        {!dep && <PlanOptionsRow title={Tooltips.planOptionsSpeed} content="Speed..." disabled />}
        <PlanOptionsRow title={Tooltips.planOptionsRoute} content="Route..." onMouseDown={() => openMenu("ROUTE_MENU")} />
        <PlanOptionsRow
          title={Tooltips.planOptionsPrevRoute}
          content="Previous Route"
          onMouseDown={() => openMenu("PREV_ROUTE_MENU")}
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
            dispatch(closeWindow("PLAN_OPTIONS"));
          }}
        />
        <div className={optionStyles.bottomRow}>
          <div className={clsx(optionStyles.col, "right")}>
            <ExitButton onMouseDown={() => dispatch(closeWindow("PLAN_OPTIONS"))} />
          </div>
        </div>
      </div>
    </div>
  );
};
