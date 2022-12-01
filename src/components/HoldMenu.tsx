import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import type { Nullable } from "types/utility-types";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector, toggleSpa, updateEntry } from "~redux/slices/entrySlice";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { aselTrackSelector } from "~redux/slices/trackSlice";
import type { RouteFix } from "types/routeFix";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { CompassDirection } from "types/hold/compassDirection";
import { TurnDirection } from "types/hold/turnDirection";
import type { HoldAnnotations } from "types/hold/holdAnnotations";
import { useHubActions } from "hooks/useHubActions";
import { openWindowThunk } from "~redux/thunks/openWindowThunk";
import { useRouteFixes } from "api/aircraftApi";
import { computeCrossingTimes } from "~/utils/computeCrossingTimes";
import { formatUtcMinutes } from "~/utils/formatUtcMinutes";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstButton, HoldDirButton2ch, HoldDirButton22ch, HoldDirButton5ch, ExitButton } from "components/utils/EdstButton";
import { getUtcMinutesAfterMidnight } from "~/utils/getUtcMinutesAfterMidnight";
import clsx from "clsx";
import optionStyles from "css/optionMenu.module.scss";
import inputStyles from "css/input.module.scss";
import holdStyles from "css/holdMenu.module.scss";

export const HoldMenu = () => {
  const entry = useRootSelector(aselEntrySelector)!;
  const track = useRootSelector(aselTrackSelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, "HOLD_MENU"));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  const [fix, setFix] = useState<Nullable<string>>(null);
  const [legLength, setLegLength] = useState<Nullable<number>>(null);
  const [direction, setDirection] = useState<CompassDirection>(CompassDirection.NORTH);
  const [turns, setTurns] = useState<TurnDirection>(TurnDirection.RIGHT);
  const [efc, setEfc] = useState(getUtcMinutesAfterMidnight());
  const [holdRouteFixes, setHoldRouteFixes] = useState<(RouteFix & { minutesAtFix: number })[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const holdAnnotationRef = useRef<Nullable<HoldAnnotations>>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "HOLD_MENU", "mouseup");
  const hubActions = useHubActions();
  const routeFixes = useRouteFixes(entry.aircraftId);

  useEffect(() => {
    if (!_.isEqual(entry.holdAnnotations, holdAnnotationRef.current) || !holdRouteFixes) {
      const holdRouteFixes = computeCrossingTimes(entry, routeFixes, track);
      const utcMinutes = getUtcMinutesAfterMidnight();
      setFix(entry.holdAnnotations?.fix ?? null);
      setLegLength(entry.holdAnnotations?.legLength ?? null);
      setDirection(entry.holdAnnotations?.direction ?? CompassDirection.NORTH);
      setTurns(entry.holdAnnotations?.turns ?? TurnDirection.RIGHT);
      setEfc(entry.holdAnnotations?.efc ?? utcMinutes + 30);
      setHoldRouteFixes(holdRouteFixes ?? null);
    }
    holdAnnotationRef.current = entry.holdAnnotations;
  }, [dispatch, entry, holdRouteFixes, routeFixes, track]);

  const clearedHold = () => {
    if (entry) {
      const holdAnnotations: HoldAnnotations = {
        fix,
        legLength,
        legLengthInNm: true,
        direction,
        turns,
        efc,
      };
      void hubActions.setHoldAnnotations(entry.aircraftId, holdAnnotations);
    }
    dispatch(closeWindow("HOLD_MENU"));
  };

  return (
    <div
      className={clsx(holdStyles.root, { noPointerEvents: anyDragging })}
      ref={ref}
      style={{ ...pos, zIndex: 10000 + zStack.indexOf("HOLD_MENU") }}
      onMouseDown={() => zStack.indexOf("HOLD_MENU") < zStack.length - 1 && dispatch(pushZStack("HOLD_MENU"))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        Hold Data Menu
      </div>
      <div className={optionStyles.body}>
        <div className={optionStyles.fidRow}>
          {entry.cid} {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
        </div>
        <div className={optionStyles.row}>
          <div className={holdStyles.leftCol} title={Tooltips.holdDirection}>
            Location
          </div>
        </div>
        <div className={optionStyles.row}>
          <div className={optionStyles.col}>
            <EdstButton
              content="Present Position"
              selected={fix === null}
              onMouseDown={() => {
                const utcMinutes = getUtcMinutesAfterMidnight();
                setFix(null);
                setEfc(utcMinutes + 30);
              }}
            />
          </div>
        </div>
        <div className={holdStyles.fixContainer}>
          {holdRouteFixes &&
            _.range(0, Math.min(holdRouteFixes.length || 0, 10)).map((i) => (
              <div className={optionStyles.row} key={i}>
                {_.range(0, Math.round((holdRouteFixes.length || 0) / 10) + 1).map((j) => {
                  const fixName = holdRouteFixes?.[Number(i) + Number(j) * 10]?.name;
                  const minutesAtFix = holdRouteFixes?.[Number(i) + Number(j) * 10]?.minutesAtFix;
                  return (
                    fixName && (
                      <div
                        className={clsx(holdStyles.fixCol, { selected: fix === fixName })}
                        key={`${i}-${j}`}
                        onMouseDown={() => {
                          setFix(fixName);
                          setEfc(minutesAtFix + 30);
                        }}
                      >
                        {fixName}
                        <div className={holdStyles.eftCol}>
                          {`0${Math.floor(minutesAtFix / 60) % 24}`.slice(-2) + `0${Math.floor(minutesAtFix % 60)}`.slice(-2)}
                        </div>
                      </div>
                    )
                  );
                })}
              </div>
            ))}
        </div>
        <div className={holdStyles.row1}>
          <div className={holdStyles.col2} title={Tooltips.holdDirection}>
            Direction
          </div>
          <div className={holdStyles.col2} title={Tooltips.holdTurns}>
            Turns
          </div>
          <div className={holdStyles.col2} title={Tooltips.holdLegLength}>
            Leg Length
          </div>
        </div>
        <div className={holdStyles.row1}>
          <div className={holdStyles.col3}>
            <HoldDirButton2ch
              content="NW"
              selected={direction === CompassDirection.NORTH_WEST}
              onMouseDown={() => setDirection(CompassDirection.NORTH_WEST)}
            />
            <HoldDirButton2ch content="N" selected={direction === CompassDirection.NORTH} onMouseDown={() => setDirection(CompassDirection.NORTH)} />
            <HoldDirButton2ch
              content="NE"
              selected={direction === CompassDirection.NORTH_EAST}
              onMouseDown={() => setDirection(CompassDirection.NORTH_EAST)}
            />
          </div>
          <div className={holdStyles.col3}>
            <HoldDirButton22ch content="LT" selected={turns === TurnDirection.LEFT} onMouseDown={() => setTurns(TurnDirection.LEFT)} />
            <HoldDirButton22ch content="RT" selected={turns === TurnDirection.RIGHT} onMouseDown={() => setTurns(TurnDirection.RIGHT)} />
          </div>
          <div className={holdStyles.col3}>
            <HoldDirButton5ch content="STD" selected={legLength === null} onMouseDown={() => setLegLength(null)} />
            <HoldDirButton5ch content="15 NM" selected={legLength === 15} onMouseDown={() => setLegLength(15)} />
          </div>
        </div>
        <div className={holdStyles.row1}>
          <div className={holdStyles.col3}>
            <HoldDirButton2ch content="W" selected={direction === CompassDirection.WEST} onMouseDown={() => setDirection(CompassDirection.WEST)} />
            <HoldDirButton2ch disabled />
            <HoldDirButton2ch content="E" selected={direction === CompassDirection.EAST} onMouseDown={() => setDirection(CompassDirection.EAST)} />
          </div>
          <div className={holdStyles.col3} />
          <div className={holdStyles.col3}>
            <HoldDirButton5ch content="5 NM" selected={legLength === 5} onMouseDown={() => setLegLength(5)} />
            <HoldDirButton5ch content="20 NM" selected={legLength === 20} onMouseDown={() => setLegLength(20)} />
          </div>
        </div>
        <div className={holdStyles.row1}>
          <div className={holdStyles.col3}>
            <HoldDirButton2ch
              content="SW"
              selected={direction === CompassDirection.SOUTH_WEST}
              onMouseDown={() => setDirection(CompassDirection.SOUTH_WEST)}
            />
            <HoldDirButton2ch content="S" selected={direction === CompassDirection.SOUTH} onMouseDown={() => setDirection(CompassDirection.SOUTH)} />
            <HoldDirButton2ch
              content="SE"
              selected={direction === CompassDirection.SOUTH_EAST}
              onMouseDown={() => setDirection(CompassDirection.SOUTH_EAST)}
            />
          </div>
          <div className={holdStyles.col3} />
          <div className={holdStyles.col3}>
            <HoldDirButton5ch content="10 NM" selected={legLength === 10} onMouseDown={() => setLegLength(10)} />
            <HoldDirButton5ch content="25 NM" selected={legLength === 25} onMouseDown={() => setLegLength(25)} />
          </div>
        </div>
        <div className={clsx(holdStyles.row2, "bottomBorder")}>
          <div className={holdStyles.col5}>
            <EdstButton
              content="Delete Hold Instructions"
              padding="0 20px"
              onMouseDown={() => {
                dispatch(
                  updateEntry({
                    aircraftId: entry.aircraftId,
                    data: { routeDisplay: null },
                  })
                );
                dispatch(closeWindow("HOLD_MENU"));
              }}
              title={Tooltips.holdDeleteHoldInstr}
            />
          </div>
        </div>
        <div className={holdStyles.row1}>
          <div className={holdStyles.col2} title={Tooltips.holdEfc}>
            EFC
          </div>
        </div>
        <div className={optionStyles.col}>
          <div className={holdStyles.efcCol}>
            <div className={clsx(inputStyles.inputContainer, "w5")}>
              <input
                value={formatUtcMinutes(efc)}
                readOnly
                // onChange={(e) => setEfc(e.target.value)}
              />
            </div>
            <EdstButton content="-" margin="0 0 0 10px" width="2ch" onMouseDown={() => setEfc(efc - 1)} />
            <EdstButton content="+" margin="0 0 0 4px" width="2ch" onMouseDown={() => setEfc(efc + 1)} />
          </div>
        </div>
        <div className={holdStyles.row2}>
          <div className={holdStyles.col5}>
            <EdstButton content="Delete EFC" padding="0 6px" onMouseDown={() => setEfc(0)} title={Tooltips.holdDelEfc} />
          </div>
        </div>
        <div className={optionStyles.bottomRow}>
          <div className={optionStyles.col}>
            <EdstButton
              content="Hold/SPA"
              margin="0 6px 0 0"
              padding="0 6px"
              disabled={!!entry?.holdAnnotations}
              onMouseDown={() => {
                if (!entry.spa) {
                  dispatch(toggleSpa(entry.aircraftId));
                }
                clearedHold();
              }}
              title={Tooltips.holdHoldSpaBtn}
            />
            <EdstButton
              content="Hold"
              margin="0 6px 0 0"
              onMouseDown={clearedHold}
              disabled={!!entry?.holdAnnotations}
              title={Tooltips.holdHoldBtn}
            />
            <EdstButton
              content="Cancel Hold"
              disabled={!entry?.holdAnnotations}
              onMouseDown={() => {
                dispatch(
                  updateEntry({
                    aircraftId: entry.aircraftId,
                    data: { routeDisplay: null },
                  })
                );
                dispatch(openWindowThunk("CANCEL_HOLD_MENU"));
                dispatch(closeWindow("HOLD_MENU"));
              }}
            />
          </div>
          <div className={clsx(optionStyles.col, "right")}>
            <ExitButton onMouseDown={() => dispatch(closeWindow("HOLD_MENU"))} />
          </div>
        </div>
      </div>
    </div>
  );
};
