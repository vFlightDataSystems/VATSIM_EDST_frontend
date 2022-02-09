import React from 'react';

import {distance, Feature, point, Polygon, polygon} from '@turf/turf';

import {getAarData, getBoundaryData, getEdstData, getReferenceFixes, updateEdstEntry} from "./api";
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
import {AselType, EdstEntryType, PlanDataType, SectorDataType} from "./types";
import _ from "lodash";
import {BoundarySelector} from "./components/BoundarySelector";
import {connect} from 'react-redux';
import {RootState} from './redux/store';
import {addAclCid, addDepCid, deleteAclCid, deleteDepCid, setAclCidList} from './redux/actions';

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
  referenceFixes: [],
  disabledWindows: DISABLED_WINDOWS,
  artccId: '',
  sectorId: '',
  boundaryPolygons: [],
  allBoundaries: [],
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
  boundaryIds: [],
  showBoundarySelector: true,
  selectedBoundaryIds: new Set<string>()
};

export interface State {
  referenceFixes: Array<any>;
  disabledWindows: string[];
  artccId: string;
  sectorId: string;
  boundaryPolygons: Array<Feature<Polygon>>;
  allBoundaries: Array<any>;
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
  boundaryIds: string[];
  selectedBoundaryIds: Set<string>;
  showBoundarySelector: boolean;
}

