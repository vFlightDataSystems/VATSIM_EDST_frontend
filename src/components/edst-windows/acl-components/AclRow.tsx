import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { delEntry, entrySelector, toggleSpa, updateEntry } from "../../../redux/slices/entrySlice";
import { aircraftIsAselSelector } from "../../../redux/slices/appSlice";
import { aclHiddenColumnsSelector, aclManualPostingSelector, toolsOptionsSelector } from "../../../redux/slices/aclSlice";
import { BodyRowContainerDiv, BodyRowDiv, FreeTextRow, InnerRow, InnerRow2 } from "../../../styles/styles";
import { AclCol1, CoralBox, HdgCol, HdgSpdSlashCol, PointOutCol, RadioCol, RemarksBox, SpdCol, VoiceTypeSpan } from "./AclStyled";
import { EdstEntry } from "../../../typeDefinitions/types/edstEntry";
import { aclAircraftSelect } from "../../../redux/thunks/aircraftSelect";
import {
  AircraftTypeCol,
  AltCol,
  AltColDiv,
  CodeCol,
  FidCol,
  HotBox,
  RouteCol,
  RouteDepAirportSpan,
  RouteSpan,
  SpecialBox
} from "../../../styles/sharedColumns";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { AclRowField } from "../../../typeDefinitions/enums/acl/aclRowField";
import { RouteDisplayOption } from "../../../typeDefinitions/enums/routeDisplayOption";
import { HoldDirectionValues } from "../../../typeDefinitions/enums/hold/holdDirectionValues";
import { HoldTurnDirectionValues } from "../../../typeDefinitions/enums/hold/turnDirection";
import { REMOVAL_TIMEOUT, SPA_INDICATOR, VCI_SYMBOL } from "../../../utils/constants";
import { usePar } from "../../../api/prefrouteApi";
import { useRouteFixes } from "../../../api/aircraftApi";
import { formatRoute } from "../../../utils/formatRoute";
import { openMenuThunk } from "../../../redux/thunks/openMenuThunk";
import { useAselEventListener } from "../../../hooks/useAselEventListener";
import { convertBeaconCodeToString, removeStringFromEnd } from "../../../utils/stringManipulation";
import { formatUtcMinutes } from "../../../utils/formatUtcMinutes";
import { colors } from "../../../edstTheme";
import { Nullable } from "../../../typeDefinitions/utility-types";
import { AircraftId } from "../../../typeDefinitions/types/aircraftId";
import { anyHoldingSelector } from "../../../redux/selectors";

type AclRowProps = {
  aircraftId: AircraftId;
  altMouseDown?: boolean;
};

/**
 * Single ACL row
 * @param aircraftId
 * @param altMouseDown boolean indicating where mouse is pressed on the ACL header Alt column
 */
