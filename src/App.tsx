import React from 'react';

import {distance, point} from '@turf/turf';

import {getAarData, getEdstData, updateEdstEntry} from "./api";
import './css/styles.scss';
import './css/header-styles.scss';
import {EdstHeader} from "./components/EdstHeader";
import {Acl} from "./components/edst-windows/Acl";
import {Dep} from "./components/edst-windows/Dep";
import {Status} from "./components/edst-windows/Status";
import {RouteMenu} from "./components/edst-windows/RouteMenu";
import {Outage} from "./components/edst-windows/Outage";
import {AltMenu} from "./components/edst-windows/AltMenu";
import {PlanOptions} from "./components/edst-windows/PlanOptions";
import {SortMenu} from "./components/edst-windows/SortMenu";
import {PlansDisplay} from "./components/edst-windows/PlansDisplay";
import {SpeedMenu} from "./components/edst-windows/SpeedMenu";
import {HeadingMenu} from "./components/edst-windows/HeadingMenu";
import {
  computeBoundaryTime,
  getClosestReferenceFix,
  getRemainingRouteData,
  getRouteDataDistance,
  routeWillEnterAirspace,
  REMOVAL_TIMEOUT
} from "./lib";
import {PreviousRouteMenu} from "./components/edst-windows/PreviousRouteMenu";
import {HoldMenu} from "./components/edst-windows/HoldMenu";
import {CancelHoldMenu} from "./components/edst-windows/CancelHoldMenu";
import {AclContext, DepContext, EdstContext, TooltipContext} from "./contexts/contexts";
import {MessageComposeArea} from "./components/edst-windows/MessageComposeArea";
import {MessageResponseArea} from "./components/edst-windows/MessageResponseArea";
import {TemplateMenu} from "./components/edst-windows/TemplateMenu";
import {AselType, EdstEntryType, PlanDataType} from "./types";
import _ from "lodash";
import {BoundarySelector} from "./components/BoundarySelector";
import {connect} from 'react-redux';
import {RootState} from './redux/store';
import {fetchReferenceFixes, fetchSectorData} from "./redux/asyncActions";
import {AclStateType, addAclCid, deleteAclCid, setAclCidList} from "./redux/reducers/aclReducer";
import {addDepCid, deleteDepCid, DepStateType} from "./redux/reducers/depReducer";
import {SectorDataStateType, setArtccId, setSectorId} from "./redux/reducers/sectorReducer";

const defaultPos = {
  'edst-status': {x: 400, y: 100},
  'edst-outage': {x: 400, y: 100},
  'edst-mca': {x: 100, y: 600},
  'edst-mra': {x: 100, y: 100},
  'edst-template': {x: 100, y: 100}
};

// const CACHE_TIMEOUT = 300000; // ms

const DRAGGING_HIDE_CURSOR = ['edst-status', 'edst-outage', 'edst-mca', 'edst-mra'];
const DISABLED_WINDOWS = ['gpd', 'wx', 'sig', 'not', 'gi', 'ua', 'keep', 'adsb', 'sat', 'msg', 'wind', 'alt', 'fel', 'cpdlc-hist', 'cpdlc-msg-out'];

const initialState = {
  disabledWindows: DISABLED_WINDOWS,
  menu: null,
  spaList: [],
  dragging: false,
  draggingCursorHide: null,
  draggingRef: null,
  dragPreviewStyle: null,
  pos: defaultPos,
  entries: {}, // keys are cid, values are data from db
  asel: null, // {cid, field, ref}
  rel: null,
  planQueue: [],
  inputFocused: false,
  openWindows: new Set<string>(),
  mraMsg: '',
  mcaCommandString: '',
  tooltipsEnabled: true,
  showAllTooltips: false,
  showBoundarySelector: true,
};

export interface State {
  disabledWindows: string[];
  menu: { name: string, refId: string | null } | null;
  spaList: string[];
  dragging: boolean;
  draggingCursorHide: boolean | null;
  draggingRef: any | null;
  dragPreviewStyle: any | null;
  rel: { x: number, y: number } | null;
  pos: { [windowName: string]: { x: number, y: number, w?: number, h?: number } | null };
  entries: { [cid: string]: EdstEntryType }; // keys are cid, values are data from db
  asel: AselType | null; // {cid, field, ref}
  planQueue: Array<PlanDataType>,
  inputFocused: boolean;
  openWindows: Set<string>;
  mraMsg: string;
  mcaCommandString: string;
  tooltipsEnabled: boolean;
  showAllTooltips: boolean;
  showBoundarySelector: boolean;
}

