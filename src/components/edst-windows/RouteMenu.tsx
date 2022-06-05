import React, { useEffect, useMemo, useRef, useState } from "react";

import "../../css/styles.scss";
import _ from "lodash";
import styled from "styled-components";
import { point } from "@turf/turf";
import { PreferredRouteDisplay } from "./PreferredRouteDisplay";
import { computeFrdString, copy, getClearedToFixRouteData, getClosestReferenceFix, removeDestFromRouteString } from "../../lib";
import VATSIM_LOGO from "../../resources/images/VATSIM-social_icon.svg";
import SKYVECTOR_LOGO from "../../resources/images/glob_bright.png";
import FLIGHTAWARE_LOGO from "../../resources/images/FA_1.png";
import { EdstButton, EdstRouteButton12x12 } from "../resources/EdstButton";
import { Tooltips } from "../../tooltips";
import { EdstTooltip } from "../resources/EdstTooltip";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entriesSlice";
import { Asel, aselSelector, closeWindow, windowPositionSelector, pushZStack, zStackSelector } from "../../redux/slices/appSlice";
import { addTrialPlanThunk, openMenuThunk } from "../../redux/thunks/thunks";
import { AircraftTrack, Flightplan, LocalEdstEntry } from "../../types";
import { useCenterCursor, useDragging, useFocused } from "../../hooks";
import { FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader, UnderlineRow } from "../../styles/optionMenuStyles";
import { edstFontGrey } from "../../styles/colors";
import { referenceFixSelector } from "../../redux/slices/sectorSlice";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { aselTrackSelector } from "../../redux/slices/aircraftTrackSlice";
import { useHub } from "../../hub";
import { EdstWindow } from "../../namespaces";

const RouteMenuDiv = styled(OptionsMenu)`
  width: 570px;
`;
const RouteMenuHeader = styled(OptionsMenuHeader)``;
const RouteMenuBody = styled(OptionsBody)``;
const RouteMenuRow = styled(OptionsBodyRow)`
  padding: 4px 0;
`;
const InputContainer = styled.div`
  align-items: center;
  vertical-align: center;
  display: flex;
  padding: 0;
  overflow: hidden;
  border-top: 2px solid #575757;
  border-left: 2px solid #575757;
  border-bottom: 2px solid #888888;
  border-right: 2px solid #888888;
`;
const Input = styled.input`
  //cursor: default;
  font-size: 16px;
  outline: none;
  flex: 1;
  color: ${edstFontGrey};
  background-color: #000000;
  border: 1px solid transparent;

  &:hover {
    border: 1px solid #f0f0f0;
  }
`;
const PposDiv = styled.div`
  border: 2px solid transparent;
  border-right: none;
  padding: 0 2px;
  width: 120px;
  font-size: 16px;
  color: #575757;
`;
const ButtonCol = styled(OptionsBodyCol)`
  padding: 0 4px;
  display: flex;
  flex-grow: 0;
  min-height: 22px;
`;
const DisplayRouteDiv = styled(OptionsBodyCol)`
  border: 2px solid #414141;
  padding: 0 3px;
  margin: 2px 8px 8px 8px;
`;
const DctCol = styled(OptionsBodyCol)`
  display: block;
  height: 20px;
  padding: 0 4px;
  flex-grow: 1;
  width: 100px;
  margin: 0 12px;
`;

