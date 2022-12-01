import React, { useEffect, useRef, useState } from "react";

import _ from "lodash";
import type { Nullable } from "types/utility-types";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselSelector, zStackSelector, pushZStack, windowPositionSelector, closeWindow } from "~redux/slices/appSlice";
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

export const HeadingMenu = () => {
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, "HEADING_MENU"));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  const [heading, setHeading] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [amend, setAmend] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel.aircraftId]);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "HEADING_MENU", "mouseup");

  useEffect(() => {
    setHeading(280);
    setDeltaY(0);
    setAmend(true);
  }, [asel]);

  const handleMouseDown = (event: React.MouseEvent, value: number, direction: Nullable<string> = null) => {
    const valueStr = direction === null ? `${amend ? "H" : ""}${value}` : `${value}${direction}`;

    switch (event.button) {
      case 0:
        if (amend) {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { scratchpadHeading: null },
            })
          );
          // set assigned heading
        } else {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { scratchpadHeading: valueStr },
            })
          );
          // delete assigned heading
        }
        break;
      case 1:
        if (amend) {
          // set assigned heading
        } else {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { scratchpadHeading: valueStr },
            })
          );
        }
        break;
      default:
        break;
    }
    dispatch(closeWindow("HEADING_MENU"));
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
            <EdstButton content="Amend" selected={amend} onMouseDown={() => setAmend(true)} title={Tooltips.aclHdgAmend} />
          </div>
          <div className={clsx(optionStyles.col, "right")}>
            <EdstButton content="Scratchpad" selected={!amend} onMouseDown={() => setAmend(false)} title={Tooltips.aclHdgScratchpad} />
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
          <div className={headingStyles.hdgColLeft} title={Tooltips.aclHdgHdg}>
            Heading
          </div>
          <div className={headingStyles.hdgColRight} title={Tooltips.aclHdgTurn}>
            Turn
          </div>
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
            <EdstButton
              content="Present Heading"
              onMouseDown={(event) => {
                switch (event.button) {
                  case 0:
                    break;
                  case 1:
                    break;
                  default:
                    break;
                }
                dispatch(closeWindow("HEADING_MENU"));
              }}
            />
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