interface Props {
  acl: AclStateType,
  dep: DepStateType,
  sectorData: SectorDataStateType,
  addAclCid: (cid: string) => void,
  addDepCid: (cid: string) => void,
  deleteAclCid: (cid: string) => void,
  deleteDepCid: (cid: string) => void,
  setAclCidList: (cidList: string[], deletedList: string[]) => void,
  setArtccId: (artccId: string) => void,
  setSectorId: (artccId: string) => void,
  fetchSectorData: () => void,
  fetchReferenceFixes: () => void
}

class App extends React.Component<Props, State> {
  private mcaInputRef: React.RefObject<any> | null;
  private readonly outlineRef: React.RefObject<any>;
  private updateIntervalId: any | null;

  constructor(props: Props) {
    super(props);
    this.state = initialState;
    this.mcaInputRef = null;
    this.outlineRef = React.createRef();
  }

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  //   return !Object.is(this.state, nextState);
  // }

  async componentDidMount() {
    let artccId: string;
    let sectorId: string;
    if (process.env.NODE_ENV === 'development') {
      artccId = 'zbw';
      // artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    } else {
      artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    }
    this.props.setArtccId(artccId);
    this.props.setSectorId(sectorId);
    if (Object.keys(this.props.sectorData.sectors).length === 0) {
      this.props.fetchSectorData();
    }
    // if we have no reference fixes for computing FRD, get some
    if (!(this.props.sectorData.referenceFixes.length > 0)) {
      this.props.fetchReferenceFixes();
    }
    await this.refresh();
    this.updateIntervalId = setInterval(this.refresh, 20000); // update loop will run every 20 seconds
  }

  componentWillUnmount() {
    // localStorage.setItem(`vEDST_${this.state.artccId}_${this.state.sectorId}`, JSON.stringify({...this.state,
    // timestamp: new Date().getTime()}));
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
  }

  depFilter = (entry: EdstEntryType) => {
    let depAirportDistance = 0;
    if (entry.dep_info) {
      const pos = [entry.flightplan.lon, entry.flightplan.lat];
      const depPos = [entry.dep_info.lon, entry.dep_info.lat];
      depAirportDistance = distance(point(depPos), point(pos), {units: 'nauticalmiles'});
    }
    const {artccId} = this.props.sectorData;
    return Number(entry.flightplan.ground_speed) < 40
      && entry.dep_info?.artcc?.toLowerCase() === artccId
      && depAirportDistance < 10;
  };

  entryFilter = (entry: EdstEntryType) => {
    const {sectors, selectedSectors} = this.props.sectorData;
    const polygons = selectedSectors ? selectedSectors.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
    const {cidList: aclCidList} = this.props.acl;
    const pos: [number, number] = [entry.flightplan.lon, entry.flightplan.lat];
    const willEnterAirspace = entry._route_data ? routeWillEnterAirspace(entry._route_data.slice(0), polygons, pos) : false;
    return ((entry.boundary_time < 30 || aclCidList.includes(entry.cid))
      && willEnterAirspace
      && Number(entry.flightplan.ground_speed) > 30);
  };