export const AclRow = React.memo(({ aircraftId, altMouseDown }: AclRowProps) => {
  const dispatch = useRootDispatch();
  const entry = useRootSelector(state => entrySelector(state, aircraftId));
  const asel = useRootSelector(state => aircraftIsAselSelector(state, aircraftId));
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const toolOptions = useRootSelector(toolsOptionsSelector);
  const hiddenColumns = useRootSelector(aclHiddenColumnsSelector);
  const anyHolding = useRootSelector(anyHoldingSelector);

  const [parAvail, setParAvail] = useState(false);
  const [onPar, setOnPar] = useState(false);
  const [displayScratchHdg, setDisplayScratchHdg] = useState(false);
  const [displayScratchSpd, setDisplayScratchSpd] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent);
  const ref = useRef<HTMLDivElement>(null);

  const isSelected = useCallback(
    (field: AclRowField): boolean => {
      return asel?.window === EdstWindow.ACL && asel?.aircraftId === aircraftId && asel?.field === field;
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
      if (entry.routeDisplay === RouteDisplayOption.holdAnnotations) {
        handleClick(element, AclRowField.ROUTE, "acl-route-asel-hold", EdstWindow.HOLD_MENU, triggerSharedState);
      } else {
        handleClick(element, AclRowField.ROUTE, "acl-route-asel", EdstWindow.ROUTE_MENU, triggerSharedState);
      }
    },
    [entry.routeDisplay, handleClick]
  );

  const altRef = useRef<HTMLDivElement>(null);
  const spdRef = useRef<HTMLDivElement>(null);
  const hdgRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);

  useAselEventListener<AclRowField>(altRef, aircraftId, "acl-alt-asel", AclRowField.ALT, EdstWindow.ALTITUDE_MENU, handleClick);
  useAselEventListener<AclRowField>(spdRef, aircraftId, "acl-spd-asel", AclRowField.SPD, EdstWindow.SPEED_MENU, handleClick);
  useAselEventListener<AclRowField>(hdgRef, aircraftId, "acl-hdg-asel", AclRowField.HDG, EdstWindow.HEADING_MENU, handleClick);
  useAselEventListener<AclRowField>(routeRef, aircraftId, "acl-route-asel", AclRowField.ROUTE, EdstWindow.ROUTE_MENU, handleClick);
  useAselEventListener<AclRowField>(routeRef, aircraftId, "acl-route-asel-hold", AclRowField.ROUTE, EdstWindow.HOLD_MENU, handleClick);
  useAselEventListener<AclRowField>(holdRef, aircraftId, "acl-hold-asel-hold", AclRowField.HOLD, EdstWindow.HOLD_MENU, handleClick);

  const par = usePar(aircraftId);
  const formattedRoute = useMemo(() => formatRoute(entry.route), [entry.route]);
  const currentRoute = formattedRoute;
  const routeFixes = useRouteFixes(aircraftId);
  const currentRouteFixes = routeFixes;

  useEffect(() => {
    const currentFixNames = (currentRouteFixes ?? routeFixes).map(fix => fix.name);
    const availPar = par.filter(par => par.eligible && currentFixNames.includes(par.triggeredFix));
    const onPar = availPar.some(par => formattedRoute.includes(par.amendment));
    setParAvail(availPar.length > 0);
    setOnPar(onPar);
  }, [currentRouteFixes, formattedRoute, par, routeFixes]);

  useEffect(() => {
    setFreeTextContent(entry.freeTextContent);
  }, [entry.freeTextContent]);

  const { holdAnnotations } = entry;
  const route = useMemo(() => {
    const route = currentRoute.replace(/^\.+/, "") ?? formattedRoute;
    return removeStringFromEnd(route.slice(0), entry.destination);
  }, [currentRoute, entry.destination, formattedRoute]);

  const now = new Date().getTime();

  // coral box indicates that aircraft is not RVSM capable but equipment says it is not RVSM approved
  const showCoralBox = !entry.faaEquipmentSuffix.match(/[LZWH]/g) && Number(entry.altitude) > 280 && toolOptions.nonRvsmIndicator;

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

  const handleHotboxMouseDown: React.MouseEventHandler<HTMLDivElement> = event => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(updateEntry({ aircraftId, data: { showFreeText: !entry.showFreeText } }));
        break;
      case 1:
        dispatch(toggleSpa(aircraftId));
        break;
      case 2:
        dispatch(updateEntry({ aircraftId, data: { highlighted: !entry.highlighted } }));
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
          data: { vciStatus: (entry.vciStatus + 1) as EdstEntry["vciStatus"] }
        })
      );
    } else {
      dispatch(updateEntry({ aircraftId, data: { vciStatus: 0 } }));
    }
  };

  const handleHoldClick: React.MouseEventHandler<HTMLDivElement> = event => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        if (!entry.holdAnnotations) {
          handleClick(event.currentTarget, AclRowField.HOLD, "acl-hold-asel-hold", EdstWindow.HOLD_MENU);
        } else {
          dispatch(
            updateEntry({
              aircraftId,
              data: { routeDisplay: !entry.routeDisplay ? RouteDisplayOption.holdAnnotations : null }
            })
          );
        }
        break;
      case 1:
        handleClick(event.currentTarget, AclRowField.HOLD, "acl-hold-asel-hold", EdstWindow.HOLD_MENU);
        break;
      case 2:
        if (entry?.holdAnnotations) {
          handleClick(event.currentTarget, AclRowField.HOLD, "acl-hold-asel-cancel-hold", EdstWindow.CANCEL_HOLD_MENU);
        }
        break;
      default:
        break;
    }
  };

  const handleRemarksClick: React.MouseEventHandler<HTMLDivElement> = event => {
    if (entry.vciStatus === -1 && !manualPosting) {
      dispatch(updateEntry({ aircraftId, data: { vciStatus: 0 } }));
    }
    switch (event.button) {
      case 0:
        dispatch(
          updateEntry({
            aircraftId,
            data: {
              routeDisplay: !(entry.routeDisplay === RouteDisplayOption.remarks) && entry.remarks.length > 0 ? RouteDisplayOption.remarks : null,
              remarksChecked: true
            }
          })
        );
        break;
      case 2:
        dispatch(
          updateEntry({
            aircraftId,
            data: { routeDisplay: !(entry.routeDisplay === RouteDisplayOption.rawRoute) ? RouteDisplayOption.rawRoute : null }
          })
        );
        break;
      default:
        break;
    }
  };

  const handleFidClick: React.MouseEventHandler<HTMLDivElement> = event => {
    const now = new Date().getTime();
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
        handleClick(event.currentTarget, AclRowField.FID, null);
        break;
    }
  };

  const handleHeadingClick: React.MouseEventHandler<HTMLDivElement> = event => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        handleClick(event.currentTarget, AclRowField.HDG, "acl-hdg-asel", EdstWindow.HEADING_MENU);
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

  const handleSpeedClick: React.MouseEventHandler<HTMLDivElement> = event => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        handleClick(event.currentTarget, AclRowField.SPD, "acl-spd-asel", EdstWindow.SPEED_MENU);
        break;
      case 1:
        if (entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null)) {
          // const promotedSpd = entry.scratchpadSpeed.slice(0, 1) === "M" ? entry.scratchpadSpeed : `S${entry.scratchpadSpeed}`;
        }
        break;
      case 2:
        if (displayScratchSpd && (displayScratchSpd || entry.assignedSpeed === null)) {
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
    <BodyRowContainerDiv>
      <BodyRowDiv pendingRemoval={now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT}>
        <EdstTooltip title={Tooltips.aclNAndVciBtn}>
          <RadioCol green={entry.vciStatus === 1} onMouseDown={updateVci} keep={entry.keep}>
            {entry.vciStatus === -1 && "N"}
            {entry.vciStatus === 1 && VCI_SYMBOL}
          </RadioCol>
        </EdstTooltip>
        <AclCol1 border />
        <AclCol1 border />
        <AclCol1 border />
        <SpecialBox disabled />
        <InnerRow highlight={entry.highlighted} ref={ref} style={{ minWidth: entry.showFreeText ? "1200px" : 0 }}>
          <EdstTooltip title={Tooltips.aclFlightId} onMouseDown={handleFidClick}>
            <FidCol hover selected={isSelected(AclRowField.FID)}>
              {entry.cid} {entry.aircraftId}
              {/* eslint-disable-next-line no-nested-ternary */}
              <VoiceTypeSpan>{entry.voiceType === "r" ? "/R" : entry.voiceType === "t" ? "/T" : ""}</VoiceTypeSpan>
            </FidCol>
          </EdstTooltip>
          <PointOutCol />
          {toolOptions.displayCoordinationColumn && <SpecialBox disabled />}
          <SpecialBox disabled={!entry.spa}>{entry.spa && SPA_INDICATOR}</SpecialBox>
          <EdstTooltip title={Tooltips.aclHotbox}>
            <HotBox onMouseDown={handleHotboxMouseDown}>{freeTextContent && "*"}</HotBox>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclType}>
            <AircraftTypeCol
              visibilityHidden={hiddenColumns.includes(AclRowField.TYPE)}
              hover
              selected={isSelected(AclRowField.TYPE)}
              onMouseDown={event => handleClick(event.currentTarget, AclRowField.TYPE, null)}
            >
              {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
            </AircraftTypeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclAlt}>
            <AltCol>
              <AltColDiv
                ref={altRef}
                headerMouseDown={altMouseDown}
                selected={isSelected(AclRowField.ALT)}
                onMouseDown={event => handleClick(event.currentTarget, AclRowField.ALT, "acl-alt-asel", EdstWindow.ALTITUDE_MENU)}
              >
                {entry.altitude}
                {entry.interimAltitude && `T${entry.interimAltitude}`}
              </AltColDiv>
              {showCoralBox && <CoralBox />}
            </AltCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclCode}>
            <CodeCol
              visibilityHidden={hiddenColumns.includes(AclRowField.CODE)}
              hover
              selected={isSelected(AclRowField.CODE)}
              onMouseDown={event => handleClick(event.currentTarget, AclRowField.CODE, null)}
            >
              {convertBeaconCodeToString(entry.assignedBeaconCode)}
            </CodeCol>
          </EdstTooltip>
          <SpecialBox onMouseDown={() => setDisplayScratchHdg(!displayScratchHdg)} disabled={!(entry.assignedHeading && entry.scratchpadHeading)}>
            {entry.assignedHeading && entry.scratchpadHeading && "*"}
          </SpecialBox>
          <EdstTooltip title={Tooltips.aclHdg}>
            <HdgCol
              ref={hdgRef}
              hover
              visibilityHidden={hiddenColumns.includes(AclRowField.HDG)}
              selected={isSelected(AclRowField.HDG)}
              onMouseDown={handleHeadingClick}
              scratchpad={!!entry.scratchpadHeading && (displayScratchHdg || entry.assignedHeading === null)}
            >
              {entry.scratchpadHeading && (displayScratchHdg || entry.assignedHeading === null) ? entry.scratchpadHeading : entry.assignedHeading}
            </HdgCol>
          </EdstTooltip>
          <HdgSpdSlashCol>/</HdgSpdSlashCol>
          <EdstTooltip title={Tooltips.aclSpd}>
            <SpdCol
              ref={spdRef}
              hover
              visibilityHidden={hiddenColumns.includes(AclRowField.SPD)}
              selected={isSelected(AclRowField.SPD)}
              onMouseDown={handleSpeedClick}
              scratchpad={!!entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null)}
            >
              {entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null) ? entry.scratchpadSpeed : entry.assignedSpeed}
            </SpdCol>
          </EdstTooltip>
          <SpecialBox onMouseDown={() => setDisplayScratchSpd(!displayScratchSpd)} disabled={!(entry.assignedSpeed && entry.scratchpadSpeed)}>
            {entry.assignedSpeed && entry.scratchpadSpeed && "*"}
          </SpecialBox>
          <SpecialBox disabled />
          {anyHolding && (
            <SpecialBox ref={holdRef} color={colors.brown} selected={isSelected(AclRowField.HOLD)} onMouseDown={handleHoldClick}>
              {entry.holdAnnotations ? "H" : ""}
            </SpecialBox>
          )}
          <EdstTooltip title={Tooltips.aclRemarksBtn}>
            <RemarksBox unchecked={!entry.remarksChecked && entry.remarks.length > 0} onMouseDown={handleRemarksClick}>
              {entry.remarks.length > 0 && "*"}
            </RemarksBox>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclRoute}>
            <RouteCol ref={routeRef} hover selected={isSelected(AclRowField.ROUTE)} onMouseDown={event => handleRouteClick(event.currentTarget)}>
              <RouteSpan padding="0 2px">
                {entry.routeDisplay === RouteDisplayOption.holdAnnotations &&
                  holdAnnotations &&
                  `${holdAnnotations.fix ?? "PP"} ${HoldDirectionValues[holdAnnotations.direction]} ` +
                    `${HoldTurnDirectionValues[holdAnnotations.turns]} ` +
                    `${holdAnnotations.legLength ?? "STD"}` +
                    // eslint-disable-next-line no-nested-ternary
                    `${holdAnnotations.legLength ? (holdAnnotations.legLengthInNm ? "NM" : "Minutes") : ""} EFC ${formatUtcMinutes(
                      holdAnnotations.efc
                    )}`}
                {entry.routeDisplay === RouteDisplayOption.remarks && <span>{entry.remarks}</span>}
                {entry.routeDisplay === RouteDisplayOption.rawRoute && <span>{entry.route}</span>}
                {!entry.routeDisplay && (
                  <>
                    <RouteDepAirportSpan amendmentPending={parAvail && !onPar} selected={isSelected(AclRowField.ROUTE)}>
                      {entry.departure}
                    </RouteDepAirportSpan>
                    ./.
                    {route}
                    {!route.endsWith(".") && route.length > 0 && `.`}
                    {entry.destination}
                  </>
                )}
              </RouteSpan>
            </RouteCol>
          </EdstTooltip>
        </InnerRow>
      </BodyRowDiv>
      {entry.showFreeText && (
        <BodyRowDiv>
          <RadioCol disabled />
          <AclCol1 />
          <AclCol1 />
          <AclCol1 />
          <SpecialBox disabled />
          <InnerRow2 highlight={entry.highlighted} minWidth={`${Math.max(1200, ref?.current?.clientWidth ?? 0)}px`}>
            <FreeTextRow marginLeft="calc(19ch + 11px)">
              <input
                value={freeTextContent}
                onChange={event => setFreeTextContent(event.target.value)}
                onBlur={() => dispatch(updateEntry({ aircraftId, data: { freeTextContent } }))}
              />
            </FreeTextRow>
          </InnerRow2>
        </BodyRowDiv>
      )}
    </BodyRowContainerDiv>
  );
});