interface Props {
  aclCidList: string[],
  depCidList: string[],
  aclDeletedList: string[],
  depDeletedList: string[],
  manualPostingAcl: boolean,
  manualPostingDep: boolean,
  addAclCid: (cid: string) => void,
  addDepCid: (cid: string) => void,
  deleteAclCid: (cid: string) => void,
  deleteDepCid: (cid: string) => void,
  setAclCidList: (cidList: string[], deletedList: string[]) => void
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
      if (!(this.state.boundaryPolygons.length > 0)) {
        await getBoundaryData(artccId)
          .then(response => response.json())
          .then(geo_data => {
            this.setState({boundaryIds: geo_data.map((boundary_id: any) => boundary_id.properties.id)});
            this.setState({allBoundaries: geo_data.map((sector_boundary: any) => sector_boundary)});
            this.setState({boundaryPolygons: geo_data.map((sector_data: SectorDataType) => polygon(sector_data.geometry.coordinates, sector_data.properties))});
          });
        // this.changeBoundarySelectorShown(false);
      }
    } else {
      artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
      if (!(this.state.boundaryPolygons.length > 0)) {
        await getBoundaryData(artccId)
          .then(response => response.json())
          .then(geoData => {
            this.setState({boundaryIds: geoData.map((boundaryId: { properties: { id: string } }) => boundaryId.properties.id)});
            this.setState({allBoundaries: geoData.map((sectorBoundary: { properties: Array<any> }) => sectorBoundary)});
            //this.setState({boundary_polygons: geoData.map((sector_data: SectorDataProps) => polygon(sector_data.geometry.coordinates, sector_data.properties))});
          });
      }
    }

    // const now = new Date().getTime();
    // let local_data = JSON.parse(localStorage.getItem(`vEDST_${artccId}_${sectorId}`));
    // if (now - local_data?.timestamp < CACHE_TIMEOUT) {
    //   local_data.open_windows = new Set(local_data.open_windows[Symbol.iterator] ?? []);
    //   local_data.aclCidList = new Set(local_data.aclCidList[Symbol.iterator] ?? []);
    //   local_data.depCidList = new Set(local_data.depCidList[Symbol.iterator] ?? []);
    //   local_data.acl_deletedList = new Set(local_data.acl_deletedList[Symbol.iterator] ?? []);
    //   local_data.dep_deletedList = new Set(local_data.dep_deletedList[Symbol.iterator] ?? []);
    //   this.setState(local_data ?? {});
    // }
    this.setState({artccId: artccId, sectorId: sectorId});
    // if (!(this.state.boundary_polygons.length > 0)) {
    //   await getBoundaryData(artccId)
    //     .then(response => response.json())
    //     .then(geo_data => {
    //       this.setState({boundary_ids: geo_data.map(boundary_id => boundary_id.properties.id)});
    //       this.setState({all_boundaries: geo_data.map(sector_boundary => sector_boundary)});
    //       //this.setState({boundary_polygons: geo_data.map((sector_data: SectorDataProps) => polygon(sector_data.geometry.coordinates, sector_data.properties))});
    //     });
    // }
    // if we have no reference fixes for computing FRD, get some
    if (!(this.state.referenceFixes.length > 0)) {
      await getReferenceFixes(artccId)
        .then(response => response.json())
        .then(reference_fixes => {
          if (reference_fixes) {
            this.setState({referenceFixes: reference_fixes});
          }
        });
    }
    await this.refresh();
    this.updateIntervalId = setInterval(this.refresh, 20000); // update loop will run every 20 seconds
  }

  componentWillUnmount() {
    // localStorage.setItem(`vEDST_${this.state.artccId}_${this.state.sectorId}`, JSON.stringify({...this.state, timestamp: new Date().getTime()}));
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
  }

  depFilter = (entry: EdstEntryType) => {
    let depAirportDistance = 0;
    if (entry.dep_info) {
      const pos = [entry.flightplan.lon, entry.flightplan.lat];
      const dep_pos = [entry.dep_info.lon, entry.dep_info.lat];
      depAirportDistance = distance(point(dep_pos), point(pos), {units: 'nauticalmiles'});
    }
    const {artccId} = this.state;
    return Number(entry.flightplan.ground_speed) < 40
      && entry.dep_info?.artcc?.toLowerCase() === artccId
      && depAirportDistance < 10;
  };

  entryFilter = (entry: EdstEntryType) => {
    const {boundaryPolygons} = this.state;
    const {aclCidList} = this.props;
    const pos: [number, number] = [entry.flightplan.lon, entry.flightplan.lat];
    const will_enter_airspace = entry._route_data ? routeWillEnterAirspace(entry._route_data.slice(0), boundaryPolygons, pos) : false;
    return ((entry.boundary_time < 30 || aclCidList.includes(entry.cid))
      && will_enter_airspace
      && Number(entry.flightplan.ground_speed) > 30);
  };

  refreshEntry = (new_entry: EdstEntryType) => {
    const pos: [number, number] = [new_entry.flightplan.lon, new_entry.flightplan.lat];
    let current_entry: EdstEntryType | any = this.state.entries[new_entry.cid] ?? {
      vciStatus: -1,
      depStatus: -1
    };
    new_entry.boundary_time = computeBoundaryTime(new_entry, this.state.boundaryPolygons);
    const route_fix_names = new_entry.route_data.map(fix => fix.name);
    const dest = new_entry.dest;
    // add departure airport to route_data if we know the coords to compute the distance
    if (new_entry.dest_info && !route_fix_names.includes(dest)) {
      new_entry.route_data.push({
        name: new_entry.dest_info.icao,
        pos: [Number(new_entry.dest_info.lon), Number(new_entry.dest_info.lat)]
      });
    }
    if (!(new_entry.route.slice(-dest.length) === dest)) {
      new_entry.route += new_entry.dest;
    }
    if (current_entry.route_data === new_entry.route_data) { // if route_data has not changed
      new_entry._route_data = getRouteDataDistance(current_entry._route_data, pos);
      // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
      if (current_entry.aar_list.length) {
        new_entry._aar_list = this.processAar(current_entry, current_entry.aar_list);
      }
    } else {
      if (new_entry.route_data) {
        new_entry._route_data = getRouteDataDistance(new_entry.route_data, pos);
      }
      // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
      if (current_entry.aar_list) {
        new_entry._aar_list = this.processAar(current_entry, current_entry.aar_list);
      }
    }
    if (new_entry._route_data) {
      _.assign(new_entry, getRemainingRouteData(new_entry.route, new_entry._route_data.slice(0), pos));
    }
    if (new_entry.update_time === current_entry.update_time
      || (current_entry._route_data?.[-1]?.dist < 15 && new_entry.dest_info)
      || !(this.entryFilter(new_entry) || this.depFilter(new_entry))) {
      new_entry.pending_removal = current_entry.pending_removal ?? new Date().getTime();
    } else {
      new_entry.pending_removal = null;
    }
    if (new_entry.remarks.match(/\/v\//gi)) new_entry.voice_type = 'v';
    if (new_entry.remarks.match(/\/r\//gi)) new_entry.voice_type = 'r';
    if (new_entry.remarks.match(/\/t\//gi)) new_entry.voice_type = 't';
    return _.assign(current_entry, new_entry);
  };

  refresh = async () => {
    let {artccId, referenceFixes, entries} = this.state;
    getEdstData()
      .then(response => response.json())
      .then(async new_data => {
          if (new_data) {
            for (let new_entry of new_data) {
              // yes, this is ugly... gotta find something better
              entries[new_entry.cid] = _.assign(entries[new_entry.cid] ?? {}, this.refreshEntry(new_entry));
              let {aclCidList, aclDeletedList, depCidList, depDeletedList} = this.props;
              if (this.depFilter(entries[new_entry.cid]) && !depDeletedList.includes(new_entry.cid)) {
                if (entries[new_entry.cid].aar_list === undefined) {
                  await getAarData(artccId, new_entry.cid)
                    .then(response => response.json())
                    .then(aar_list => {
                      entries[new_entry.cid].aar_list = aar_list;
                      entries[new_entry.cid]._aar_list = this.processAar(entries[new_entry.cid], aar_list);
                    });
                }
                if (!depCidList.includes(new_entry.cid)) {
                  this.props.addDepCid(new_entry.cid);
                }
              } else {
                if (this.entryFilter(entries[new_entry.cid])) {
                  if (entries[new_entry.cid]?.aar_list === undefined) {
                    await getAarData(artccId, new_entry.cid)
                      .then(response => response.json())
                      .then(aar_list => {
                        entries[new_entry.cid].aar_list = aar_list;
                        entries[new_entry.cid]._aar_list = this.processAar(entries[new_entry.cid], aar_list);
                      });
                  }
                  if (!aclCidList.includes(new_entry.cid) && !aclDeletedList.includes(new_entry.cid)) {
                    // remove cid from departure list if will populate the aircraft list
                    this.props.addAclCid(new_entry.cid);
                    this.props.deleteDepCid(new_entry.cid);
                  }
                  if (referenceFixes.length > 0) {
                    entries[new_entry.cid].reference_fix = getClosestReferenceFix(referenceFixes, point([new_entry.flightplan.lon, new_entry.flightplan.lat]));
                  }
                }
              }
              // this.state.entries[new_entry.cid] = entry;
              // this.setState((prevState) => {
              //   return {entries: {...prevState.entries, [new_entry.cid]: entry}}
              // });
            }
          }
        }
      );
  };

  processAar = (entry: EdstEntryType, aar_list: Array<any>) => {
    const {_route_data: current_route_data, _route: current_route} = entry;
    if (!current_route_data || !current_route) {
      return null;
    }
    return aar_list?.map(aar_data => {
      const {route_fixes, amendment} = aar_data;
      const {fix: tfix, info: tfix_info} = amendment.tfix_details;
      const current_route_data_fix_names = current_route_data.map(fix => fix.name);
      // if the current route data does not contain the tfix, this aar will not apply
      if (!current_route_data_fix_names.includes(tfix)) {
        return null;
      }
      let {route: aar_leading_route_string, aar_amendment: aar_amendment_route_string} = amendment;
      let amended_route_string = aar_amendment_route_string;
      const current_route_data_tfix_index = current_route_data_fix_names.indexOf(tfix);
      const remaining_fix_names = current_route_data_fix_names.slice(0, current_route_data_tfix_index)
        .concat(route_fixes.slice(route_fixes.indexOf(tfix)));
      if (tfix_info === 'Prepend') {
        aar_amendment_route_string = tfix + aar_amendment_route_string;
      }
      // if current route contains the tfix, append the aar amendment after the tfix
      if (current_route.includes(tfix)) {
        amended_route_string = current_route.slice(0, current_route.indexOf(tfix)) + aar_amendment_route_string;
      } else {
        // if current route does not contain the tfix, append the amendment after the first common segment, e.g. airway
        const first_common_segment = current_route.split(/\.+/).filter(segment => amended_route_string?.includes(segment))?.[0];
        if (!first_common_segment) {
          return null;
        }
        amended_route_string = current_route.slice(0, current_route.indexOf(first_common_segment) + first_common_segment.length)
          + aar_leading_route_string.slice(aar_leading_route_string.indexOf(first_common_segment) + first_common_segment.length);
        if (!amended_route_string.includes(first_common_segment)) {
          amended_route_string = first_common_segment + amended_route_string;
        }
      }
      if (!amended_route_string) {
        return null;
      }
      return {
        aar: true,
        aar_amendment_route_string: aar_amendment_route_string,
        amended_route: amended_route_string,
        amended_route_fix_names: remaining_fix_names,
        dest: entry.dest,
        tfix: tfix,
        tfix_info: tfix_info,
        eligible: amendment.eligible,
        on_eligibleAar: amendment.eligible && current_route.includes(aar_amendment_route_string),
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
    let {entries, artccId} = this.state;
    const {depCidList} = this.props;
    let current_entry = entries[cid];
    if (Object.keys(plan_data).includes('altitude')) {
      plan_data.interim = null;
    }
    if (Object.keys(plan_data).includes('route')) {
      const dest = current_entry.dest;
      if (plan_data.route.slice(-dest.length) === dest) {
        plan_data.route = plan_data.route.slice(0, -dest.length);
      }
      plan_data.previous_route = depCidList.includes(cid) ? current_entry?.route : current_entry?._route;
      plan_data.previous_route_data = depCidList.includes(cid) ? current_entry?.route_data : current_entry?._route_data;
    }
    plan_data.callsign = current_entry.callsign;
    if (plan_data.scratch_hdg !== undefined) current_entry.scratch_hdg = plan_data.scratch_hdg;
    if (plan_data.scratch_spd !== undefined) current_entry.scratch_spd = plan_data.scratch_spd;
    await updateEdstEntry(plan_data)
      .then(response => response.json())
      .then(async updated_entry => {
        if (updated_entry) {
          _.assign(current_entry, this.refreshEntry(updated_entry));
          current_entry.pending_removal = null;
          await getAarData(artccId, current_entry.cid)
            .then(response => response.json())
            .then(aar_list => {
              current_entry.aar_list = aar_list;
              current_entry._aar_list = this.processAar(current_entry, aar_list);
            });
          this.setState(({entries}) => {
            return {
              entries: {...entries, [cid]: current_entry}
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
      if (window === 'acl' && !this.props.manualPostingAcl && field === 'fid-2' && entries[cid]?.vciStatus === -1) {
        this.updateEntry(cid, {vciStatus: 0});
      }
      if (window === 'dep' && !this.props.manualPostingDep && field === 'fid-2' && entries[cid]?.depStatus === -1) {
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
          y: plan ? ref.offsetTop : y - 3 * height,
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
          y: plan ? ref.offsetTop : y - 2 * height,
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
    const {aclCidList, aclDeletedList} = this.props;
    const now = new Date().getTime();
    let aclCidList_copy, acl_deletedList_copy;
    const cid_pending_removal_list = aclCidList.filter(cid => (now - (entries[cid]?.pending_removal ?? now) > REMOVAL_TIMEOUT));

    aclCidList_copy = _.difference(aclCidList, cid_pending_removal_list);
    acl_deletedList_copy = aclDeletedList.concat(cid_pending_removal_list);
    this.props.setAclCidList(aclCidList_copy, acl_deletedList_copy);
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

  updateSelectedBoundaries = (label: string) => {
    if (this.state.selectedBoundaryIds.has(label)) {
      this.state.selectedBoundaryIds.delete(label);
    } else {
      this.state.selectedBoundaryIds.add(label);
    }
  };

  updateBoundaryPolygons = () => {
    this.setState({
      boundaryPolygons: this.state.allBoundaries.filter(
        id => this.state.selectedBoundaryIds.has(id.properties.id))
        .map(coordinates => polygon(coordinates.geometry.coordinates))
    });
  };


  render() {
    const {
      entries,
      asel,
      disabledWindows,
      planQueue,
      sectorId,
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
      boundaryIds,
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
          <EdstHeader open_windows={openWindows}
                      disabled_windows={disabledWindows}
                      openWindow={this.openWindow}
                      toggleWindow={this.toggleWindow}
                      plan_disabled={planQueue.length === 0}
                      sectorId={sectorId}
          />
          <div className={`edst-body ${draggingCursorHide ? 'hide-cursor' : ''}`}
               ref={this.outlineRef}
               onMouseDown={(e) => (dragging && e.button === 0 && this.stopDrag(e))}
          >
            {showBoundarySelector && <BoundarySelector
              boundary_ids={boundaryIds}
              toggle={this.setBoundarySelectorEnabled}
              updateSelected={this.updateSelectedBoundaries}
              updatePolygons={this.updateBoundaryPolygons}
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
              sectorId: sectorId,
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

const mapStateToProps = (state: RootState) => ({
  aclCidList: state.acl.cidList,
  aclDeletedList: state.acl.deletedList,
  depCidList: state.dep.cidList,
  depDeletedList: state.dep.deletedList,
  manualPostingAcl: state.acl.manualPosting,
  manualPostingDep: state.dep.manualPosting,
});

const mapDispatchToProps = (dispatch: any) => ({
  addAclCid: (cid: string) => dispatch(addAclCid(cid)),
  deleteAclCid: (cid: string) => dispatch(deleteAclCid(cid)),
  addDepCid: (cid: string) => dispatch(addDepCid(cid)),
  deleteDepCid: (cid: string) => dispatch(deleteDepCid(cid)),
  setAclCidList: (cidList: string[], deletedList: string[]) => dispatch(setAclCidList(cidList, deletedList))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
