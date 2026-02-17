import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselSelector, invertNumpadSelector, closeWindow, windowPositionSelector, zStackSelector, pushZStack } from "~redux/slices/appSlice";
import { useHubActions } from "hooks/useHubActions";
import { aselEntrySelector, updateEntry } from "~redux/slices/entrySlice";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstButton, ExitButton } from "components/utils/EdstButton";

import clsx from "clsx";
import optionStyles from "css/optionMenu.module.scss";
import speedStyles from "css/hdgSpdMenu.module.scss";
import inputStyles from "css/input.module.scss";
import { sendEramHeadingOrSpeedMessage } from "~/utils/eramMessageUtils";
import { LEFT_CLICK, RIGHT_CLICK } from "~/utils/constants";
import { openMenuThunk } from "~/redux/thunks/openMenuThunk";
import { Nullable } from "~/types/utility-types";

enum Sign {
  more = "+",
  less = "-",
  none = "",
}

export const SpeedMenu = () => {
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, "SPEED_MENU"));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const hubActions = useHubActions();
  const invertNumpad = useRootSelector(invertNumpadSelector);
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

  const handleMouseDown = async (event: React.MouseEvent, value: number, mach = false) => {
    const valueStr = !mach ? `${amend && sign === Sign.none ? "S" : ""}${value}${sign}` : `M${Math.round(value * 100)}${sign}`;
    switch (event.button) {
      case LEFT_CLICK:
        if (amend) {
          if (!entry.owned) {
            // Show eligibility menu for non-owned tracks
            dispatch(openMenuThunk("SPD_ELIGIBILITY_MENU"));
            return;
          }
          await sendSpeedEramMessage(`/${valueStr}`);
        } else {
          setSpeedInState(valueStr, true);
        }
        break;
      case RIGHT_CLICK:
        if (amend) {
          if (!entry.owned) {
            // Show eligibility menu for non-owned tracks
            dispatch(openMenuThunk("SPD_ELIGIBILITY_MENU"));
            return;
          }
          await sendSpeedEramMessage("/*");
        } else {
          setSpeedInState(null, true);
        }
        break;
      default:
        break;
    }
    dispatch(closeWindow("SPEED_MENU"));
  };

  const setSpeedInState = (value: Nullable<string>, local: boolean) => {
    dispatch(
      updateEntry({
        aircraftId: entry.aircraftId,
        data: local ? { localSpeed: value } : { assignedSpeed: value },
      })
    );
  };

  const sendSpeedEramMessage = async (value: string, forceOk = false) => {
    await sendEramHeadingOrSpeedMessage(value, entry.cid, invertNumpad, hubActions, forceOk);
  };

  return (
    <div
      className={clsx(speedStyles.root, { noPointerEvents: anyDragging })}
      ref={ref}
      style={{ ...pos, zIndex: 10000 + zStack.indexOf("SPEED_MENU") }}
      onMouseDown={() => zStack.indexOf("SPEED_MENU") < zStack.length - 1 && dispatch(pushZStack("SPEED_MENU"))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        Speed Information
      </div>
      <div className={optionStyles.body}>
        <div className={optionStyles.fidRow}>
          {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
        </div>
        <div className={speedStyles.row}>
          <div className={optionStyles.col}>
            <EdstButton content="Amend" selected={amend} onMouseDown={() => setAmend(true)} />
          </div>
          <div className={clsx(optionStyles.col, "right")}>
            <EdstButton content="Scratchpad" selected={!amend} onMouseDown={() => setAmend(false)} />
          </div>
        </div>
        <div className={optionStyles.row}>
          <div className={optionStyles.col}>
            Speed:
            <div className={clsx(inputStyles.inputContainer, "w5")}>
              <input value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
            </div>
          </div>
        </div>
        <div className={clsx(speedStyles.row2, "topBorder")} />
        <div className="bottomBorder">
          <div className={speedStyles.row}>
            <div style={{ marginLeft: "0.5ch" }}>KNOTS</div>
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
            <div style={{ marginRight: "0.5ch" }}>MACH</div>
          </div>
        </div>
        <div onWheel={handleScroll}>
          {_.range(5, -6, -1).map((i) => {
            const centerSpd = speed - Math.round(deltaY / 100) * 10 + i * 10;
            const centerMach = 0.79 - Math.round(deltaY / 100) / 100 + i / 100;
            return (
              <div className={speedStyles.scrollRow} key={i}>
                <div className={speedStyles.scrollCol} onMouseDown={(e) => handleMouseDown(e, centerSpd)}>
                  {centerSpd.toString().padStart(3, "0")}
                  {sign}
                </div>
                <div className={clsx(speedStyles.scrollCol, "rightMarginAuto")} onMouseDown={(e) => handleMouseDown(e, centerSpd + 5)}>
                  {(centerSpd + 5).toString().padStart(3, "0")}
                  {sign}
                </div>
                <div className={clsx(speedStyles.scrollCol, "rightMargin4")} onMouseDown={(e) => handleMouseDown(e, centerMach, true)}>
                  {centerMach.toFixed(2).toString().slice(1)}
                  {sign}
                </div>
              </div>
            );
          })}
          <div className={optionStyles.row}>
            <div className={clsx(optionStyles.col, "right")}>
              <ExitButton onMouseDown={() => dispatch(closeWindow("SPEED_MENU"))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
