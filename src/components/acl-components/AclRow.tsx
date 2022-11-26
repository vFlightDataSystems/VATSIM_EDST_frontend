import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Nullable } from "types/utility-types";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { delEntry, entrySelector, toggleSpa, updateEntry } from "~redux/slices/entrySlice";
import { aircraftIsAselSelector } from "~redux/slices/appSlice";
import { aclHiddenColumnsSelector, aclManualPostingSelector, toolsOptionsSelector } from "~redux/slices/aclSlice";
import type { EdstEntry } from "types/edstEntry";
import { aclAircraftSelect } from "~redux/thunks/aircraftSelect";
import type { EdstWindow } from "types/edstWindow";
import type { AclRowField } from "types/acl/aclRowField";
import { HoldDirectionValues } from "types/hold/holdDirectionValues";
import { HoldTurnDirectionValues } from "types/hold/turnDirection";
import { REMOVAL_TIMEOUT, SPA_INDICATOR, VCI_SYMBOL } from "~/utils/constants";
import { usePar } from "api/prefrouteApi";
import { useRouteFixes } from "api/aircraftApi";
import { formatRoute } from "~/utils/formatRoute";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useAselEventListener } from "hooks/useAselEventListener";
import { convertBeaconCodeToString, removeStringFromEnd } from "~/utils/stringManipulation";
import { formatUtcMinutes } from "~/utils/formatUtcMinutes";
import type { AircraftId } from "types/aircraftId";
import { anyHoldingSelector } from "~redux/selectors";
import tableStyles from "css/table.module.scss";
import clsx from "clsx";

type AclRowProps = {
  aircraftId: AircraftId;
};

/**
 * Single ACL row
 */
