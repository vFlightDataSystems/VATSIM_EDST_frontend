import React, {MouseEventHandler, useEffect, useMemo, useRef, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import {formatUtcMinutes, REMOVAL_TIMEOUT, removeDestFromRouteString} from "../../../lib";
import VCI from '../../../resources/images/VCI_v4.png';
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {LocalEdstEntryType} from "../../../types";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {deleteAclEntry, toggleSpa, updateEntry} from "../../../redux/slices/entriesSlice";
import {aclAselActionTriggerEnum, aclRowFieldEnum, menuEnum, windowEnum} from "../../../enums";
import {aselSelector, setInputFocused} from "../../../redux/slices/appSlice";
import {aclAircraftSelect} from "../../../redux/thunks/thunks";
import {amendEntryThunk} from "../../../redux/thunks/entriesThunks";
import {toolsOptionsSelector} from "../../../redux/slices/aclSlice";

const SPA_INDICATOR = '\u2303';

type AclRowProps = {
  key: string,
  entry: LocalEdstEntryType,
  index: number,
  anyHolding: boolean,
  hidden: aclRowFieldEnum[],
  altMouseDown: boolean,
}

export const AclRow: React.FC<AclRowProps> = (
  {
    entry,
    hidden,
    altMouseDown,
    index,
    anyHolding
  }) => {
  const asel = useAppSelector(aselSelector);
  const dispatch = useAppDispatch();
  const manualPosting = useAppSelector((state) => state.acl.manualPosting);
  const toolOptions = useAppSelector(toolsOptionsSelector);
  const [aarAvail, setAarAvail] = useState(false);
  const [onAar, setOnAar] = useState(false);

  useEffect(() => (() => {
    if (freeTextContent !== (entry.free_text_content ?? '')) {
      dispatch(amendEntryThunk({cid: entry.cid, planData: {free_text_content: freeTextContent}}));
    } // eslint-disable-next-line
  }), []);

  useEffect(() => {
    const currentFixNames = (entry._route_data ?? entry.route_data).map(fix => fix.name);
    const aarAvail = (entry.aarList?.filter((aar) => aar.eligible && currentFixNames.includes(aar.tfix)) && !(entry._aarList?.filter((aar) => aar.onEligibleAar)));
    const onAar = !!entry._aarList?.filter((aar) => aar.onEligibleAar)?.length;
    setAarAvail(aarAvail ?? false);
    setOnAar(onAar);
  }, [entry._aarList, entry._route_data, entry.aarList, entry.route_data]);

  const holdData = useMemo(() => entry.hold_data, [entry.hold_data]);
  const route = useMemo(() => {
    let route = entry._route?.replace(/^\.+/, '') ?? entry.route;
    return removeDestFromRouteString(route.slice(0), entry.dest);
  }, [entry]);

  const now = new Date().getTime();

  const [displayScratchHdg, setDisplayScratchHdg] = useState(false);
  const [displayScratchSpd, setDisplayScratchSpd] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState(entry.free_text_content ?? '');
  const ref = useRef<HTMLDivElement | null>(null);

  // coral box indicates that aircraft is not RVSM capable but equipment says it is not RVSM capable
  const showCoralBox = (!entry.equipment.match(/[LZWH]/g) && Number(entry.altitude) > 280) && toolOptions.nonRvsmIndicator;

  const checkAarReroutePending = () => {
    const currentFixNames = (entry._route_data ?? entry.route_data).map(fix => fix.name);
    const eligibleAar = entry?._aarList?.filter((aar) => aar.eligible);
    if (eligibleAar?.length === 1) {
      const aar = eligibleAar[0];
      if (currentFixNames.includes(aar.tfix)) {
        return aar.aar_amendment_route_string;
      }
    }
    return null;
  };
  const pendingAar = checkAarReroutePending();

  const handleHotboxMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    if (event.button === 0) {
      dispatch(updateEntry({cid: entry.cid, data: {showFreeText: !entry.showFreeText}}));
      dispatch(amendEntryThunk({cid: entry.cid, planData: {free_text_content: freeTextContent}}));
    }
    if (event.button === 1) {
      dispatch(toggleSpa(entry.cid));
    }
    if (event.button === 2) {
      dispatch(updateEntry({cid: entry.cid, data: {aclHighlighted: !entry.aclHighlighted}}));
    }
  };

  const updateVci = () => {
    if (entry.vciStatus === -1 && manualPosting) {
      dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
    } else {
      if (entry.vciStatus < 1) {
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 1}}));
      } else {
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
      }
    }
  };

  const handleHoldClick = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        if (!entry.hold_data) {
          dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.hold, null, menuEnum.holdMenu));
        } else {
          dispatch(updateEntry({
            cid: entry.cid,
            data: {aclRouteDisplay: !entry.aclRouteDisplay ? 'hold_data' : null}
          }));
        }
        break;
      case 1:
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.hold, aclAselActionTriggerEnum.toggleHoldInfo));
        break;
      default:
        break;
    }
  };

  const handleRemarksClick = (event: React.MouseEvent) => {
    if (entry.vciStatus === -1 && !manualPosting) {
      dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
    }
    switch (event.button) {
      case 0:
        dispatch(updateEntry({
          cid: entry.cid, data: {
            aclRouteDisplay: !(entry.aclRouteDisplay === 'remarks') && entry.remarks.length > 0 ? 'remarks' : null,
            remarksChecked: true
          }
        }));
        break;
      case 2:
        dispatch(updateEntry({
          cid: entry.cid,
          data: {aclRouteDisplay: !(entry.aclRouteDisplay === 'raw_route') ? 'raw_route' : null}
        }));
        break;
      default:
        break;
    }
  };

  const handleFidClick: MouseEventHandler = (event: React.MouseEvent & MouseEvent) => {
    const now = new Date().getTime();
    switch (event.button) {
      case 2:
        if (now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT) {
          dispatch(deleteAclEntry(entry.cid));
        }
        break;
      default:
        if (!manualPosting && event.detail === 2 && entry.vciStatus < 0) {
          dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
        }
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.fid));
        break;
    }
  };

  const handleHeadingClick: MouseEventHandler = (event: React.MouseEvent & Event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.hdg, null, menuEnum.headingMenu));
        break;
      case 1:
        if (entry.scratchHdg && (displayScratchHdg || entry.hdg === null)) {
          let promotedHdg = 'LRH'.includes(entry.scratchHdg.slice(-1)) ? entry.scratchHdg : `H${entry.scratchHdg}`;
          dispatch(amendEntryThunk({cid: entry.cid, planData: {hdg: promotedHdg, scratch_hdg: null}}));
        }
        break;
      case 2:
        dispatch(amendEntryThunk({
          cid: entry.cid,
          planData: {[(displayScratchHdg || !entry.hdg) && entry.scratchHdg ? 'scratch_hdg' : 'hdg']: null}
        }));
        break;
      default:
        break;
    }
  };

  const handleSpeedClick: MouseEventHandler = (event: React.MouseEvent & Event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.spd, null, menuEnum.speedMenu));
        break;
      case 1:
        if (entry.scratchSpd && (displayScratchSpd || entry.spd === null)) {
          let promotedSpd = entry.scratchSpd.slice(0, 1) === 'M' ? entry.scratchSpd : `S${entry.scratchSpd}`;
          dispatch(amendEntryThunk({cid: entry.cid, planData: {spd: promotedSpd, scratch_spd: null}}));
        }
        break;
      case 2:
        dispatch(amendEntryThunk({
          cid: entry.cid,
          planData: {[(displayScratchSpd || !entry.spd) && entry.scratchSpd ? 'scratch_spd' : 'spd']: null}
        }));
        break;
      default:
        break;
    }
  };

  const isSelected = (cid: string, field: aclRowFieldEnum): boolean => {
    return asel?.window === windowEnum.acl && asel?.cid === cid && asel?.field === field;
  };

  return (<div className={`body-row-container ${index % 3 === 2 ? 'row-sep-border' : ''}`}
               key={`acl-row-container-${entry.cid}`}
               onContextMenu={(event) => event.preventDefault()}>
    <div className={`body-row ${(now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT) ? 'pending-removal' : ''}`}>
      <EdstTooltip title={Tooltips.aclNAndVciBtn}>
        <div className={`body-col body-col-1 radio ${entry.vciStatus === 1 ? 'green' : ''}`}
             onMouseDown={updateVci}>
          {entry.vciStatus === -1 && 'N'}{entry.vciStatus === 1 && <img src={VCI} alt="wifi-symbol"/>}
        </div>
      </EdstTooltip>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1 border"/>
      <div className={`body-col special-box`} // @ts-ignore
           disabled={true}/>
      <div className={`body-col special-box`} // @ts-ignore
           disabled={true}/>
      <div className={`inner-row ${entry.aclHighlighted ? 'highlighted' : ''}`}
           ref={ref}
           style={{minWidth: entry.showFreeText ? '1200px' : 0}}
      >
        <EdstTooltip title={Tooltips.aclFlightId} onMouseDown={handleFidClick}>
          <div className={`body-col fid hover ${isSelected(entry.cid, aclRowFieldEnum.fid) ? 'selected' : ''}`}>
            {entry.cid} {entry.callsign}
            <span className="voice-type">
              {entry.voiceType === 'r' ? '/R' : entry.voiceType === 't' ? '/T' : ''}
            </span>
          </div>
        </EdstTooltip>
        <div className="body-col pa"/>
        <div className={`body-col special-box ${!entry.spa ? 'special-hidden' : ''}`}>
          {entry.spa && SPA_INDICATOR}
        </div>
        <EdstTooltip title={Tooltips.aclHotbox}>
          <div className="body-col special-box hotbox"
               onMouseDown={handleHotboxMouseDown}
          >
            {freeTextContent && '*'}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclType}>
          <div className={`body-col type hover ${hidden.includes(aclRowFieldEnum.type) ? 'content hidden' : ''}
        ${isSelected(entry.cid, aclRowFieldEnum.type) ? 'selected' : ''}`}
               onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.type))}
          >
            {`${entry.type}/${entry.equipment}`}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclAlt}>
          <div className={`body-col alt`}>
            <div className={`${altMouseDown ? 'md' : ''} ${entry.interim ? 'interim' : ''}
          ${isSelected(entry.cid, aclRowFieldEnum.alt) ? 'selected' : ''}`}
                 onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.alt, null, menuEnum.altitudeMenu))}
            >
              {entry.altitude}{entry.interim && `T${entry.interim}`}
            </div>
            {showCoralBox && <div className="special coral-box"/>}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclCode}>
          <div
            className={`body-col code hover ${hidden.includes(aclRowFieldEnum.code) ? 'content hidden' : ''}
          ${isSelected(entry.cid, aclRowFieldEnum.code) ? 'selected' : ''}`}
            onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.code))}
          >
            {entry.beacon}
          </div>
        </EdstTooltip>
        <div className={`body-col hover special-box`}
             onMouseDown={() => setDisplayScratchHdg(!displayScratchHdg)}
          // @ts-ignore
             disabled={!(entry.hdg && entry.scratchHdg)}>
          {entry.hdg && entry.scratchHdg && '*'}
        </div>
        <EdstTooltip title={Tooltips.aclHdg}>
          <div className={`body-col hs spd hover ${hidden.includes(aclRowFieldEnum.hdg) ? 'content hidden' : ''}
              ${isSelected(entry.cid, aclRowFieldEnum.hdg) ? 'selected' : ''} ${(entry.scratchHdg && (displayScratchHdg || entry.hdg === null)) ? 'yellow' : ''}`}
               onMouseDown={handleHeadingClick}
          >
            {(entry.scratchHdg && (displayScratchHdg || entry.hdg === null)) ? entry.scratchHdg : entry.hdg}
          </div>
        </EdstTooltip>
        <div className="body-col hs-slash">
          /
        </div>
        <EdstTooltip title={Tooltips.aclSpd}>
          <div className={`body-col hs spd hover ${hidden.includes(aclRowFieldEnum.spd) ? 'content hidden' : ''}
${isSelected(entry.cid, aclRowFieldEnum.spd) ? 'selected' : ''} ${(entry.scratchSpd && (displayScratchSpd || entry.spd === null)) ? 'yellow' : ''}`}
               onMouseDown={handleSpeedClick}
          >
            {(entry.scratchSpd && (displayScratchSpd || entry.spd === null)) ? entry.scratchSpd : entry.spd}
          </div>
        </EdstTooltip>
        <div className={`body-col hover special-box`}
             onMouseDown={() => setDisplayScratchSpd(!displayScratchSpd)}
          // @ts-ignore
             disabled={!(entry.spd && entry.scratchSpd)}>
          {entry.spd && entry.scratchSpd && '*'}
        </div>
        <div className={`body-col special-box`} // @ts-ignore
             disabled={true}/>
        <div
          className={`body-col special-box hold-col ${isSelected(entry.cid, aclRowFieldEnum.hold) ? 'selected' : ''}`}
          onMouseDown={handleHoldClick}
          onContextMenu={(event) => {
            event.preventDefault();
            if (entry?.hold_data) {
              dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.route, null, menuEnum.cancelHoldMenu));
            }
          }}
          // @ts-ignore
          disabled={!anyHolding}
        >
          {entry.hold_data ? 'H' : ''}
        </div>
        <div className={`body-col special-box`} // @ts-ignore
             disabled={true}/>
        <EdstTooltip title={Tooltips.aclRemarksBtn}>
          <div
            className={`body-col special-box ${!entry.remarksChecked && entry.remarks.length > 0 ? 'remarks-unchecked' : ''}`}
            onMouseDown={handleRemarksClick}
          >
            {entry.remarks.length > 0 && '*'}
          </div>
        </EdstTooltip>
        <div className={`body-col special-box`} // @ts-ignore
             disabled={true}/>
        <div className={`body-col special-box`} // @ts-ignore
             disabled={true}/>
        <EdstTooltip title={Tooltips.aclRoute}>
          <div className={`body-col route hover ${isSelected(entry.cid, aclRowFieldEnum.route) ? 'selected' : ''}`}
               onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.route, null, menuEnum.routeMenu))}
          >
            {entry.aclRouteDisplay === 'hold_data' && holdData &&
              `${holdData.hold_fix} ${holdData.hold_direction} ${holdData.turns} ${holdData.leg_length} EFC ${formatUtcMinutes(holdData.efc)}`}
            {entry.aclRouteDisplay === 'remarks' && <span>{entry.flightplan.remarks}</span>}
            {entry.aclRouteDisplay === 'raw_route' && <span>{entry.flightplan.route}</span>}
            {!entry.aclRouteDisplay && <span className="no-pad">
            <span
                className={`${aarAvail && !onAar ? 'amendment-1' : ''} ${isSelected(entry.cid, aclRowFieldEnum.route) ? 'selected' : ''}`}>
              {entry.dep}
            </span>
            ./.
              {entry.cleared_direct?.fix && route.startsWith(entry.cleared_direct?.fix) && entry.cleared_direct?.frd + '..'}
              {/*{entry.reference_fix ? computeFrd(entry.reference_fix) + '.' : ''}*/}
              {route}{!route.endsWith('.') && route.length > 0 && `.`}
              {pendingAar && !onAar &&
                  <span className={`amendment-2 ${isSelected(entry.cid, aclRowFieldEnum.route) ? 'selected' : ''}`}>
              {`[${pendingAar}]`}
              </span>}
              {entry.dest}
          </span>}
          </div>
        </EdstTooltip>
      </div>
    </div>
    {entry.showFreeText && <div className="body-row">
        <div className={`body-col body-col-1 radio`}/>
        <div className="body-col body-col-1"/>
        <div className="body-col body-col-1"/>
        <div className="body-col body-col-1"/>
        <div className={`body-col special-box`} // @ts-ignore
             disabled={true}/>
        <div className={`body-col special-box`} // @ts-ignore
             disabled={true}/>
        <div className={`inner-row-2 ${entry.aclHighlighted ? 'highlighted' : ''}`}
             style={{minWidth: Math.max(1200, ref?.current?.clientWidth ?? 0) + 'px'}}
        >
            <div className="free-text-row">
                <input
                    onFocus={() => dispatch(setInputFocused(true))}
                    onBlur={() => dispatch(setInputFocused(false))}
                    value={freeTextContent}
                    onChange={(event) => setFreeTextContent(event.target.value.toUpperCase())}/>
            </div>
        </div>
    </div>}
  </div>);
};
