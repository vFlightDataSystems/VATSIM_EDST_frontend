import React, {useEffect, useMemo, useRef, useState} from 'react';

import '../../css/styles.scss';
import {PreferredRouteDisplay} from "./PreferredRouteDisplay";
import {computeFrdString, copy, getClosestReferenceFix, removeDestFromRouteString} from "../../lib";
import VATSIM_LOGO from '../../resources/images/VATSIM-social_icon.svg';
import SKYVECTOR_LOGO from '../../resources/images/glob_bright.png';
import FLIGHTAWARE_LOGO from '../../resources/images/FA_1.png';
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstTooltip} from "../resources/EdstTooltip";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {menuEnum, windowEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {
  aselSelector,
  AselType,
  closeMenu,
  menuPositionSelector,
  setInputFocused,
  pushZStack,
  zStackSelector
} from "../../redux/slices/appSlice";
import {addTrialPlanThunk, openMenuThunk} from "../../redux/thunks/thunks";
import {LocalEdstEntryType} from "../../types";
import {amendDirectThunk, amendEntryThunk} from "../../redux/thunks/entriesThunks";
import {point} from "@turf/turf";
import _ from "lodash";
import {useCenterCursor, useDragging, useFocused} from "../../hooks";
import {
  FidRow,
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsMenu,
  OptionsMenuHeader,
  UnderlineRow
} from '../../styles/optionMenuStyles';
import styled from "styled-components";
import {edstFontGrey} from "../../styles/colors";
import {referenceFixSelector} from "../../redux/slices/sectorSlice";
import {PlanQueryType} from "../../redux/slices/planSlice";
import {EdstDraggingOutline} from "../../styles/draggingStyles";

const RouteMenuDiv = styled(OptionsMenu)``;
const RouteMenuHeader = styled(OptionsMenuHeader)``;
const RouteMenuBody = styled(OptionsBody)``;
const RouteMenuRow = styled(OptionsBodyRow)`padding: 4px 0`;
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
  cursor: default;
  font-size: 16px;
  outline: none;
  flex: 1;
  color: ${edstFontGrey};
  background-color: #000000;
  border: 1px solid transparent;

  &:hover {
    border: 1px solid #F0F0F0;
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
    const pos = useRootSelector(menuPositionSelector(menuEnum.routeMenu));
    const asel = useRootSelector(aselSelector) as AselType;
    const entry = useRootSelector(aselEntrySelector) as LocalEdstEntryType;
    const referenceFixes = useRootSelector(referenceFixSelector);
    const zStack = useRootSelector(zStackSelector);

    const [displayRawRoute, setDisplayRawRoute] = useState(false);
    const [route, setRoute] = useState<string>(removeDestFromRouteString((asel.window === windowEnum.dep ? entry.route : entry._route?.replace(/^\.*/, '') ?? ''), entry.dest));
    const [routeInput, setRouteInput] = useState<string>(asel.window === windowEnum.dep ? entry.dep + route + entry.dest : route + entry.dest);
    const [trialPlan, setTrialPlan] = useState(!(asel.window === windowEnum.dep));
    const [append, setAppend] = useState({appendOplus: false, appendStar: false});
    const ref = useRef<HTMLDivElement>(null);
    const focused = useFocused(ref);
    useCenterCursor(ref, [asel]);
  const {startDrag, stopDrag, dragPreviewStyle} = useDragging(ref, menuEnum.routeMenu);


  const closestReferenceFix = useMemo(() => getClosestReferenceFix(referenceFixes, point([entry.flightplan.lon, entry.flightplan.lat])),
      [entry.flightplan.lat, entry.flightplan.lon, referenceFixes]);
    const frd = useMemo(() => closestReferenceFix ? computeFrdString(closestReferenceFix) : 'XXX000000', [closestReferenceFix]);

    const {appendOplus, appendStar} = useMemo(() => append, [append]);
    const currentRouteFixes: string[] = entry?._route_data?.map(fix => fix.name) ?? [];
    let routeData = asel.window === windowEnum.dep ? entry.route_data : entry._route_data;
    if (routeData?.[0]?.name?.match(/^\w+\d{6}$/gi)) {
      routeData = routeData?.slice(1);
    }

    let routes: any[];
    if (asel.window === windowEnum.dep) {
      routes = entry.adar.concat(entry.adr).concat(entry.aarList ?? []);
    } else {
      routes = entry._aarList?.filter(aar_data => currentRouteFixes.includes(aar_data.tfix)) ?? [];
    }

    useEffect(() => {
      const dep = asel.window === windowEnum.dep;
      let route = dep ? entry.route : entry._route?.replace(/^\.*/, '');
      route = removeDestFromRouteString(route ?? '', entry.dest);
      if (dep) {
        setTrialPlan(false);
      }
      setRoute(route);
      setRouteInput(dep ? entry.dep + route + entry.dest : route + entry.dest);
    }, [asel.window, entry._route, entry.dep, entry.dest, entry.flightplan.lat, entry.flightplan.lon, entry.referenceFix, entry.route, referenceFixes]);

    const clearedPrefroute = (rerouteData: Record<string, any>) => {
      let planData: Record<string, any>;
      const dest = entry.dest;
      if (rerouteData.routeType === 'aar') {
        planData = {route: rerouteData.amended_route, route_fixes: rerouteData.amended_route_fixes};
      } else if (rerouteData.routeType === 'adr') {
        planData = {route: rerouteData.amendment + rerouteData.route, route_fixes: rerouteData.amended_route_fixes};
      } else {
        planData = {route: rerouteData.route, route_data: rerouteData.route_data};
      }
      planData.route = removeDestFromRouteString(planData.route.slice(0), dest);
      copy(`${!(asel.window === windowEnum.dep) ? frd : ''}${planData.route}`);
      if (planData) {
        const msg = `AM ${entry.callsign} RTE ${planData.route}${entry.dest}`;
        if (!trialPlan) {
          dispatch(amendEntryThunk({cid: entry.cid, planData: planData}));
        } else {
          dispatch(addTrialPlanThunk({
            cid: entry.cid,
            callsign: entry.callsign,
            planData: planData,
            queryType: PlanQueryType.reroute,
            msg: msg
          }));
        }
      }
      dispatch(closeMenu(menuEnum.routeMenu));
    };

    const clearedToFix = (clearedFixName: string) => {
      const planData = {cid: entry.cid, fix: clearedFixName, frd: closestReferenceFix}
      if (planData) {
        if (!trialPlan) {
          dispatch(amendDirectThunk(planData))
          // dispatch(amendEntryThunk({cid: entry.cid, planData: planData}));
        } else {
          dispatch(addTrialPlanThunk({
            cid: entry.cid,
            callsign: entry.callsign,
            planData: planData,
            queryType: PlanQueryType.direct,
            dest: entry.dest
          }));
        }
      }
      dispatch(closeMenu(menuEnum.routeMenu));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      setRouteInput(event.target.value.toUpperCase());
    };

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        let _route = route.replace(/^\.+/gi, '');
        if (_route.match(/^[A-Z]+\d{6}/gi)) {
          _route = _route.split('.', 1)[1].replace(/^\.+/gi, '');
        }
        copy(`${!(asel.window === windowEnum.dep) ? frd : ''}${_route}`.replace(/\.+$/, ''));
        const planData = {route: _route, frd: frd};
        if (trialPlan) {
          dispatch(addTrialPlanThunk({
            cid: entry.cid,
            callsign: entry.callsign,
            planData: planData,
            queryType: PlanQueryType.reroute,
            msg: `AM ${entry.callsign} RTE ${frd}${_route}`
          }));
        } else {
          dispatch(amendEntryThunk({cid: entry.cid, planData: planData}));
        }
        dispatch(closeMenu(menuEnum.routeMenu));
      }
    };

    return pos && (<RouteMenuDiv
        ref={ref}
        width={570}
        pos={pos}
        zIndex={zStack.indexOf(menuEnum.routeMenu)}
        onMouseDown={() => zStack.indexOf(menuEnum.routeMenu) > 0 && dispatch(pushZStack(menuEnum.routeMenu))}
        id="route-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline
            style={dragPreviewStyle}
            onMouseUp={stopDrag}
        />}
        <RouteMenuHeader
          focused={focused}
          onMouseDown={startDrag}
          onMouseUp={stopDrag}
        >
          Route Menu
        </RouteMenuHeader>
        <RouteMenuBody>
          <FidRow>
            {entry.callsign} {entry.type}/{entry.equipment}
          </FidRow>
          <RouteMenuRow>
            <OptionsBodyCol>
              <EdstButton content="Trial Plan" selected={trialPlan} onMouseDown={() => setTrialPlan(true)}
                          title={Tooltips.routeMenuPlanData}
                          disabled={asel.window === windowEnum.dep}
              />
            </OptionsBodyCol>
            <OptionsBodyCol maxWidth={24} maxHeight={24}>
              <EdstTooltip>
                <a href={`https://skyvector.com/?fpl=${entry.dep} ${entry.flightplan.route} ${entry.dest}`}
                   target="_blank" rel="noreferrer">
                  <img src={SKYVECTOR_LOGO} alt="skyvector-logo"/>
                </a>
              </EdstTooltip>
            </OptionsBodyCol>
            <OptionsBodyCol maxWidth={24} maxHeight={24}>
              <EdstTooltip title={Tooltips.routeMenuVatsimLogo}>
                <img src={VATSIM_LOGO} alt="vatsim-logo"
                     onMouseDown={() => setDisplayRawRoute(!displayRawRoute)}
                     onContextMenu={(event: React.MouseEvent) => event.preventDefault()}
                />
              </EdstTooltip>
            </OptionsBodyCol>
            <OptionsBodyCol maxWidth={24} maxHeight={24}>
              <EdstTooltip>
                <a href={`https://flightaware.com/analysis/route.rvt?origin=${entry.dep}&destination=${entry.dest}`}
                   target="_blank" rel="noreferrer">
                  <img src={FLIGHTAWARE_LOGO} alt="flightaware-logo"/>
                </a>
              </EdstTooltip>
            </OptionsBodyCol>
            <OptionsBodyCol alignRight={true}>
              {entry.uplinkEligible &&
                  <EdstButton margin="2px 0 0 0" disabled={true} content={`\u{1D925}`}/>}
              <EdstButton content="Amend" selected={!trialPlan} onMouseDown={() => setTrialPlan(false)}
                          title={Tooltips.routeMenuAmend}
              />
            </OptionsBodyCol>
          </RouteMenuRow>
          <RouteMenuRow>
            <OptionsBodyCol>
              <InputContainer>
                {!(asel.window === windowEnum.dep) && <EdstTooltip
                    title={Tooltips.routeMenuFrd}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      copy(frd);
                    }}>
                    <PposDiv>
                      {frd}..
                    </PposDiv>
                </EdstTooltip>}
                <EdstTooltip title={Tooltips.routeMenuRouteInput}
                             style={{display: "flex", justifyContent: "left", flexGrow: "1"}}>
                  <Input
                    onFocus={() => dispatch(setInputFocused(true))}
                    onBlur={() => dispatch(setInputFocused(false))}
                    value={displayRawRoute ? entry.flightplan.route : routeInput}
                    onChange={(event) => !displayRawRoute && handleInputChange(event)}
                    onKeyDownCapture={(event) => !displayRawRoute && handleInputKeyDown(event)}
                  />
                </EdstTooltip>
              </InputContainer>
            </OptionsBodyCol>
          </RouteMenuRow>
          <RouteMenuRow topBorder={true}>
            <EdstTooltip disabled={true} title={Tooltips.routeMenuPar}>
              <ButtonCol hover={true}>
                <EdstButton padding="0 4px" margin="0 5px 0 0" disabled={true} width={12} height={12}/>
                Include PAR
              </ButtonCol>
            </EdstTooltip>
          </RouteMenuRow>
          <RouteMenuRow bottomBorder={true}>
            <EdstTooltip title={Tooltips.routeMenuAppendStar}
                         onMouseDown={() => setAppend({appendStar: !appendStar, appendOplus: false})}
            >
              <ButtonCol hover={true}>
                <EdstButton padding="0 4px" margin="0 5px 0 0" disabled={true} width={12} height={12}
                            selected={appendStar}/>
                Append *
              </ButtonCol>
            </EdstTooltip>
            <EdstTooltip
              title={Tooltips.routeMenuAppendOplus}
              onMouseDown={() => setAppend({appendOplus: !appendOplus, appendStar: false})}
            >
              <ButtonCol hover={true}>
                <EdstButton padding="0 4px" margin="0 5px 0 0" disabled={true} width={12} height={12}
                            selected={appendOplus}/>
                Append<span>&nbsp;{`\u2295`}</span>
              </ButtonCol>
            </EdstTooltip>
          </RouteMenuRow>
          <EdstTooltip title={Tooltips.routeMenuDirectFix}>
            <UnderlineRow as={RouteMenuRow}>
              Direct-To-Fix
            </UnderlineRow>
          </EdstTooltip>
          <OptionsBodyRow>
            <DisplayRouteDiv>
              {(asel.window === windowEnum.dep) ? entry.dep + route + entry.dest : `./.${route}${entry.dest}`}
            </DisplayRouteDiv>
          </OptionsBodyRow>
          {_.range(0, Math.min(routeData?.length ?? 0, 10)).map((i) =>
            <OptionsBodyRow key={`route-menu-row-${i}`}>
              {_.range(0, ((routeData?.length ?? 0) / 10 | 0) + 1).map((j) => {
                const fixName = routeData?.[Number(i) + Number(j) * 10]?.name;
                return (fixName && <EdstTooltip key={`route-menu-col-${i}-${j}`}
                                                onMouseDown={() => clearedToFix(fixName)}
                                                title={Tooltips.routeMenuDirectFix}
                >
                    <DctCol hover={true}>
                      {fixName}
                    </DctCol>
                </EdstTooltip>);
              })}
            </OptionsBodyRow>)}
          {routes?.length > 0 &&
              <PreferredRouteDisplay
                  aar={entry._aarList?.filter(aar_data => currentRouteFixes.includes(aar_data.tfix)) ?? []}
                  adr={asel.window === windowEnum.dep ? entry.adr : []}
                  adar={asel.window === windowEnum.dep ? entry.adar : []}
                  dep={entry.dep}
                  dest={entry.dest}
                  clearedPrefroute={clearedPrefroute}
              />}
          <OptionsBodyRow margin="14px 0 0 0" padding="">
            <OptionsBodyCol>
              <EdstButton disabled={true} margin="0 4px 0 0" content="Flight Data" title={Tooltips.routeMenuFlightData}/>
              <EdstButton disabled={entry?.previous_route === undefined} margin="0 4px 0 0" content="Previous Route"
                          onMouseDown={() => {
                            dispatch(openMenuThunk(menuEnum.prevRouteMenu, ref.current, menuEnum.routeMenu, true));
                            dispatch(closeMenu(menuEnum.routeMenu));
                          }}
                          title={Tooltips.routeMenuPrevRoute}
              />
              <EdstButton disabled={true} content="TFM Reroute Menu" title={Tooltips.routeMenuTfmReroute}/>
            </OptionsBodyCol>
            <OptionsBodyCol alignRight={true}>
              <EdstButton content="Exit"
                          onMouseDown={() => dispatch(closeMenu(menuEnum.routeMenu))}/>
            </OptionsBodyCol>
          </OptionsBodyRow>
        </RouteMenuBody>
      </RouteMenuDiv>
    );
  }
;