export const AclRow = React.memo(({ aircraftId }: AclRowProps) => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const entry = useRootSelector((state) => entrySelector(state, aircraftId));
  const asel = useRootSelector((state) => aircraftIsAselSelector(state, aircraftId));
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const toolOptions = useRootSelector(toolsOptionsSelector);
  const hiddenColumns = useRootSelector(aclHiddenColumnsSelector);
  const anyHolding = useRootSelector(anyHoldingSelector);
  const [displayScratchHdg, setDisplayScratchHdg] = useState(false);
  const [displayScratchSpd, setDisplayScratchSpd] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent);
  const par = usePar(aircraftId);

  const formattedRoute = useMemo(() => formatRoute(entry.route), [entry.route]);
  const currentRoute = formattedRoute;
  const routeFixes = useRouteFixes(aircraftId);
  const currentRouteFixes = routeFixes;

  useEffect(() => {
    setFreeTextContent(entry.freeTextContent);
  }, [entry.freeTextContent]);

  const { holdAnnotations } = entry;

  const route = removeStringFromEnd((currentRoute.replace(/^\.+/, "") ?? formattedRoute).slice(0), entry.destination);
  // coral box indicates that aircraft is not RVSM capable but equipment says it is not RVSM approved
  const showCoralBox = !entry.faaEquipmentSuffix.match(/[LZWH]/g) && Number(entry.altitude) > 280 && toolOptions.nonRvsmIndicator;

  const availPar = useMemo(() => {
    const currentFixNames = (currentRouteFixes ?? routeFixes).map((fix) => fix.name);
    return par.filter((par) => par.eligible && currentFixNames.includes(par.triggeredFix));
  }, [currentRouteFixes, par, routeFixes]);
  const onPar = useMemo(() => availPar.some((par) => formattedRoute.includes(par.amendment)), [availPar, formattedRoute]);

  const isSelected = useCallback(
    (field: AclRowField): boolean => {
      return asel?.window === "ACL" && asel?.aircraftId === aircraftId && asel?.field === field;
    },
    [aircraftId, asel?.aircraftId, asel?.field, asel?.window]
  );

  const handleClick = useCallback(
    (element: HTMLElement, field: AclRowField, eventId: Nullable<string>, opensWindow?: EdstWindow, triggerSharedState = true) => {
      dispatch(aclAircraftSelect(aircraftId, field, eventId, triggerSharedState));
      if (opensWindow && !isSelected(field)) {
        dispatch(openMenuThunk(opensWindow, element));
      }
    },
    [dispatch, aircraftId, isSelected]
  );

  const handleRouteClick = useCallback(
    (element: HTMLElement, triggerSharedState = true) => {
      if (entry.routeDisplay === "HOLD_ANNOTATIONS_DISPLAY_OPTION") {
        handleClick(element, "ROUTE_ACL_ROW_FIELD", "acl-route-asel-hold", "HOLD_MENU", triggerSharedState);
      } else {
        handleClick(element, "ROUTE_ACL_ROW_FIELD", "acl-route-asel", "ROUTE_MENU", triggerSharedState);
      }
    },
    [entry.routeDisplay, handleClick]
  );

  const altRef = useRef<HTMLDivElement>(null);
  const spdRef = useRef<HTMLDivElement>(null);
  const hdgRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);

  useAselEventListener(altRef, aircraftId, "acl-alt-asel", "ALT_ACL_ROW_FIELD", "ALTITUDE_MENU", handleClick);
  useAselEventListener(spdRef, aircraftId, "acl-spd-asel", "SPD_ACL_ROW_FIELD", "SPEED_MENU", handleClick);
  useAselEventListener(hdgRef, aircraftId, "acl-hdg-asel", "HDG_ACL_ROW_FIELD", "HEADING_MENU", handleClick);
  useAselEventListener(routeRef, aircraftId, "acl-route-asel", "ROUTE_ACL_ROW_FIELD", "ROUTE_MENU", handleClick);
  useAselEventListener(routeRef, aircraftId, "acl-route-asel-hold", "ROUTE_ACL_ROW_FIELD", "HOLD_MENU", handleClick);
  useAselEventListener(holdRef, aircraftId, "acl-hold-asel-hold", "HOLD_ACL_ROW_FIELD", "HOLD_MENU", handleClick);

  const now = Date.now();

  // TODO: move this to the route menu
  // const checkParReroutePending = () => {
  //   const currentFixNames = (currentRouteFixes ?? entry.routeFixes).map(fix => fix.name);
  //   const eligiblePar = par.filter(par => par.eligible);
  //   if (eligiblePar?.length === 1) {
  //     const par = eligiblePar[0];
  //     if (currentFixNames.includes(par.triggeredFix) && !entry.formattedRoute.includes(par.amendment)) {
  //       return par.amendment;
  //     }
  //   }
  //   return null;
  // };
  // const pendingPar = checkParReroutePending();

  const handleHotboxMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(
          updateEntry({
            aircraftId,
            data: { showFreeText: !entry.showFreeText },
          })
        );
        break;
      case 1:
        dispatch(toggleSpa(aircraftId));
        break;
      case 2:
        dispatch(
          updateEntry({
            aircraftId,
            data: { highlighted: !entry.highlighted },
          })
        );
        break;
      default:
        break;
    }
  };

  const updateVci = () => {
    if (entry.vciStatus === -1 && manualPosting) {
      dispatch(updateEntry({ aircraftId, data: { vciStatus: 0 } }));
    } else if (entry.vciStatus < 1) {
      dispatch(
        updateEntry({
          aircraftId,
          data: {
            vciStatus: (entry.vciStatus + 1) as EdstEntry["vciStatus"],
          },
        })
      );
    } else {
      dispatch(updateEntry({ aircraftId, data: { vciStatus: 0 } }));
    }
  };

  const handleHoldClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        if (!entry.holdAnnotations) {
          handleClick(event.currentTarget, "HOLD_ACL_ROW_FIELD", "acl-hold-asel-hold", "HOLD_MENU");
        } else {
          dispatch(
            updateEntry({
              aircraftId,
              data: {
                routeDisplay: !entry.routeDisplay ? "HOLD_ANNOTATIONS_DISPLAY_OPTION" : null,
              },
            })
          );
        }
        break;
      case 1:
        handleClick(event.currentTarget, "HOLD_ACL_ROW_FIELD", "acl-hold-asel-hold", "HOLD_MENU");
        break;
      case 2:
        if (entry?.holdAnnotations) {
          handleClick(event.currentTarget, "HOLD_ACL_ROW_FIELD", "acl-hold-asel-cancel-hold", "CANCEL_HOLD_MENU");
        }
        break;
      default:
        break;
    }
  };

  const handleRemarksClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (entry.vciStatus === -1 && !manualPosting) {
      dispatch(updateEntry({ aircraftId, data: { vciStatus: 0 } }));
    }
    switch (event.button) {
      case 0:
        dispatch(
          updateEntry({
            aircraftId,
            data: {
              routeDisplay:
                !(entry.routeDisplay === "REMARKS_ROUTE_DISPLAY_OPTION") && entry.remarks.length > 0 ? "REMARKS_ROUTE_DISPLAY_OPTION" : null,
              remarksChecked: true,
            },
          })
        );
        break;
      case 2:
        dispatch(
          updateEntry({
            aircraftId,
            data: {
              routeDisplay: !(entry.routeDisplay === "RAW_ROUTE_DISPLAY_OPTION") ? "RAW_ROUTE_DISPLAY_OPTION" : null,
            },
          })
        );
        break;
      default:
        break;
    }
  };

  const handleFidClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const now = Date.now();
    switch (event.button) {
      case 2:
        if (now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT) {
          dispatch(delEntry(aircraftId));
        }
        break;
      default:
        if (!manualPosting && event.detail === 2 && entry.vciStatus < 0) {
          dispatch(updateEntry({ aircraftId, data: { vciStatus: 0 } }));
        }
        handleClick(event.currentTarget, "FID_ACL_ROW_FIELD", null);
        break;
    }
  };

  const handleHeadingClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        handleClick(event.currentTarget, "HDG_ACL_ROW_FIELD", "acl-hdg-asel", "HEADING_MENU");
        break;
      case 1:
        if (entry.scratchpadHeading && (displayScratchHdg || entry.assignedHeading === null)) {
          // const promotedHdg = "LRH".includes(entry.scratchpadHeading.slice(-1)) ? entry.scratchpadHeading : `H${entry.scratchpadHeading}`;
        }
        break;
      case 2:
        if (entry.scratchpadHeading && (displayScratchHdg || entry.assignedHeading === null)) {
          dispatch(updateEntry({ aircraftId, data: { scratchpadHeading: null } }));
        } else if (entry.assignedHeading) {
          dispatch(updateEntry({ aircraftId, data: { assignedHeading: null } }));
        }
        break;
      default:
        break;
    }
  };

  const handleSpeedClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        handleClick(event.currentTarget, "SPD_ACL_ROW_FIELD", "acl-spd-asel", "SPEED_MENU");
        break;
      case 1:
        if (entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null)) {
          // const promotedSpd = entry.scratchpadSpeed.slice(0, 1) === "M" ? entry.scratchpadSpeed : `S${entry.scratchpadSpeed}`;
        }
        break;
      case 2:
        if (entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null)) {
          dispatch(updateEntry({ aircraftId, data: { scratchpadSpeed: null } }));
        } else if (entry.assignedSpeed) {
          dispatch(updateEntry({ aircraftId, data: { assignedSpeed: null } }));
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className={tableStyles.rowContainer}>
      <div className={clsx(tableStyles.row, { pendingRemoval: now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT })}>
        <div className={clsx(tableStyles.radioCol, { cGreen: entry.vciStatus === 1, keep: entry.keep })} onMouseDown={updateVci}>
          {entry.vciStatus === -1 && "N"}
          {entry.vciStatus === 1 && VCI_SYMBOL}
        </div>
        <div className={clsx(tableStyles.col1, "withBorder")} />
        <div className={clsx(tableStyles.col1, "withBorder")} />
        <div className={clsx(tableStyles.col1, "withBorder")} />
        <div className={clsx(tableStyles.specialBox, "isDisabled")} />
        <div ref={ref} className={clsx(tableStyles.innerRow, { highlight: entry.highlighted, showFreeText: entry.showFreeText })}>
          <div className={clsx(tableStyles.fidCol, { hover: true, selected: isSelected("FID_ACL_ROW_FIELD") })} onMouseDown={handleFidClick}>
            {entry.cid} {entry.aircraftId}
            {/* eslint-disable-next-line no-nested-ternary */}
            <span className={tableStyles.voiceType}>{entry.voiceType === "r" ? "/R" : entry.voiceType === "t" ? "/T" : ""}</span>
          </div>
          <div className={tableStyles.paCol} />
          {toolOptions.displayCoordinationColumn && <div className={clsx(tableStyles.specialBox, "isDisabled")} />}
          <div className={clsx(tableStyles.specialBox, { isDisabled: !entry.spa })}>{entry.spa && SPA_INDICATOR}</div>
          <div className={tableStyles.hotbox} onMouseDown={handleHotboxMouseDown}>
            {freeTextContent && "*"}
          </div>
          <div
            className={clsx(tableStyles.acTypeCol, {
              hover: true,
              selected: isSelected("TYPE_ACL_ROW_FIELD"),
              visibilityHidden: hiddenColumns.includes("TYPE_ACL_ROW_FIELD"),
            })}
            onMouseDown={(event) => handleClick(event.currentTarget, "TYPE_ACL_ROW_FIELD", null)}
          >
            {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
          </div>
          <div className={tableStyles.altCol}>
            <div
              className={clsx(tableStyles.innerAltCol, { hover: true, selected: isSelected("ALT_ACL_ROW_FIELD") })}
              ref={altRef}
              onMouseDown={(event) => handleClick(event.currentTarget, "ALT_ACL_ROW_FIELD", "acl-alt-asel", "ALTITUDE_MENU")}
            >
              {entry.altitude}
              {entry.interimAltitude && `T${entry.interimAltitude}`}
            </div>
            {showCoralBox && <div className={tableStyles.coralBox} />}
          </div>
          <div
            className={clsx(tableStyles.codeCol, {
              hover: true,
              selected: isSelected("CODE_ACL_ROW_FIELD"),
              visibilityHidden: hiddenColumns.includes("CODE_ACL_ROW_FIELD"),
            })}
            onMouseDown={(event) => handleClick(event.currentTarget, "CODE_ACL_ROW_FIELD", null)}
          >
            {convertBeaconCodeToString(entry.assignedBeaconCode)}
          </div>
          <div
            className={clsx(tableStyles.specialBox, { isDisabled: !(entry.assignedHeading && entry.scratchpadHeading) })}
            onMouseDown={() => setDisplayScratchHdg(!displayScratchHdg)}
          >
            {entry.assignedHeading && entry.scratchpadHeading && "*"}
          </div>
          <div
            className={clsx(tableStyles.hdgCol, {
              hover: true,
              selected: isSelected("HDG_ACL_ROW_FIELD"),
              scratchpad: !!entry.scratchpadHeading && (displayScratchHdg || entry.assignedHeading === null),
              visibilityHidden: hiddenColumns.includes("HDG_ACL_ROW_FIELD"),
            })}
            ref={hdgRef}
            onMouseDown={handleHeadingClick}
          >
            {entry.scratchpadHeading && (displayScratchHdg || entry.assignedHeading === null) ? entry.scratchpadHeading : entry.assignedHeading}
          </div>
          <div className={tableStyles.slashCol}>/</div>
          <div
            className={clsx(tableStyles.spdCol, {
              hover: true,
              selected: isSelected("SPD_ACL_ROW_FIELD"),
              scratchpad: !!entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null),
              visibilityHidden: hiddenColumns.includes("SPD_ACL_ROW_FIELD"),
            })}
            ref={spdRef}
            onMouseDown={handleSpeedClick}
          >
            {entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null) ? entry.scratchpadSpeed : entry.assignedSpeed}
          </div>
          <div
            className={clsx(tableStyles.specialBox, { isDisabled: !(entry.assignedSpeed && entry.scratchpadSpeed) })}
            onMouseDown={() => setDisplayScratchSpd(!displayScratchSpd)}
          >
            {entry.assignedSpeed && entry.scratchpadSpeed && "*"}
          </div>
          <div className={clsx(tableStyles.specialBox, "isDisabled")} />
          {anyHolding && (
            <div
              ref={holdRef}
              className={clsx(tableStyles.specialBox, "cBrown", { selected: isSelected("HOLD_ACL_ROW_FIELD") })}
              onMouseDown={handleHoldClick}
            >
              {entry.holdAnnotations ? "H" : ""}
            </div>
          )}
          <div
            className={clsx(tableStyles.remarksBox, { unchecked: !entry.remarksChecked && entry.remarks.length > 0 })}
            onMouseDown={handleRemarksClick}
          >
            {entry.remarks.length > 0 && "*"}
          </div>
          <div
            className={clsx(tableStyles.routeCol, { hover: true, selected: isSelected("ROUTE_ACL_ROW_FIELD") })}
            ref={routeRef}
            onMouseDown={(event) => handleRouteClick(event.currentTarget)}
          >
            <div className={clsx(tableStyles.routeContent)}>
              {entry.routeDisplay === "HOLD_ANNOTATIONS_DISPLAY_OPTION" &&
                holdAnnotations &&
                `${holdAnnotations.fix ?? "PP"} ${HoldDirectionValues[holdAnnotations.direction]} ` +
                  `${HoldTurnDirectionValues[holdAnnotations.turns]} ` +
                  `${holdAnnotations.legLength ?? "STD"}` +
                  // eslint-disable-next-line no-nested-ternary
                  `${holdAnnotations.legLength ? (holdAnnotations.legLengthInNm ? "NM" : "Minutes") : ""} EFC ${formatUtcMinutes(
                    holdAnnotations.efc
                  )}`}
              {entry.routeDisplay === "REMARKS_ROUTE_DISPLAY_OPTION" && <span>{entry.remarks}</span>}
              {entry.routeDisplay === "RAW_ROUTE_DISPLAY_OPTION" && <span>{entry.route}</span>}
              {!entry.routeDisplay && (
                <>
                  <div
                    className={clsx(tableStyles.routeDepAprt, {
                      amendmentPending: availPar.length > 0 && !onPar,
                      selected: isSelected("ROUTE_ACL_ROW_FIELD"),
                    })}
                  >
                    {entry.departure}
                  </div>
                  ./.
                  {route}
                  {!route.endsWith(".") && route.length > 0 && `.`}
                  {entry.destination}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {entry.showFreeText && (
        <div className={tableStyles.row}>
          <div className={clsx(tableStyles.radioCol, "empty")} />
          <div className={tableStyles.col1} />
          <div className={tableStyles.col1} />
          <div className={tableStyles.col1} />
          <div className={clsx(tableStyles.specialBox, "isDisabled")} />
          <div
            className={clsx(tableStyles.innerRow, { highlight: entry.highlighted })}
            style={{ minWidth: `${Math.max(1200, ref?.current?.clientWidth ?? 0)}px` }}
          >
            <div className={tableStyles.freeText} style={{ marginLeft: "calc(19ch + 18px)" }}>
              <input
                spellCheck={false}
                value={freeTextContent}
                onChange={(event) => setFreeTextContent(event.target.value)}
                onBlur={() => dispatch(updateEntry({ aircraftId, data: { freeTextContent } }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
