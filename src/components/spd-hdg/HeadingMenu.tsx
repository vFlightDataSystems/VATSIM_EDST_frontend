import React, { useEffect, useRef, useState } from "react";

import _ from "lodash";
import type { Nullable } from "types/utility-types";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselSelector, zStackSelector, pushZStack, windowPositionSelector, invertNumpadSelector, closeWindow } from "~redux/slices/appSlice";
import { useHubActions } from "hooks/useHubActions";
import { aselEntrySelector, updateEntry } from "~redux/slices/entrySlice";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { mod } from "~/utils/mod";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstButton, ExitButton } from "components/utils/EdstButton";
import optionStyles from "css/optionMenu.module.scss";
import headingStyles from "css/hdgSpdMenu.module.scss";
import inputStyles from "css/input.module.scss";
import clsx from "clsx";
import { openMenuThunk } from "~/redux/thunks/openMenuThunk";
import { sendEramHeadingOrSpeedMessage } from "~/utils/eramMessageUtils";
import { LEFT_CLICK, RIGHT_CLICK } from "~/utils/constants";

export const HeadingMenu = () => {
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, "HEADING_MENU"));
  const zStack = useRootSelector(zStackSelector);
  const invertNumpad = useRootSelector(invertNumpadSelector);
  const dispatch = useRootDispatch();
  const hubActions = useHubActions();

  const [heading, setHeading] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [amend, setAmend] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel.aircraftId]);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "HEADING_MENU", "mouseup");

  useEffect(() => {
    setHeading(280);
    setDeltaY(0);
    setAmend(true);
  }, [asel]);

  const handleMouseDown = async (event: React.MouseEvent, value: number | string, direction: Nullable<string> = null) => {
    let valueStr;
    if (value === "PH") {
      valueStr = "PH";
    } else if (direction === null) {
      valueStr = `${amend ? "H" : ""}${value}`;
    } else {
      valueStr = `${value}${direction}`;
    }

    switch(event.button) {
      case LEFT_CLICK:
        if (amend) {
          if (!entry.owned) {
            // Show eligibility menu for non-owned tracks
            dispatch(openMenuThunk("HDG_ELIGIBILITY_MENU"));
            return;
          }
          await sendHeadingEramMessage(valueStr);
        } else {
          setHeadingInState(valueStr, true);
        }
        break;
      case RIGHT_CLICK:
        if (amend) {
          if (!entry.owned) {
            // Show eligibility menu for non-owned tracks
            dispatch(openMenuThunk("HDG_ELIGIBILITY_MENU"));
            return;
          }
          await sendHeadingEramMessage("*/");
        } else {
          setHeadingInState(null, true);
        }
        break;
      default:
        break;
    }
    dispatch(closeWindow("HEADING_MENU"));
  };

  const setHeadingInState = (value: Nullable<string>, local: boolean) => {
    dispatch(
      updateEntry({
        aircraftId: entry.aircraftId,
        data: local ? { localHeading: value } : { assignedHeading: value },
      })
    );
  };

  const sendHeadingEramMessage = async (value: string, forceOk = false) => {
    await sendEramHeadingOrSpeedMessage(value, entry.cid, invertNumpad, hubActions, forceOk);
  };

  return (
    <div
      className={clsx(headingStyles.root, { noPointerEvents: anyDragging })}
      ref={ref}
      style={{ ...pos, zIndex: 10000 + zStack.indexOf("HEADING_MENU") }}
      onMouseDown={() => zStack.indexOf("HEADING_MENU") < zStack.length - 1 && dispatch(pushZStack("HEADING_MENU"))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        Heading Information
      </div>
      <div className={optionStyles.body}>
        <div className={optionStyles.fidRow}>
          {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
        </div>
        <div className={headingStyles.row}>
          <div className={optionStyles.col}>
            <EdstButton content="Amend" selected={amend} onMouseDown={() => setAmend(true)} />
          </div>
          <div className={clsx(optionStyles.col, "right")}>
            <EdstButton content="Scratchpad" selected={!amend} onMouseDown={() => setAmend(false)} />
          </div>
        </div>
        <div>
          <div className={optionStyles.col}>
            Heading &nbsp;
            <div className={clsx(inputStyles.inputContainer, "w5")}>
              <input value={heading} onChange={(e) => setHeading(Number(e.target.value))} />
            </div>
          </div>
        </div>
        <div className={clsx(headingStyles.row2, "topBorder", "spaceBetween")}>
          <div className={headingStyles.hdgColLeft}>Heading</div>
          <div className={headingStyles.hdgColRight}>Turn</div>
        </div>
        <div className="bottomBorder">
          <div className={headingStyles.scrollRow}>
            <div className={clsx(headingStyles.scrollCol, "header")} />
            <div className={clsx(headingStyles.scrollCol, "header")} />
            <div className={clsx(headingStyles.scrollCol, "header", "autoMargin", "w2")}>L</div>
            <div className={clsx(headingStyles.scrollCol, "header", "autoMargin", "w2")}>R</div>
          </div>
        </div>
        <div onWheel={(e) => setDeltaY(deltaY + e.deltaY)}>
          {_.range(50, -70, -10).map((i) => {
            const centerHdg = mod(heading - Math.round(deltaY / 100) * 10 + i, 360);
            const centerRelHdg = 35 + i / 2;
            return (
              <div className={headingStyles.scrollRow} key={i}>
                <div className={headingStyles.scrollCol} onMouseDown={(e) => handleMouseDown(e, centerHdg)}>
                  {centerHdg.toString().padStart(3, "0")}
                </div>
                <div className={headingStyles.scrollCol} onMouseDown={(e) => handleMouseDown(e, centerHdg + 5)}>
                  {(centerHdg + 5).toString().padStart(3, "0")}
                </div>
                <div className={clsx(headingStyles.scrollCol, "w2", "autoMargin")} onMouseDown={(e) => handleMouseDown(e, centerRelHdg, "L")}>
                  {centerRelHdg}
                </div>
                <div className={clsx(headingStyles.scrollCol, "w2", "autoMargin")} onMouseDown={(e) => handleMouseDown(e, centerRelHdg, "R")}>
                  {centerRelHdg}
                </div>
              </div>
            );
          })}
          <div className={headingStyles.phRow}>
            <EdstButton content="Present Heading" onMouseDown={(e) => handleMouseDown(e, "PH")} />
          </div>
          <div className={optionStyles.row}>
            <div className={clsx(optionStyles.col, "right")}>
              <ExitButton onMouseDown={() => dispatch(closeWindow("HEADING_MENU"))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