  refreshEntry = (new_entry: EdstEntryType) => {
    const {sectors, selectedSectors} = this.props.sectorData;
    const polygons = selectedSectors ? selectedSectors.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
    const pos: [number, number] = [new_entry.flightplan.lon, new_entry.flightplan.lat];
    let currentEntry: EdstEntryType | any = this.state.entries[new_entry.cid] ?? {
      vciStatus: -1,
      depStatus: -1
    };
    new_entry.boundary_time = computeBoundaryTime(new_entry, polygons);
    const routeFixNames = new_entry.route_data.map(fix => fix.name);
    const dest = new_entry.dest;
    // add departure airport to route_data if we know the coords to compute the distance
    if (new_entry.dest_info && !routeFixNames.includes(dest)) {
      new_entry.route_data.push({
        name: new_entry.dest_info.icao,
        pos: [Number(new_entry.dest_info.lon), Number(new_entry.dest_info.lat)]
      });
    }
    if (!(new_entry.route.slice(-dest.length) === dest)) {
      new_entry.route += new_entry.dest;
    }
    if (currentEntry.route_data === new_entry.route_data) { // if route_data has not changed
      new_entry._route_data = getRouteDataDistance(currentEntry._route_data, pos);
      // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
      if (currentEntry.aar_list.length) {
        new_entry._aar_list = this.processAar(currentEntry, currentEntry.aar_list);
      }
    } else {
      if (new_entry.route_data) {
        new_entry._route_data = getRouteDataDistance(new_entry.route_data, pos);
      }
      // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
      if (currentEntry.aar_list) {
        new_entry._aar_list = this.processAar(currentEntry, currentEntry.aar_list);
      }
    }
    if (new_entry._route_data) {
      _.assign(new_entry, getRemainingRouteData(new_entry.route, new_entry._route_data.slice(0), pos));
    }
    if (new_entry.update_time === currentEntry.update_time
      || (currentEntry._route_data?.[-1]?.dist < 15 && new_entry.dest_info)
      || !(this.entryFilter(new_entry) || this.depFilter(new_entry))) {
      new_entry.pending_removal = currentEntry.pending_removal ?? new Date().getTime();
    } else {
      new_entry.pending_removal = null;
    }
    if (new_entry.remarks.match(/\/v\//gi)) new_entry.voice_type = 'v';
    if (new_entry.remarks.match(/\/r\//gi)) new_entry.voice_type = 'r';
    if (new_entry.remarks.match(/\/t\//gi)) new_entry.voice_type = 't';
    return _.assign(currentEntry, new_entry);
  };

  refresh = async () => {
    let {entries} = this.state;
    const {artccId, referenceFixes} = this.props.sectorData;
    getEdstData()
      .then(response => response.json())
      .then(async new_data => {
          if (new_data) {
            for (let newEntry of new_data) {
              // yes, this is ugly... gotta find something better
              entries[newEntry.cid] = _.assign(entries[newEntry.cid] ?? {}, this.refreshEntry(newEntry));
              const {cidList: aclCidList, deletedList: aclDeletedList} = this.props.acl;
              const {cidList: depCidList, deletedList: depDeletedList} = this.props.dep;
              if (this.depFilter(entries[newEntry.cid]) && !depDeletedList.includes(newEntry.cid)) {
                if (entries[newEntry.cid].aar_list === undefined) {
                  await getAarData(artccId, newEntry.cid)
                    .then(response => response.json())
                    .then(aar_list => {
                      entries[newEntry.cid].aar_list = aar_list;
                      entries[newEntry.cid]._aar_list = this.processAar(entries[newEntry.cid], aar_list);
                    });
                }
                if (!depCidList.includes(newEntry.cid)) {
                  this.props.addDepCid(newEntry.cid);
                }
              } else {
                if (this.entryFilter(entries[newEntry.cid])) {
                  if (entries[newEntry.cid]?.aar_list === undefined) {
                    await getAarData(artccId, newEntry.cid)
                      .then(response => response.json())
                      .then(aar_list => {
                        entries[newEntry.cid].aar_list = aar_list;
                        entries[newEntry.cid]._aar_list = this.processAar(entries[newEntry.cid], aar_list);
                      });
                  }
                  if (!aclCidList.includes(newEntry.cid) && !aclDeletedList.includes(newEntry.cid)) {
                    // remove cid from departure list if will populate the aircraft list
                    this.props.addAclCid(newEntry.cid);
                    this.props.deleteDepCid(newEntry.cid);
                  }
                  if (referenceFixes.length > 0) {
                    entries[newEntry.cid].reference_fix = getClosestReferenceFix(referenceFixes, point([newEntry.flightplan.lon, newEntry.flightplan.lat]));
                  }
                }
              }
              // this.state.entries[newEntry.cid] = entry;
              // this.setState((prevState) => {
              //   return {entries: {...prevState.entries, [newEntry.cid]: entry}}
              // });
            }
          }
        }
      );
  };

  processAar = (entry: EdstEntryType, aar_list: Array<any>) => {
    const {_route_data: currentRouteData, _route: currentRoute} = entry;
    if (!currentRouteData || !currentRoute) {
      return null;
    }
    return aar_list?.map(aar_data => {
      const {route_fixes: routeFixes, amendment} = aar_data;
      const {fix: tfix, info: tfixInfo} = amendment.tfix_details;
      const currentRouteDataFixNames = currentRouteData.map(fix => fix.name);
      // if the current route data does not contain the tfix, this aar will not apply
      if (!currentRouteDataFixNames.includes(tfix)) {
        return null;
      }
      let {route: aarLeadingRouteString, aar_amendment: aarAmendmentRouteString} = amendment;
      let amendedRouteString = aarAmendmentRouteString;
      const currentRouteDataTfixIndex = currentRouteDataFixNames.indexOf(tfix);
      const remainingFixNames = currentRouteDataFixNames.slice(0, currentRouteDataTfixIndex)
        .concat(routeFixes.slice(routeFixes.indexOf(tfix)));
      if (tfixInfo === 'Prepend') {
        aarAmendmentRouteString = tfix + aarAmendmentRouteString;
      }
      // if current route contains the tfix, append the aar amendment after the tfix
      if (currentRoute.includes(tfix)) {
        amendedRouteString = currentRoute.slice(0, currentRoute.indexOf(tfix)) + aarAmendmentRouteString;
      } else {
        // if current route does not contain the tfix, append the amendment after the first common segment, e.g. airway
        const firstCommonSegment = currentRoute.split(/\.+/).filter(segment => amendedRouteString?.includes(segment))?.[0];
        if (!firstCommonSegment) {
          return null;
        }
        amendedRouteString = currentRoute.slice(0, currentRoute.indexOf(firstCommonSegment) + firstCommonSegment.length)
          + aarLeadingRouteString.slice(aarLeadingRouteString.indexOf(firstCommonSegment) + firstCommonSegment.length);
        if (!amendedRouteString.includes(firstCommonSegment)) {
          amendedRouteString = firstCommonSegment + amendedRouteString;
        }
      }
      if (!amendedRouteString) {
        return null;
      }
      return {
        aar: true,
        aar_amendment_route_string: aarAmendmentRouteString,
        amended_route: amendedRouteString,
        amended_route_fix_names: remainingFixNames,
        dest: entry.dest,
        tfix: tfix,
        tfix_info: tfixInfo,
        eligible: amendment.eligible,
        onEligibleAar: amendment.eligible && currentRoute.includes(aarAmendmentRouteString),
        aar_data: aar_data
      };
    }).filter(aar_data => aar_data);
  };

  deleteEntry = (window: string, cid: string) => {
    switch (window) {
      case 'acl':
        this.props.deleteAclCid(cid);
        break;
      case 'dep':
        this.props.deleteDepCid(cid);
        break;
      default:
        break;
    }
  };

  trialPlan = (p: PlanDataType) => {
    let {planQueue, openWindows} = this.state;
    planQueue.unshift(p);
    openWindows.add('plans');
    this.setState({openWindows: openWindows, planQueue: planQueue});
  };

  // removeTrialPlan = (index) => {
  //   let {plan_queue} = this.state;
  //   plan_queue.splice(index);
  //   this.setState({plan_queue: plan_queue});
  // }

  // swapSpaEntries = (cid_1, cid_2) => {
  //   let {spa_list, entries} = this.state;
  //   const index_1 = spa_list.indexOf(cid_1)
  //   const index_2 = spa_list.indexOf(cid_2)
  //   if (index_1 > 0 && index_2 > 0) {
  //     spa_list[index_1] = cid_2;
  //     spa_list[index_2] = cid_1;
  //     entries[cid_1].spa = index_2;
  //     entries[cid_2].spa = index_1;
  //   }
  //   this.setState((prevState: any) => {
  //     return {
  //       entries: {...prevState.entries}, [cid_1]: entries[cid_1], [cid_2]: entries[cid_2],
  //       spa_list: spa_list
  //     };
  //   });
  // }

  updateEntry = (cid: string, data: any) => {
    let {spaList, entries} = this.state;
    let entry = entries[cid];
    if (data?.spa === true) {
      if (!spaList.includes(cid)) {
        spaList.push(cid);
      }
      data.spa = spaList.indexOf(cid);
    }
    if (data?.spa === false) {
      const index = spaList.indexOf(cid);
      if (index > -1) {
        spaList.splice(index, 1);
      }
    }
    this.setState(({entries}) => {
      return {entries: {...entries, [cid]: _.assign(entry, data)}};
    });
  };

  addEntry = (window: string | null, fid: string) => {
    let {entries} = this.state;
    let entry = Object.values(entries ?? {})?.find(e => String(e?.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid);
    if (window === null && entry) {
      if (this.depFilter(entry)) {
        this.addEntry('dep', fid);
      } else {
        this.addEntry('acl', fid);
      }
    } else if (entry && (window === 'acl' || window === 'dep')) {
      if (window === 'acl') {
        this.props.addAclCid(entry.cid);
      } else {
        this.props.addDepCid(entry.cid);
      }
      const asel = {cid: entry.cid, field: 'fid', window: window};
      this.setState({
        asel: asel
      });
      // this.updateEntry(entry.cid, window === 'acl' ? {aclHighlighted: true} : {depHighlighted: true});
    }
  };

  amendEntry = async (cid: string, plan_data: any) => {
    let {entries} = this.state;
    const {artccId} = this.props.sectorData;
    const {cidList: depCidList} = this.props.dep;
    let currentEntry = entries[cid];
    if (Object.keys(plan_data).includes('altitude')) {
      plan_data.interim = null;
    }
    if (Object.keys(plan_data).includes('route')) {
      const dest = currentEntry.dest;
      if (plan_data.route.slice(-dest.length) === dest) {
        plan_data.route = plan_data.route.slice(0, -dest.length);
      }
      plan_data.previous_route = depCidList.includes(cid) ? currentEntry?.route : currentEntry?._route;
      plan_data.previous_route_data = depCidList.includes(cid) ? currentEntry?.route_data : currentEntry?._route_data;
    }
    plan_data.callsign = currentEntry.callsign;
    if (plan_data.scratch_hdg !== undefined) currentEntry.scratch_hdg = plan_data.scratch_hdg;
    if (plan_data.scratch_spd !== undefined) currentEntry.scratch_spd = plan_data.scratch_spd;
    await updateEdstEntry(plan_data)
      .then(response => response.json())
      .then(async updated_entry => {
        if (updated_entry) {
          _.assign(currentEntry, this.refreshEntry(updated_entry));
          currentEntry.pending_removal = null;
          await getAarData(artccId, currentEntry.cid)
            .then(response => response.json())
            .then(aar_list => {
              currentEntry.aar_list = aar_list;
              currentEntry._aar_list = this.processAar(currentEntry, aar_list);
            });
          this.setState(({entries}) => {
            return {
              entries: {...entries, [cid]: currentEntry}
            };
          });
        }
      });
  };

  aircraftSelect = (event: any & Event, window: string | null, cid: string, field: string) => {
    let {asel, entries} = this.state;
    if (asel?.cid === cid && asel?.field === field && asel?.window === window) {
      this.setState({menu: null, asel: null});
    } else {
      const entry = entries[cid];
      asel = {cid: cid, field: field, window: window};
      if (window === 'acl' && !this.props.acl.manualPosting && field === 'fid-2' && entries[cid]?.vciStatus === -1) {
        this.updateEntry(cid, {vciStatus: 0});
      }
      if (window === 'dep' && !this.props.dep.manualPosting && field === 'fid-2' && entries[cid]?.depStatus === -1) {
        this.updateEntry(cid, {depStatus: 0});
      }
      this.setState({menu: null, asel: asel});
      switch (field) {
        case 'alt':
          this.openMenu(event.target, 'alt-menu', false, asel);
          break;
        case 'route':
          if (entry.aclRouteDisplay === 'hold_data') {
            this.openMenu(event.target, 'hold-menu', false, asel);
          } else {
            this.openMenu(event.target, 'route-menu', false, asel);
          }
          break;
        case 'spd':
          this.openMenu(event.target, 'speed-menu', false, asel);
          break;
        case 'hdg':
          this.openMenu(event.target, 'heading-menu', false, asel);
          break;
        case 'hold':
          this.openMenu(event.target, 'hold-menu', false, asel);
          break;
        case 'cancel-hold':
          this.openMenu(event.target, 'cancel-hold-menu', false, asel);
          break;
        default:
          break;
      }
    }
  };

  toggleWindow = (name: string) => {
    let {openWindows} = this.state;
    if (openWindows.has(name)) {
      openWindows.delete(name);
    } else {
      openWindows.add(name);
    }
    this.setState({openWindows: openWindows});
  };

  openWindow = (name: string) => {
    let {openWindows} = this.state;
    openWindows.add(name);
    this.setState({openWindows: openWindows});
  };

  closeWindow = (name: string) => {
    let {openWindows} = this.state;
    openWindows.delete(name);
    this.setState({openWindows: openWindows});
  };

  openMenu = (ref: EventTarget | any, name: string, plan: boolean = false, asel?: AselType) => {
    const {x, y, height, width} = ref.getBoundingClientRect();
    let {pos} = this.state;
    switch (name) {
      case 'alt-menu':
        pos[name] = {
          x: x + (plan ? 0 : width),
          y: plan ? ref.offsetTop : y - 76,
          w: width,
          h: height
        };
        break;
      case 'route-menu':
        pos[name] = (asel?.window !== 'dep') ? {
          x: x - (plan ? 0 : 569),
          y: plan ? ref.offsetTop : y - 3*height,
          w: width,
          h: height
        } : {
          x: x - 1,
          y: 200,
          w: width,
          h: height
        };
        break;
      case 'prev-route-menu':
        pos[name] = {
          x: x,
          y: plan ? ref.offsetTop : y - 2*height,
          w: width,
          h: height
        };
        break;
      case 'speed-menu':
        pos[name] = {
          x: x + width,
          y: 200,
          w: width,
          h: height
        };
        break;
      case 'heading-menu':
        pos[name] = {
          x: x + width,
          y: 200,
          w: width,
          h: height
        };
        break;
      default:
        pos[name] = {
          x: ref.offsetLeft,
          y: ref.offsetTop + ref.offsetHeight
        };
    }
    this.setState({pos: pos, menu: {name: name, refId: ref?.id}});
  };

  closeMenu = (name: string) => {
    this.setState((prevState: State) => {
      return {pos: {...prevState.pos, [name]: null}, menu: null};
    });
  };

  startDrag = (event: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<any>) => {
    const {pos} = this.state;
    const rel = {x: event.pageX, y: event.pageY};
    const relX = event.pageX - rel.x;
    const relY = event.pageY - rel.y;
    const ppos = pos[ref.current.id];
    if (!ppos) {
      return;
    }
    const style = {
      left: ppos?.x + relX,
      top: ppos?.y + relY,
      position: "absolute",
      zIndex: 999,
      height: ref.current.clientHeight,
      width: ref.current.clientWidth
    };
    this.outlineRef.current.addEventListener('mousemove', this.draggingHandler);
    this.setState({
      draggingRef: ref,
      dragging: true,
      rel: rel,
      dragPreviewStyle: style,
      draggingCursorHide: DRAGGING_HIDE_CURSOR.includes(ref.current.id)
    });
  };

  setPos = (key: string, x: number, y: number) => {
    this.setState((prevState) => {
      return {pos: {...prevState.pos, [key]: {x: x, y: y}}};
    });
  };

  draggingHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    const {rel, draggingRef, pos, dragging} = this.state;
    if (dragging && rel) {
      const relX = event.pageX - rel.x;
      const relY = event.pageY - rel.y;
      const ppos = pos[draggingRef.current.id];
      if (!ppos) {
        return;
      }
      this.setState({
        dragPreviewStyle: {
          left: ppos.x + relX,
          top: ppos.y + relY,
          position: "absolute",
          zIndex: 999,
          height: draggingRef.current.clientHeight,
          width: draggingRef.current.clientWidth
        }
      });
    }
  };

  stopDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const {rel, draggingRef, pos, dragging} = this.state;
    if (dragging && rel) {
      const relX = event.pageX - rel.x;
      const relY = event.pageY - rel.y;
      const ppos = pos[draggingRef.current.id];
      if (!ppos) {
        return;
      }
      pos[draggingRef.current.id] = {x: ppos.x + relX, y: ppos.y + relY};
      this.setState({
        draggingRef: null,
        dragging: false,
        rel: null,
        dragPreviewStyle: null,
        draggingCursorHide: false,
        pos: pos
      });
    }
  };

  unmount = () => {
    this.setState({asel: null, menu: null, inputFocused: false});
  };

  aclCleanup = () => {
    let {entries} = this.state;
    const {cidList, deletedList} = this.props.acl;
    const now = new Date().getTime();
    let aclCidListCopy, aclDeletedListCopy;
    const pendingRemovalCidList = cidList.filter(cid => (now - (entries[cid]?.pending_removal ?? now) > REMOVAL_TIMEOUT));

    aclCidListCopy = _.difference(cidList, pendingRemovalCidList);
    aclDeletedListCopy = deletedList.concat(pendingRemovalCidList);
    this.props.setAclCidList(aclCidListCopy, aclDeletedListCopy);
  };

  setMraMessage = (msg: string) => {
    let {openWindows} = this.state;
    openWindows.add('mra');
    this.setState({mraMsg: msg, openWindows: openWindows});
  };


  handleKeyDownCapture = (event: React.KeyboardEvent) => {
    event.preventDefault();
    if (event.key.match(/(\w|\s|\d|\/)/gi) && event.key.length === 1) {
      this.setState({mcaCommandString: this.state.mcaCommandString + event.key.toUpperCase()});
    }
    if (this.mcaInputRef === null) {
      this.openWindow('mca');
    } else {
      this.mcaInputRef.current.focus();
    }
  };

  setBoundarySelectorEnabled = (bool: boolean) => {
    this.setState({showBoundarySelector: bool});
  };

  render() {
    const {
      entries,
      asel,
      disabledWindows,
      planQueue,
      menu,
      pos,
      dragPreviewStyle,
      dragging,
      draggingCursorHide,
      inputFocused,
      openWindows,
      mraMsg,
      mcaCommandString,
      tooltipsEnabled,
      showAllTooltips,
      showBoundarySelector
    } = this.state;

    return (
      <div className="edst"
           onContextMenu={(event) => process.env.NODE_ENV !== 'development' && event.preventDefault()}
           tabIndex={!(inputFocused || menu?.name === 'alt-menu') ? -1 : 0}
           onKeyDownCapture={(e) => !inputFocused && this.handleKeyDownCapture(e)}
      >
        <TooltipContext.Provider
          value={{globalTooltipsEnabled: tooltipsEnabled, showAllTooltips: showAllTooltips}}>
          <EdstHeader openWindows={openWindows}
                      disabledWindows={disabledWindows}
                      openWindow={this.openWindow}
                      toggleWindow={this.toggleWindow}
                      planDisabled={planQueue.length === 0}
          />
          <div className={`edst-body ${draggingCursorHide ? 'hide-cursor' : ''}`}
               ref={this.outlineRef}
               onMouseDown={(e) => (dragging && e.button === 0 && this.stopDrag(e))}
          >
            {showBoundarySelector && <BoundarySelector
              toggle={this.setBoundarySelectorEnabled}
            />}
            <div className="edst-dragging-outline" style={dragPreviewStyle ?? {display: 'none'}}
                 onMouseUp={(e) => !draggingCursorHide && this.stopDrag(e)}
            >
              {draggingCursorHide && <div className="cursor"/>}
            </div>
            <EdstContext.Provider value={{
              entries: entries,
              asel: asel,
              planQueue: planQueue,
              menu: menu,
              unmount: this.unmount,
              openMenu: this.openMenu,
              closeMenu: this.closeMenu,
              updateEntry: this.updateEntry,
              amendEntry: this.amendEntry,
              addEntry: this.addEntry,
              deleteEntry: this.deleteEntry,
              trialPlan: this.trialPlan,
              aircraftSelect: this.aircraftSelect,
              openWindow: this.openWindow,
              closeWindow: this.closeWindow,
              startDrag: this.startDrag,
              stopDrag: this.stopDrag,
              dragging: dragging,
              setMcaInputRef: (ref: React.RefObject<any> | null) => this.mcaInputRef = ref,
              setInputFocused: (v: boolean) => this.setState({inputFocused: v}),
              setMraMessage: this.setMraMessage
            }}>
              <AclContext.Provider value={{
                addEntry: (fid: string) => this.addEntry('acl', fid),
                asel: asel?.window === 'acl' ? asel : null
              }}>
                {openWindows.has('acl') && <Acl
                  cleanup={this.aclCleanup}
                  unmount={this.unmount}
                  // z_index={open_windows.indexOf('acl')}
                  closeWindow={() => this.closeWindow('acl')}
                />}
              </AclContext.Provider>
              <DepContext.Provider value={{
                asel: asel?.window === 'dep' ? asel : null,
                addEntry: (fid) => this.addEntry('dep', fid)
              }}>
                {openWindows.has('dep') && <Dep
                  unmount={this.unmount}
                  // z_index={open_windows.indexOf('dep')}
                  closeWindow={() => this.closeWindow('dep')}
                />}
              </DepContext.Provider>
              {openWindows.has('plans') && planQueue.length > 0 && <PlansDisplay
                unmount={this.unmount}
                asel={asel?.window === 'plans' ? asel : null}
                cleanup={() => this.setState({planQueue: []})}
                plan_queue={planQueue}
                // z_index={open_windows.indexOf('dep')}
                closeWindow={() => this.closeWindow('plans')}
              />}
              {openWindows.has('status') && pos['edst-status'] && <Status
                pos={pos['edst-status']}
                // z_index={open_windows.indexOf('status')}
                closeWindow={() => this.closeWindow('status')}
              />}
              {openWindows.has('outage') && pos['edst-outage'] && <Outage
                pos={pos['edst-outage']}
                // z_index={open_windows.indexOf('status')}
                closeWindow={() => this.closeWindow('outage')}
              />}
              {menu?.name === 'plan-menu' && pos['plan-menu'] && asel && <PlanOptions
                asel={asel}
                pos={pos['plan-menu']}
                // z_index={open_windows.indexOf('route-menu')}
                clearAsel={() => this.setState({asel: null})}
                closeWindow={() => this.closeMenu('plan-menu')}
              />}
              {menu?.name === 'sort-menu' && pos['sort-menu'] && <SortMenu
                ref_id={menu?.refId}
                pos={pos['sort-menu']}
                // z_index={open_windows.indexOf('route-menu')}
                closeWindow={() => this.closeMenu('sort-menu')}
              />}
              {menu?.name === 'route-menu' && pos['route-menu'] && asel && <RouteMenu
                asel={asel}
                pos={pos['route-menu']}
                closeWindow={() => this.closeMenu('route-menu')}
              />}
              {menu?.name === 'template-menu' && pos['template-menu'] && <TemplateMenu
                pos={pos['template-menu']}
                closeWindow={() => this.closeMenu('template-menu')}
              />}
              {menu?.name === 'hold-menu' && pos['hold-menu'] && asel && <HoldMenu
                asel={asel}
                pos={pos['hold-menu']}
                closeWindow={() => this.closeMenu('hold-menu')}
              />}
              {menu?.name === 'cancel-hold-menu' && pos['cancel-hold-menu'] && asel && <CancelHoldMenu
                asel={asel}
                pos={pos['cancel-hold-menu']}
                closeWindow={() => this.closeMenu('cancel-hold-menu')}
              />}
              {menu?.name === 'prev-route-menu' && pos['prev-route-menu'] && asel && <PreviousRouteMenu
                asel={asel}
                pos={pos['prev-route-menu']}
                closeWindow={() => this.closeMenu('prev-route-menu')}
              />}
              {menu?.name === 'alt-menu' && pos['alt-menu'] && asel && <AltMenu
                asel={asel}
                pos={pos['alt-menu']}
                closeWindow={() => this.closeMenu('alt-menu')}
              />}
              {menu?.name === 'speed-menu' && pos['speed-menu'] && asel && <SpeedMenu
                asel={asel}
                pos={pos['speed-menu']}
                closeWindow={() => this.closeMenu('speed-menu')}
              />}
              {menu?.name === 'heading-menu' && pos['heading-menu'] && asel && <HeadingMenu
                asel={asel}
                pos={pos['heading-menu']}
                closeWindow={() => this.closeMenu('heading-menu')}
              />}
              {openWindows.has('mca') && pos['edst-mca'] && <MessageComposeArea
                pos={pos['edst-mca']}
                mca_command_string={mcaCommandString}
                setMcaCommandString={(s: string) => this.setState({mcaCommandString: s})}
                aclCleanup={this.aclCleanup}
                closeAllWindows={() => this.setState({openWindows: new Set(['mca'])})}
              />}
              {openWindows.has('mra') && pos['edst-mra'] && <MessageResponseArea
                pos={pos['edst-mra']}
                msg={mraMsg}
              />}
            </EdstContext.Provider>
          </div>
        </TooltipContext.Provider>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({...state});

const mapDispatchToProps = (dispatch: any) => ({
  addAclCid: (cid: string) => dispatch(addAclCid(cid)),
  deleteAclCid: (cid: string) => dispatch(deleteAclCid(cid)),
  addDepCid: (cid: string) => dispatch(addDepCid(cid)),
  deleteDepCid: (cid: string) => dispatch(deleteDepCid(cid)),
  setAclCidList: (cidList: string[], deletedList: string[]) => dispatch(setAclCidList({cidList: cidList, deletedList: deletedList})),
  setArtccId: (id: string) => dispatch(setArtccId(id)),
  setSectorId: (id: string) => dispatch(setSectorId(id)),
  fetchSectorData: () => dispatch(fetchSectorData),
  fetchReferenceFixes: () => dispatch(fetchReferenceFixes)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
