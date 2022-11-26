import React, { useRef, useState } from "react";
import _ from "lodash";
import { useEventListener } from "usehooks-ts";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import type { Nullable } from "types/utility-types";
import { aselSelector, closeWindow, windowPositionSelector } from "~redux/slices/appSlice";
import { addPlanThunk } from "~redux/thunks/addPlanThunk";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useHubActions } from "hooks/useHubActions";
import { ALTITUDE_VALIDATION_EXPRESSIONS, DOWNLINK_SYMBOL } from "~/utils/constants";
import type { Plan } from "types/plan";
import { useFitWindowToScreen } from "hooks/useFitWindowToScreen";
import clsx from "clsx";
import altStyles from "css/altMenu.module.scss";

function validateAltitudeInput(input: string) {
  // check if input is a number and length matches valid input
  // +"string" will convert the string to a number or NaN
  // it is called the unary plus operator
  return Object.values(ALTITUDE_VALIDATION_EXPRESSIONS).some((regex) => regex.test(input));
}

export const AltMenu = () => {
  const ref = useRef<HTMLDivElement>(null);
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, "ALTITUDE_MENU"));
  const dispatch = useRootDispatch();
  const [selected, setSelected] = useState(asel.window !== "DEP" ? "trial" : "amend");
  const [tempAltHover, setTempAltHover] = useState<Nullable<number>>(null);
  const [deltaY, setDeltaY] = useState(0);
  const [manualInput, setManualInput] = useState<Nullable<string>>(null);
  const [showInvalid, setShowInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { amendFlightplan } = useHubActions();
  useFitWindowToScreen(ref, "ALTITUDE_MENU");

  const assignedAltitude = Number.isFinite(+entry.altitude) ? +entry.altitude : 200;

  useCenterCursor(ref, [asel.aircraftId]);

  const handleAltClick = (alt: string | number) => {
    const amendedFlightplan = {
      ...entry,
      altitude: alt.toString().toUpperCase(),
    };
    if (selected === "amend") {
      void amendFlightplan(amendedFlightplan);
    } else {
      const trialPlanData: Plan = {
        cid: entry.cid,
        aircraftId: entry.aircraftId,
        amendedFlightplan,
        commandString: `AM ${entry.aircraftId} ALT ${alt}`,
        expirationTime: Date.now() / 1000 + 120,
      };
      dispatch(addPlanThunk(trialPlanData));
    }
    dispatch(closeWindow("ALTITUDE_MENU"));
  };

  const handleTempAltClick = (alt: number) => {
    // dispatch(addTrialPlanThunk(trialPlanData));
    dispatch(closeWindow("ALTITUDE_MENU"));
  };

  const handleScroll: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const newDeltaY = Math.min(Math.max((assignedAltitude - 560) * 10, deltaY + e.deltaY), (assignedAltitude - 40) * 10);
    setDeltaY(newDeltaY);
  };

  const keyDownHandler = (event: KeyboardEvent) => {
    if (manualInput === null && event.key.length === 1) {
      setManualInput(event.key);
    }
    if (!(document.activeElement === inputRef.current) && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEventListener("keydown", keyDownHandler);

  const centerAlt = Math.max(40, Math.min(560, (Number.isFinite(+entry.altitude) ? +entry.altitude : 200) - Math.round(deltaY / 100) * 10));

  return (
    <div className={clsx(altStyles.root, { manualInput: manualInput !== null })} ref={ref} style={pos}>
      <div className={altStyles.header}>
        <div className={clsx(altStyles.headerCol, "flex")}>{entry?.aircraftId}</div>
        <div className={altStyles.headerXCol} onMouseDown={() => dispatch(closeWindow("ALTITUDE_MENU"))}>
          X
        </div>
      </div>
      {manualInput !== null && (
        <>
          <div className={clsx(altStyles.row, "noHover")}>FP{entry.altitude}</div>
          <div className={clsx(altStyles.row, "bgBlack")}>
            <input
              ref={inputRef}
              spellCheck={false}
              tabIndex={0}
              value={manualInput}
              onChange={(event) => setManualInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  if (validateAltitudeInput(manualInput)) {
                    handleAltClick(manualInput);
                  } else {
                    setShowInvalid(true);
                  }
                }
              }}
            />
          </div>
          {showInvalid && <div className={clsx(altStyles.row, "invalid", "noHover")}>INVALID</div>}
        </>
      )}
      {manualInput === null && (
        <>
          <div
            className={clsx(altStyles.row, { selected: selected === "trial", isDisabled: asel.window === "DEP" })}
            title={Tooltips.altMenuPlanData}
            onMouseDown={() => setSelected("trial")}
          >
            TRIAL PLAN
          </div>
          <div
            className={clsx(altStyles.row, { selected: selected === "amend" })}
            title={Tooltips.altMenuAmend}
            onMouseDown={() => setSelected("amend")}
          >
            AMEND
          </div>
          <div className={clsx(altStyles.row, "noHover")}>FP{entry.altitude}</div>
          <div className={clsx(altStyles.row, "isDisabled")}>UPLINK</div>
          <div className={clsx(altStyles.row, "isDisabled")}>
            <div className={altStyles.col}>PD</div>
            <div className={altStyles.col}>TFC</div>
            <div className={clsx(altStyles.col, "uplink")}>{DOWNLINK_SYMBOL}</div>
          </div>
          <div className={clsx(altStyles.row, "isDisabled")}>{asel.window !== "DEP" ? "PROCEDURE" : "NO ALT"}</div>
          <div className={altStyles.selectContainer} onWheel={handleScroll}>
            {_.range(30, -40, -10).map((i) => {
              const alt = centerAlt + i;
              return (
                <div className={clsx(altStyles.scrollRow, { hover: selected === "amend" && tempAltHover === alt })} key={i}>
                  <div className={clsx(altStyles.scrollCol, { selected: alt === +entry.altitude })} onMouseDown={() => handleAltClick(alt)}>
                    {alt.toString().padStart(3, "0")}
                  </div>
                  {asel.window !== "DEP" && (
                    <div
                      className={clsx(altStyles.tempAltCol, { isDisabled: !(selected === "amend") })}
                      title={Tooltips.altMenuT}
                      onMouseEnter={() => selected === "amend" && setTempAltHover(alt)}
                      onMouseLeave={() => selected === "amend" && setTempAltHover(null)}
                      onMouseDown={() => handleTempAltClick(alt)}
                    >
                      T
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