export const RouteMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.ROUTE_MENU));
  const asel = useRootSelector(aselSelector) as Asel;
  const entry = useRootSelector(aselEntrySelector) as LocalEdstEntry;
  const aircraftTrack = useRootSelector(aselTrackSelector) as AircraftTrack;
  const referenceFixes = useRootSelector(referenceFixSelector);
  const zStack = useRootSelector(zStackSelector);
  const hubConnection = useHub();

  const [displayRawRoute, setDisplayRawRoute] = useState(false);
  const [route, setRoute] = useState<string>(
    removeDestFromRouteString(
      asel.window === EdstWindow.DEP ? entry.formattedRoute : entry.currentRoute?.replace(/^\.*/, "") ?? "",
      entry.destination
    )
  );
  const [routeInput, setRouteInput] = useState<string>(
    asel.window === EdstWindow.DEP ? entry.departure + route + entry.destination : route + entry.destination
  );
  const [trialPlan, setTrialPlan] = useState(!(asel.window === EdstWindow.DEP));
  const [append, setAppend] = useState({ appendOplus: false, appendStar: false });
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel]);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.ROUTE_MENU);

  const closestReferenceFix = useMemo(() => getClosestReferenceFix(referenceFixes, point([aircraftTrack.location.lon, aircraftTrack.location.lat])), [
    aircraftTrack.location,
    referenceFixes
  ]);
  const frd = useMemo(() => (closestReferenceFix ? computeFrdString(closestReferenceFix) : "XXX000000"), [closestReferenceFix]);

  const { appendOplus, appendStar } = useMemo(() => append, [append]);
  const currentRouteFixes: string[] = entry?.currentRouteData?.map(fix => fix.name) ?? [];
  let routeData = asel.window === EdstWindow.DEP ? entry.routeData : entry.currentRouteData;
  if (routeData?.[0]?.name?.match(/^\w+\d{6}$/gi)) {
    routeData = routeData?.slice(1);
  }

  let routes: any[];
  if (asel.window === EdstWindow.DEP) {
    routes = (entry.adar ?? []).concat(entry.adr ?? []).concat(entry.aarList ?? []);
  } else {
    routes = entry.currentAarList?.filter(aarData => currentRouteFixes.includes(aarData.tfix)) ?? [];
  }

  useEffect(() => {
    const dep = asel.window === EdstWindow.DEP;
    let route = dep ? entry.formattedRoute : entry.currentRoute?.replace(/^\.*/, "") ?? "";
    route = removeDestFromRouteString(route ?? "", entry.destination);
    if (dep) {
      setTrialPlan(false);
    }
    setRoute(route);
    setRouteInput(dep ? entry.departure + route + entry.destination : route + entry.destination);
  }, [asel.window, entry.currentRoute, entry.departure, entry.destination, entry.referenceFix, entry.route, referenceFixes]);

  // TODO: implement this
  const clearedPrefroute = (routeString: string) => {
    dispatch(closeWindow(EdstWindow.ROUTE_MENU));
  };

  const clearedToFix = (clearedFixName: string) => {
    const route = getClearedToFixRouteData(clearedFixName, entry, aircraftTrack.location, referenceFixes)?.route;
    if (!trialPlan) {
      if (hubConnection) {
        if (route) {
          const amendedFlightplan: Flightplan = {
            ...entry,
            route: route
              .split(/\.+/g)
              .join(" ")
              .trim()
          };
          hubConnection.invoke("AmendFlightPlan", amendedFlightplan).catch(e => console.log("error amending flightplan:", e));
        }
      }
    } else if (route) {
      const amendedFlightplan: Flightplan = {
        ...entry,
        route: route
          .split(/\.+/g)
          .join(" ")
          .trim()
      };
      dispatch(
        addTrialPlanThunk({
          aircraftId: entry.aircraftId,
          callsign: entry.aircraftId,
          amendedFlightplan,
          commandString: `AM ${entry.aircraftId} 10 ${route}${amendedFlightplan.destination}`
        })
      );
    }
    dispatch(closeWindow(EdstWindow.ROUTE_MENU));
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      let newRoute = removeDestFromRouteString(route.replace(/^\.+/gi, ""), entry.destination);
      if (newRoute.match(/^[A-Z]+\d{6}/gi)) {
        newRoute = newRoute.split(".", 1)[1].replace(/^\.+/gi, "");
      }
      copy(`${!(asel.window === EdstWindow.DEP) ? frd : ""}${newRoute}`.replace(/\.+$/, "")).then();
      if (trialPlan) {
        // dispatch(
        //   addTrialPlanThunk({
        //     aircraftId: entry.aircraftId,
        //     callsign: entry.destination,
        //
        //   })
        // );
      }
      dispatch(closeWindow(EdstWindow.ROUTE_MENU));
    }
  };

  return (
    pos && (
      <RouteMenuDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.ROUTE_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.ROUTE_MENU) > 0 && dispatch(pushZStack(EdstWindow.ROUTE_MENU))}
        anyDragging={anyDragging}
        id="route-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <RouteMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Route Menu
        </RouteMenuHeader>
        <RouteMenuBody>
          <FidRow>
            {entry.aircraftId} {`${entry.equipment.split("/")[0]}/${entry.nasSuffix}`}
          </FidRow>
          <RouteMenuRow>
            <OptionsBodyCol>
              <EdstButton
                content="Trial Plan"
                selected={trialPlan}
                onMouseDown={() => setTrialPlan(true)}
                title={Tooltips.routeMenuPlanData}
                disabled={asel.window === EdstWindow.DEP}
              />
            </OptionsBodyCol>
            <OptionsBodyCol maxWidth={24} maxHeight={24}>
              <EdstTooltip>
                <a href={`https://skyvector.com/?fpl=${entry.departure} ${entry.route} ${entry.destination}`} target="_blank" rel="noreferrer">
                  <img src={SKYVECTOR_LOGO} alt="skyvector-logo" />
                </a>
              </EdstTooltip>
            </OptionsBodyCol>
            <OptionsBodyCol maxWidth={24} maxHeight={24}>
              <EdstTooltip title={Tooltips.routeMenuVatsimLogo}>
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <img
                  src={VATSIM_LOGO}
                  alt="vatsim-logo"
                  onMouseDown={() => setDisplayRawRoute(!displayRawRoute)}
                  onContextMenu={(event: React.MouseEvent) => event.preventDefault()}
                />
              </EdstTooltip>
            </OptionsBodyCol>
            <OptionsBodyCol maxWidth={24} maxHeight={24}>
              <EdstTooltip>
                <a
                  href={`https://flightaware.com/analysis/route.rvt?origin=${entry.departure}&destination=${entry.destination}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={FLIGHTAWARE_LOGO} alt="flightaware-logo" />
                </a>
              </EdstTooltip>
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              {entry.uplinkEligible && <EdstButton margin="2px 0 0 0" disabled content={`\u{1D925}`} />}
              <EdstButton content="Amend" selected={!trialPlan} onMouseDown={() => setTrialPlan(false)} title={Tooltips.routeMenuAmend} />
            </OptionsBodyCol>
          </RouteMenuRow>
          <RouteMenuRow>
            <OptionsBodyCol>
              <InputContainer>
                {!(asel.window === EdstWindow.DEP) && (
                  <EdstTooltip
                    title={Tooltips.routeMenuFrd}
                    onContextMenu={event => {
                      event.preventDefault();
                      copy(frd).then();
                    }}
                  >
                    <PposDiv>{frd}..</PposDiv>
                  </EdstTooltip>
                )}
                <EdstTooltip title={Tooltips.routeMenuRouteInput} style={{ display: "flex", justifyContent: "left", flexGrow: "1" }}>
                  <Input
                    value={displayRawRoute ? entry.route : routeInput}
                    onChange={event => !displayRawRoute && setRouteInput(event.target.value)}
                    onKeyDown={event => !displayRawRoute && handleInputKeyDown(event)}
                  />
                </EdstTooltip>
              </InputContainer>
            </OptionsBodyCol>
          </RouteMenuRow>
          <RouteMenuRow topBorder>
            <EdstTooltip disabled title={Tooltips.routeMenuPar}>
              <ButtonCol hover>
                <EdstRouteButton12x12 disabled />
                Include PAR
              </ButtonCol>
            </EdstTooltip>
          </RouteMenuRow>
          <RouteMenuRow bottomBorder>
            <EdstTooltip title={Tooltips.routeMenuAppendStar} onMouseDown={() => setAppend({ appendStar: !appendStar, appendOplus: false })}>
              <ButtonCol hover>
                <EdstRouteButton12x12 disabled selected={appendStar} />
                Append *
              </ButtonCol>
            </EdstTooltip>
            <EdstTooltip title={Tooltips.routeMenuAppendOplus} onMouseDown={() => setAppend({ appendOplus: !appendOplus, appendStar: false })}>
              <ButtonCol hover>
                <EdstRouteButton12x12 disabled selected={appendOplus} />
                Append<span>&nbsp;{`\u2295`}</span>
              </ButtonCol>
            </EdstTooltip>
          </RouteMenuRow>
          <EdstTooltip title={Tooltips.routeMenuDirectFix}>
            <UnderlineRow as={RouteMenuRow}>Direct-To-Fix</UnderlineRow>
          </EdstTooltip>
          <OptionsBodyRow>
            <DisplayRouteDiv>
              {asel.window === EdstWindow.DEP ? entry.departure + route + entry.destination : `./.${route}${entry.destination}`}
            </DisplayRouteDiv>
          </OptionsBodyRow>
          {_.range(0, Math.min(routeData?.length ?? 0, 10)).map(i => (
            <OptionsBodyRow key={`route-menu-row-${i}`}>
              {_.range(0, Math.round((routeData?.length ?? 0) / 10) + 1).map(j => {
                const fixName = routeData?.[Number(i) + Number(j) * 10]?.name;
                return (
                  fixName && (
                    <EdstTooltip key={`route-menu-col-${i}-${j}`} onMouseDown={() => clearedToFix(fixName)} title={Tooltips.routeMenuDirectFix}>
                      <DctCol hover>{fixName}</DctCol>
                    </EdstTooltip>
                  )
                );
              })}
            </OptionsBodyRow>
          ))}
          {routes?.length > 0 && (
            <PreferredRouteDisplay
              aar={entry.currentAarList?.filter(aarData => currentRouteFixes.includes(aarData.tfix)) ?? []}
              adr={asel.window === EdstWindow.DEP && entry.adr ? entry.adr : []}
              adar={asel.window === EdstWindow.DEP && entry.adar ? entry.adar : []}
              dep={entry.departure}
              dest={entry.destination}
              clearedPrefroute={clearedPrefroute}
            />
          )}
          <OptionsBodyRow margin="14px 0 0 0" padding="">
            <OptionsBodyCol>
              <EdstButton disabled margin="0 4px 0 0" content="Flight Data" title={Tooltips.routeMenuFlightData} />
              <EdstButton
                disabled={entry?.previousRoute === undefined}
                margin="0 4px 0 0"
                content="Previous Route"
                onMouseDown={() => {
                  dispatch(openMenuThunk(EdstWindow.PREV_ROUTE_MENU, ref.current, EdstWindow.ROUTE_MENU, true));
                  dispatch(closeWindow(EdstWindow.ROUTE_MENU));
                }}
                title={Tooltips.routeMenuPrevRoute}
              />
              <EdstButton disabled content="TFM Reroute Menu" title={Tooltips.routeMenuTfmReroute} />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.ROUTE_MENU))} />
            </OptionsBodyCol>
          </OptionsBodyRow>
        </RouteMenuBody>
      </RouteMenuDiv>
    )
  );
};
