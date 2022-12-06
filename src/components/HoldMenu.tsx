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
import { HoldDirButton24ch, HoldDirButton5ch, MovableBlackButton, MovableBlueButton } from "components/utils/EdstButton";
import { getUtcMinutesAfterMidnight } from "~/utils/getUtcMinutesAfterMidnight";
import clsx from "clsx";
import optionStyles from "css/optionMenu.module.scss";
import holdStyles from "css/holdMenu.module.scss";
import movableMenu from "css/movableMenu.module.scss";

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
      <div className={clsx(movableMenu.header, { focused })}>
        <div className={clsx(movableMenu.headerCol, "flexGrow")} onMouseDown={startDrag}>
          HOLD DATA {entry.cid} {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
        </div>
        <div className={movableMenu.headerXCol} onMouseDown={() => dispatch(closeWindow("HOLD_MENU"))}>
          X
        </div>
      </div>
      <div className={movableMenu.body}>
        <div className={movableMenu.row}>
          <div className={holdStyles.leftCol} title={Tooltips.holdDirection}>
            Location
          </div>
        </div>
        <div className={holdStyles.fixContainer}>
          <div
            className={clsx(holdStyles.fixCol, { [movableMenu.selected]: fix === null })}
            onMouseDown={() => {
              const utcMinutes = getUtcMinutesAfterMidnight();
              setFix(null);
              setEfc(utcMinutes + 30);
            }}
          >
            PRESENT POSITION
          </div>
          {holdRouteFixes &&
            _.range(0, Math.min(holdRouteFixes.length || 0, 10)).map((i) => (
              <div className={optionStyles.row} key={i}>
                {_.range(0, Math.round((holdRouteFixes.length || 0) / 10) + 1).map((j) => {
                  const fixName = holdRouteFixes?.[Number(i) + Number(j) * 10]?.name;
                  const minutesAtFix = holdRouteFixes?.[Number(i) + Number(j) * 10]?.minutesAtFix;
                  return (
                    fixName && (
                      <div
                        className={clsx(holdStyles.fixCol, { [movableMenu.selected]: fix === fixName })}
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
          <div className={clsx(holdStyles.colContainer)}>
            <div className={holdStyles.col2} title={Tooltips.holdDirection}>
              Direction
            </div>
          </div>
          <div className={holdStyles.colContainer}>
            <div className={holdStyles.col2} title={Tooltips.holdTurns}>
              Turns
            </div>
          </div>
          <div className={holdStyles.colContainer}>
            <div className={holdStyles.col2} title={Tooltips.holdLegLength}>
              Leg Length
            </div>
          </div>
        </div>
        <div className={holdStyles.row1}>
          <div className={clsx(holdStyles.colContainer, holdStyles.col3)}>
            <HoldDirButton24ch
              content="NW"
              selected={direction === CompassDirection.NORTH_WEST}
              onMouseDown={() => setDirection(CompassDirection.NORTH_WEST)}
            />
            <HoldDirButton24ch content="N" selected={direction === CompassDirection.NORTH} onMouseDown={() => setDirection(CompassDirection.NORTH)} />
            <HoldDirButton24ch
              content="NE"
              selected={direction === CompassDirection.NORTH_EAST}
              onMouseDown={() => setDirection(CompassDirection.NORTH_EAST)}
            />
          </div>
          <div className={clsx(holdStyles.colContainer, holdStyles.col3)}>
            <HoldDirButton24ch content="LT" selected={turns === TurnDirection.LEFT} onMouseDown={() => setTurns(TurnDirection.LEFT)} />
            <HoldDirButton24ch content="RT" selected={turns === TurnDirection.RIGHT} onMouseDown={() => setTurns(TurnDirection.RIGHT)} />
          </div>
          <div className={clsx(holdStyles.colContainer, holdStyles.col3)}>
            <HoldDirButton5ch content="STD" selected={legLength === null} onMouseDown={() => setLegLength(null)} />
            <HoldDirButton5ch content="15 NM" selected={legLength === 15} onMouseDown={() => setLegLength(15)} />
          </div>
        </div>
        <div className={holdStyles.row1}>
          <div className={clsx(holdStyles.colContainer, holdStyles.col3)}>
            <HoldDirButton24ch content="W" selected={direction === CompassDirection.WEST} onMouseDown={() => setDirection(CompassDirection.WEST)} />
            <HoldDirButton24ch disabled />
            <HoldDirButton24ch content="E" selected={direction === CompassDirection.EAST} onMouseDown={() => setDirection(CompassDirection.EAST)} />
          </div>
          <div className={clsx(holdStyles.colContainer, holdStyles.col3)} />
          <div className={clsx(holdStyles.colContainer, holdStyles.col3)}>
            <HoldDirButton5ch content="5 NM" selected={legLength === 5} onMouseDown={() => setLegLength(5)} />
            <HoldDirButton5ch content="20 NM" selected={legLength === 20} onMouseDown={() => setLegLength(20)} />
          </div>
        </div>
        <div className={holdStyles.row1}>
          <div className={clsx(holdStyles.colContainer, holdStyles.col3)}>
            <HoldDirButton24ch
              content="SW"
              selected={direction === CompassDirection.SOUTH_WEST}
              onMouseDown={() => setDirection(CompassDirection.SOUTH_WEST)}
            />
            <HoldDirButton24ch content="S" selected={direction === CompassDirection.SOUTH} onMouseDown={() => setDirection(CompassDirection.SOUTH)} />
            <HoldDirButton24ch
              content="SE"
              selected={direction === CompassDirection.SOUTH_EAST}
              onMouseDown={() => setDirection(CompassDirection.SOUTH_EAST)}
            />
          </div>
          <div className={clsx(holdStyles.colContainer, holdStyles.col3)} />
          <div className={clsx(holdStyles.colContainer, holdStyles.col3)}>
            <HoldDirButton5ch content="10 NM" selected={legLength === 10} onMouseDown={() => setLegLength(10)} />
            <HoldDirButton5ch content="25 NM" selected={legLength === 25} onMouseDown={() => setLegLength(25)} />
          </div>
        </div>
        <div className={clsx(holdStyles.row2, "bottomBorder")}>
          <div className={holdStyles.col5}>
            <div
              className={clsx(movableMenu.blueButton, { isDisabled: !!entry?.holdAnnotations })}
              onMouseDown={() => {
                dispatch(
                  updateEntry({
                    aircraftId: entry.aircraftId,
                    data: { routeDisplay: null },
                  })
                );
                dispatch(closeWindow("HOLD_MENU"));
              }}
            >
              CLEAR HOLD DATA
            </div>
          </div>
        </div>
        <div className={holdStyles.row1}>
          <div className={holdStyles.col2} title={Tooltips.holdEfc}>
            EFC
          </div>
        </div>
        <div className={movableMenu.col}>
          <div className={holdStyles.efcCol}>
            <MovableBlackButton className="noPointerEvents" width="5ch" content={formatUtcMinutes(efc)} />
            <MovableBlackButton width="2ch" content="-" onMouseDown={() => setEfc(efc - 1)} />
            <MovableBlackButton width="2ch" content="+" onMouseDown={() => setEfc(efc + 1)} />
          </div>
        </div>
        <div className={holdStyles.row2}>
          <div className={holdStyles.col5}>
            <div className={clsx(movableMenu.blueButton, { isDisabled: !!entry?.holdAnnotations })} onMouseDown={() => setEfc(0)}>
              DELETE EFC
            </div>
          </div>
        </div>
        <div className={clsx(movableMenu.row, "topBorder")}>
          <div className={clsx(movableMenu.col, "center")}>
            <MovableBlueButton
              width="33%"
              content="HOLD/SPA"
              onMouseDown={() => {
                if (!entry.spa) {
                  dispatch(toggleSpa(entry.aircraftId));
                }
                clearedHold();
              }}
              disabled={!!entry?.holdAnnotations}
            />
            <MovableBlueButton width="33%" content="HOLD" onMouseDown={clearedHold} disabled={!!entry?.holdAnnotations} />
            <MovableBlueButton
              width="33%"
              content="CANCEL HOLD"
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
        </div>
      </div>
    </div>
  );
};
