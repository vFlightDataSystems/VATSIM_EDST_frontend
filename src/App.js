import React from 'react';

import {distance, point, polygon} from '@turf/turf';

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
import PlansDisplay from "./components/edst-windows/PlansDisplay";
import {SpeedMenu} from "./components/edst-windows/SpeedMenu";
import {HeadingMenu} from "./components/edst-windows/HeadingMenu";
import {
  getClosestReferenceFix,
  getRemainingRouteData,
  getRouteDataDistance,
  getSignedDistancePointToPolygons,
  REMOVAL_TIMEOUT,
  routeWillEnterAirspace,
} from "./lib";
import {PreviousRouteMenu} from "./components/edst-windows/PreviousRouteMenu";
import {HoldMenu} from "./components/edst-windows/HoldMenu";
import {CancelHoldMenu} from "./components/edst-windows/CancelHoldMenu";
import {AclContext, DepContext, EdstContext} from "./contexts/contexts";
import {MessageComposeArea} from "./components/edst-windows/MessageComposeArea";

const defaultPos = {
  'edst-status': {x: 400, y: 100},
  'edst-outage': {x: 400, y: 100},
  'edst-mca': {x: 100, y: 800}
};

const DRAGGING_HIDE_CURSOR = ['edst-status', 'edst-outage', 'edst-mca'];
const DISABLED_WINDOWS = ['gpd', 'wx', 'sig', 'not', 'gi', 'ua', 'keep', 'adsb', 'sat', 'msg', 'wind', 'alt', 'ra', 'fel'];

export default class App extends React.Component {

  open_windows = [];
  reference_fixes = [];
  acl_data = {deleted: [], cid_list: []};
  dep_data = {deleted: [], cid_list: []};
  disabled_windows = DISABLED_WINDOWS;
  artcc_id = null;
  sector_id = null;
  boundary_polygons = null;
  menu = null;
  spa_list = [];
  sig = [];
  not = [];
  gi = [];
  dragging = null;
  dragging_cursor_hide = null;
  draggingRef = null;
  dragPreviewStyle = null;
  pos = defaultPos;
  edst_data = {}; // keys are cid, values are data from db
  asel = null; // {cid, field, ref}
  plan_queue = [];
  update_interval_id = null;

  constructor(props) {
    super(props);
    this.state = {
      sort_data: {acl: {name: 'ACID', sector: false}, dep: {name: 'ACID'}}
    };
    this.outlineRef = React.createRef();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !Object.is(this.state, nextState);
  }

  async componentDidMount() {
    this.artcc_id = 'zbw'; // prompt('Choose an ARTCC')?.toLowerCase();
    this.sector_id = '37';
    await getBoundaryData(this.artcc_id)
      .then(response => response.json())
      .then(geo_data => {
        this.boundary_polygons = geo_data.map(sector_boundary => polygon(sector_boundary.geometry.coordinates));
      });
    await getReferenceFixes(this.artcc_id)
      .then(response => response.json())
      .then(reference_fixes => {
        if (reference_fixes) {
          this.reference_fixes = reference_fixes;
        }
      });
    await this.refresh();
    this.update_interval_id = setInterval(this.refresh, 20000);
  }

  componentWillUnmount() {
    if (this.update_interval_id) {
      clearInterval(this.update_interval_id);
    }
  }

  depFilter = (entry) => {
    let dep_airport_distance = 0;
    if (entry.dep_info) {
      const pos = [entry.flightplan.lon, entry.flightplan.lat];
      const dep_pos = [entry.dep_info.lon, entry.dep_info.lat];
      dep_airport_distance = distance(point(dep_pos), point(pos), {units: 'nauticalmiles'});
    }
    const {artcc_id} = this;
    return Number(entry.flightplan.ground_speed) < 40
      && entry.dep_info?.artcc?.toLowerCase() === artcc_id
      && dep_airport_distance < 10;
  }

  entryFilter = (entry) => {
    const {acl_data, boundary_polygons} = this;
    const pos = [entry.flightplan.lon, entry.flightplan.lat];
    const pos_point = point(pos);
    const sdist = getSignedDistancePointToPolygons(pos_point, boundary_polygons);
    const will_enter_airspace = routeWillEnterAirspace(entry._route_data.slice(0), boundary_polygons, pos);
    const minutes_away = sdist * 60 / entry.flightplan.ground_speed;
    return ((minutes_away < 30 || acl_data.cid_list.includes(entry.cid))
      && will_enter_airspace
      && Number(entry.flightplan.ground_speed) > 30);
  }

  refreshEntry = (new_entry, current_entry) => {
    const pos = [new_entry.flightplan.lon, new_entry.flightplan.lat];
    const route_fix_names = new_entry.route_data.map(fix => fix.name);
    const dest = new_entry.dest;
    // add departure airport to route_data if we know the coords to compute the distance
    if (new_entry.dest_info && !route_fix_names.includes(dest)) {
      new_entry.route_data.push({
        name: new_entry.dest_info.icao,
        pos: [new_entry.dest_info.lon, new_entry.dest_info.lat]
      });
    }
    if (!(new_entry.route.slice(-dest.length) === dest)) {
      new_entry.route += new_entry.dest;
    }
    if (current_entry?.route_data === new_entry.route_data) { // if route_data has not changed
      new_entry._route_data = getRouteDataDistance(current_entry._route_data, pos);
      // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
      if (current_entry.aar_list) {
        new_entry._aar_list = this.processAar(current_entry, current_entry.aar_list);
      }
    } else {
      new_entry._route_data = getRouteDataDistance(new_entry.route_data, pos);
      // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
      if (current_entry.aar_list) {
        new_entry._aar_list = this.processAar(current_entry, current_entry.aar_list);
      }
    }
    const remaining_route_data = getRemainingRouteData(new_entry.route, new_entry._route_data, pos);
    Object.assign(new_entry, remaining_route_data);
    if (new_entry.update_time === current_entry.update_time
      || (current_entry._route_data?.[-1]?.dist < 15 && new_entry.dest_info)
      || !(this.entryFilter(new_entry) || this.depFilter(new_entry))) {
      new_entry.pending_removal = current_entry.pending_removal || performance.now();
    } else {
      new_entry.pending_removal = null;
    }
    Object.assign(current_entry, new_entry);
    return current_entry;
  }

  refresh = async () => {
    let {acl_data, dep_data, artcc_id, reference_fixes} = this;
    await getEdstData()
      .then(response => response.json())
      .then(async new_data => {
          if (new_data) {
            for (let new_entry of new_data) {
              let current_entry = this.edst_data[new_entry.cid];
              let entry = this.refreshEntry(new_entry, current_entry || {
                acl_status: -1,
                dep_status: -1
              });
              if (this.depFilter(entry) && !dep_data.deleted.includes(new_entry.cid)) {
                if (current_entry?.aar_list === undefined) {
                  await getAarData(artcc_id, new_entry.cid)
                    .then(response => response.json())
                    .then(aar_list => {
                      entry.aar_list = aar_list;
                      entry._aar_list = this.processAar(entry, aar_list);
                    });
                }
                if (!dep_data.cid_list.includes(new_entry.cid)) {
                  dep_data.cid_list.push(new_entry.cid);
                }
              } else {
                if (this.entryFilter(entry)) {
                  if (current_entry?.aar_list === undefined) {
                    await getAarData(artcc_id, new_entry.cid)
                      .then(response => response.json())
                      .then(aar_list => {
                        entry.aar_list = aar_list;
                        entry._aar_list = this.processAar(entry, aar_list);
                      });
                  }
                  if (!acl_data.cid_list.includes(new_entry.cid) && !acl_data.deleted.includes(new_entry.cid)) {
                    acl_data.cid_list.push(new_entry.cid);
                    // remove cid from departure list if will populate the aircraft list
                    const index = dep_data.cid_list.indexOf(new_entry.cid);
                    if (index > -1) {
                      dep_data.cid_list.splice(index, 1);
                    }
                  }
                  if (reference_fixes.length > 0) {
                    entry.reference_fix = getClosestReferenceFix(reference_fixes, point([new_entry.flightplan.lon, new_entry.flightplan.lat]));
                  }
                }
              }
              this.edst_data[new_entry.cid] = entry;
            }
            this.forceUpdate();
          }
        }
      );
  }

  processAar = (entry, aar_list) => {
    const {_route_data: current_route_data, _route: current_route} = entry;
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
        on_eligible_aar: amendment.eligible && current_route.includes(aar_amendment_route_string),
        aar_data: aar_data
      };
    }).filter(aar_data => aar_data);
  }

  deleteEntry = (window, cid) => {
    let {acl_data, dep_data} = this;
    let index;
    switch (window) {
      case 'acl':
        acl_data.deleted.push(cid);
        index = acl_data.cid_list.indexOf(cid);
        if (index > -1) {
          acl_data.cid_list.splice(index, 1);
        }
        break;
      case 'dep':
        dep_data.deleted.push(cid);
        index = dep_data.cid_list.indexOf(cid)
        if (index > -1) {
          dep_data.cid_list.splice(index, 1);
        }
        break;
      default:
        break;
    }
    this.acl_data = acl_data;
    this.dep_data = dep_data;
    this.forceUpdate();
  }

  trialPlan = (p) => {
    let {plan_queue, open_windows} = this;
    open_windows.push('plans')
    plan_queue.unshift(p);
    this.plan_queue = plan_queue;
  }

  removeTrialPlan = (index) => {
    let {plan_queue} = this;
    plan_queue.splice(index);
    this.plan_queue = plan_queue;
  }

  swapSpaEntries = (cid_1, cid_2) => {
    let {spa_list, edst_data} = this;
    const index_1 = spa_list.indexOf(cid_1)
    const index_2 = spa_list.indexOf(cid_2)
    if (index_1 > 0 && index_2 > 0) {
      spa_list[index_1] = cid_2;
      spa_list[index_2] = cid_1;
      edst_data[cid_1].spa = index_2;
      edst_data[cid_2].spa = index_1;
    }
    this.spa_list = spa_list;
    this.edst_data = edst_data;
    this.forceUpdate();
  }

  updateEntry = (cid, data) => {
    let {spa_list} = this;
    let entry = this.edst_data[cid];
    if (data?.spa === true) {
      if (!spa_list.includes(cid)) {
        spa_list.push(cid);
      }
      data.spa = spa_list.indexOf(cid);
    }
    if (data?.spa === false) {
      const index = spa_list.indexOf(cid);
      if (index > -1) {
        spa_list.splice(index, 1);
      }
    }
    this.edst_data[cid] = Object.assign(entry, data);
    this.forceUpdate();
  }

  addEntry = (window, str) => {
    let {edst_data, acl_data, dep_data} = this;
    let entry = Object.values(edst_data || {})?.find(e => String(e?.cid) === str || String(e.callsign) === str || String(e.beacon) === str);
    if (entry && (window === 'acl' || window === 'dep')) {
      let data = window === 'acl' ? acl_data : dep_data;
      const del_index = data.deleted?.indexOf(entry.cid);
      if (del_index > -1) {
        data.deleted.splice(del_index);
      }
      if (!data.cid_list.includes(entry.cid)) {
        data.cid_list.push(entry.cid);
      }
      if (window === 'acl') {
        acl_data = data;
      } else {
        dep_data = data;
      }
      const asel = {cid: entry.cid, field: 'fid', window: window};
      this.acl_data = acl_data;
      this.dep_data = dep_data;
      this.asel = asel;
      this.forceUpdate();
      // this.updateEntry(entry.cid, window === 'acl' ? {acl_highlighted: true} : {dep_highlighted: true});
    }
  }

  amendEntry = async (cid, plan_data) => {
    let {edst_data, artcc_id, dep_data} = this;
    let current_entry = edst_data[cid];
    if (Object.keys(plan_data).includes('altitude')) {
      plan_data.interim = null;
    }
    if (Object.keys(plan_data).includes('route')) {
      const dest = current_entry.dest
      if (plan_data.route.slice(-dest.length) === dest) {
        plan_data.route = plan_data.route.slice(0, -dest.length);
      }
      plan_data.previous_route = dep_data.cid_list.includes(cid) ? current_entry?.route : current_entry?._route;
      plan_data.previous_route_data = dep_data.cid_list.includes(cid) ? current_entry?.route_data : current_entry?._route_data;
    }
    plan_data.callsign = current_entry.callsign;
    await updateEdstEntry(plan_data)
      .then(response => response.json())
      .then(async updated_entry => {
        if (updated_entry) {
          current_entry = this.refreshEntry(updated_entry, current_entry);
          current_entry.pending_removal = null;
          await getAarData(artcc_id, current_entry.cid)
            .then(response => response.json())
            .then(aar_list => {
              current_entry.aar_list = aar_list;
              current_entry._aar_list = this.processAar(current_entry, aar_list);
            });
          this.edst_data[cid] = current_entry;
          this.asel = null
          this.forceUpdate();
        }
      });
  }

  aircraftSelect = (event, window, cid, field) => {
    let {asel, edst_data} = this;
    if (asel?.cid === cid && asel?.field === field && asel?.window === window) {
      this.asel = null;
      this.menu = null;
    } else {
      const entry = edst_data[cid];
      asel = {cid: cid, field: field, window: window};
      // if (edst_data[cid]?.acl_status === undefined) {
      //   this.amendEntry(cid, `${window}_status`, '');
      // }
      this.asel = asel;
      this.menu = null;
      switch (field) {
        case 'alt':
          this.openMenu(event.target, 'alt-menu', false, asel);
          break;
        case 'route':
          if (entry?.show_hold_info) {
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
    this.forceUpdate();
  }

  toggleWindow = (name) => {
    let {open_windows} = this;
    const index = open_windows.indexOf(name);
    if (index > -1) {
      open_windows.splice(index, 1);
    } else {
      open_windows.push(name);
    }
    this.open_windows = open_windows;
    this.forceUpdate();
  }

  openWindow = (name) => {
    let {open_windows} = this;
    const index = open_windows.indexOf(name);
    if (index > -1) {
      open_windows.splice(index, 1);
    }
    open_windows.push(name);
    this.open_windows = open_windows;
    this.forceUpdate();
  }

  closeWindow = (name) => {
    let {open_windows} = this;
    const index = open_windows.indexOf(name);
    if (index > -1) {
      open_windows.splice(index, 1);
      this.open_windows = open_windows;
      this.forceUpdate();
    }
  }

  openMenu = (ref, name, plan, asel = null) => {
    const {x, y, height, width} = ref.getBoundingClientRect();
    let {pos} = this;
    switch (name) {
      case 'alt-menu':
        pos[name] = {
          x: x + (plan ? 0 : width),
          y: plan ? ref.offsetTop : y - 2 * height,
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
    this.pos = pos;
    this.menu = {name: name, ref_id: ref?.id};
    this.forceUpdate();
  }

  closeMenu = (name) => {
    this.pos[name] = null;
    this.menu = null;
    this.forceUpdate();
  }

  startDrag = (event, ref) => {
    const {pos} = this;
    const rel = {x: event.pageX, y: event.pageY};
    const relX = event.pageX - rel.x;
    const relY = event.pageY - rel.y;
    const ppos = pos[ref.current.id]
    const style = {
      left: ppos?.x + relX,
      top: ppos?.y + relY,
      position: "absolute",
      zIndex: 999,
      height: ref.current.clientHeight,
      width: ref.current.clientWidth
    };
    this.draggingRef = ref;
    this.dragging = true;
    this.rel = rel;
    this.dragPreviewStyle = style;
    this.dragging_cursor_hide = DRAGGING_HIDE_CURSOR.includes(ref.current.id);
    this.outlineRef.current.addEventListener('mousemove', this.draggingHandler);
    this.forceUpdate();
  }

  setPos = (key, x, y) => {
    this.pos[key] = {x: x, y: y};
    this.forceUpdate();
  }

  draggingHandler = (event) => {
    const {dragging} = this;
    if (dragging) {
      const {rel, draggingRef, pos} = this;
      const relX = event.pageX - rel.x;
      const relY = event.pageY - rel.y;
      const ppos = pos[draggingRef.current.id];
      this.dragPreviewStyle = {
        left: ppos.x + relX,
        top: ppos.y + relY,
        position: "absolute",
        zIndex: 999,
        height: draggingRef.current.clientHeight,
        width: draggingRef.current.clientWidth
      };
      this.forceUpdate();
    }
  }

  stopDrag = (event) => {
    if (this.dragging) {
      const {rel, draggingRef} = this;
      const relX = event.pageX - rel.x;
      const relY = event.pageY - rel.y;
      const ppos = this.pos[draggingRef.current.id];
      this.pos[draggingRef.current.id] = {x: ppos.x + relX, y: ppos.y + relY};
      this.rel = rel;
      this.draggingRef = null;
      this.dragging = false;
      this.dragging_cursor_hide = false;
      this.dragPreviewStyle = null;
      this.forceUpdate();
    }
  }

  setSorting = (sort_data) => {
    this.setState({sort_data: sort_data});
  }

  unmount = () => {
    this.menu = null;
    this.asel = null;
    this.forceUpdate();
  }

  aclCleanup = () => {
    const {edst_data, acl_data} = this;
    const now = performance.now()
    for (const cid of acl_data.cid_list) {
      if (now - (edst_data[cid]?.pending_removal || now) > REMOVAL_TIMEOUT) {
        this.deleteEntry('acl', cid);
      }
    }
  }

  render() {
    const {
      edst_data,
      asel,
      disabled_windows,
      open_windows,
      plan_queue,
      sector_id,
      menu,
      acl_data,
      dep_data,
      sig,
      not,
      gi,
      pos,
      dragPreviewStyle,
      dragging,
      dragging_cursor_hide
    } = this;

    const {sort_data} = this.state;

    return (
      <div className="edst"
        // onContextMenu={(event) => event.preventDefault()}
      >
        <EdstHeader open_windows={open_windows}
                    disabled_windows={disabled_windows}
                    openWindow={this.openWindow}
                    toggleWindow={this.toggleWindow}
                    plan_disabled={plan_queue.length === 0}
                    sector_id={sector_id}
                    acl_num={acl_data.cid_list.length}
                    dep_num={dep_data.cid_list.length}
                    sig_num={sig.length}
                    not_num={not.length}
                    gi_num={gi.length}
        />
        <div className={`edst-body ${dragging_cursor_hide ? 'hide-cursor' : ''}`}
             ref={this.outlineRef}
             onMouseDown={(e) => (dragging && e.button === 0 && this.stopDrag(e))}
        >
          <div className="edst-dragging-outline" style={dragPreviewStyle || {display: 'none'}}
               onMouseUp={(e) => !dragging_cursor_hide && this.stopDrag(e)}
          >
            {dragging_cursor_hide && <div className="cursor"/>}
          </div>
          <EdstContext.Provider value={{
            edst_data: edst_data,
            asel: asel,
            plan_queue: plan_queue,
            sector_id: sector_id,
            menu: menu,
            unmount: this.unmount,
            openMenu: this.openMenu,
            closeMenu: this.closeMenu,
            updateEntry: this.updateEntry,
            amendEntry: this.amendEntry,
            deleteEntry: this.deleteEntry,
            trialPlan: this.trialPlan,
            aircraftSelect: this.aircraftSelect,
            openWindow: this.openWindow,
            closeWindow: this.closeWindow,
            startDrag: this.startDrag,
            stopDrag: this.stopDrag
          }}>
            <AclContext.Provider value={{
              cid_list: acl_data.cid_list,
              sort_data: sort_data.acl,
              asel: asel?.window === 'acl' ? asel : null
            }}>
              {open_windows.includes('acl') && <Acl
                addEntry={(s) => this.addEntry('acl', s)}
                cleanup={this.aclCleanup}
                sort_data={sort_data.acl}
                unmount={this.unmount}
                openMenu={this.openMenu}
                dragging={dragging}
                asel={asel?.window === 'acl' ? asel : null}
                cid_list={acl_data.cid_list}
                edst_data={edst_data}
                updateEntry={this.updateEntry}
                amendEntry={this.amendEntry}
                aircraftSelect={this.aircraftSelect}
                deleteEntry={this.deleteEntry}
                // z_index={open_windows.indexOf('acl')}
                closeWindow={() => this.closeWindow('acl')}
              />}
            </AclContext.Provider>
            <DepContext.Provider value={{
              cid_list: dep_data.cid_list,
              sort_data: sort_data.dep,
              asel: asel?.window === 'dep' ? asel : null
            }}>
              {open_windows.includes('dep') && <Dep
                addEntry={(s) => this.addEntry('dep', s)}
                sort_data={sort_data.dep}
                unmount={this.unmount}
                openMenu={this.openMenu}
                dragging={dragging}
                // z_index={open_windows.indexOf('dep')}
                closeWindow={() => this.closeWindow('dep')}
              />}
            </DepContext.Provider>
            {open_windows.includes('plans') && plan_queue.length > 0 && <PlansDisplay
              unmount={this.unmount}
              openMenu={this.openMenu}
              dragging={dragging}
              asel={asel?.window === 'plans' ? asel : null}
              cleanup={() => this.plan_queue = []}
              plan_queue={plan_queue}
              amendEntry={this.amendEntry}
              aircraftSelect={this.aircraftSelect}
              // z_index={open_windows.indexOf('dep')}
              closeWindow={() => this.closeWindow('plans')}
            />}
            {open_windows.includes('status') && <Status
              dragging={dragging}
              startDrag={this.startDrag}
              pos={pos['edst-status']}
              // z_index={open_windows.indexOf('status')}
              closeWindow={() => this.closeWindow('status')}
            />}
            {open_windows.includes('outage') && <Outage
              dragging={dragging}
              startDrag={this.startDrag}
              pos={pos['edst-outage']}
              // z_index={open_windows.indexOf('status')}
              closeWindow={() => this.closeWindow('outage')}
            />}
            {menu?.name === 'plan-menu' && <PlanOptions
              deleteEntry={this.deleteEntry}
              openMenu={this.openMenu}
              dragging={dragging}
              asel={asel}
              data={edst_data[asel?.cid]}
              amendEntry={this.amendEntry}
              startDrag={this.startDrag}
              stopDrag={this.stopDrag}
              pos={pos['plan-menu']}
              // z_index={open_windows.indexOf('route-menu')}
              clearAsel={() => this.asel = null}
              closeWindow={() => this.closeMenu('plan-menu')}
            />}
            {menu?.name === 'sort-menu' && <SortMenu
              ref_id={menu?.ref_id}
              sort_data={sort_data}
              dragging={dragging}
              setSorting={this.setSorting}
              startDrag={this.startDrag}
              stopDrag={this.stopDrag}
              pos={pos['sort-menu']}
              // z_index={open_windows.indexOf('route-menu')}
              closeWindow={() => this.closeMenu('sort-menu')}
            />}
            {menu?.name === 'route-menu' && <RouteMenu
              pos={pos['route-menu']}
              closeWindow={() => this.closeMenu('route-menu')}
            />}
            {menu?.name === 'hold-menu' && <HoldMenu
              dragging={dragging}
              asel={asel}
              entry={edst_data[asel?.cid]}
              updateEntry={this.updateEntry}
              amendEntry={this.amendEntry}
              startDrag={this.startDrag}
              stopDrag={this.stopDrag}
              pos={pos['hold-menu']}
              closeWindow={() => this.closeMenu('hold-menu')}
            />}
            {menu?.name === 'cancel-hold-menu' && <CancelHoldMenu
              dragging={dragging}
              asel={asel}
              data={edst_data[asel?.cid]}
              updateEntry={this.updateEntry}
              amendEntry={this.amendEntry}
              startDrag={this.startDrag}
              stopDrag={this.stopDrag}
              pos={pos['cancel-hold-menu']}
              closeWindow={() => this.closeMenu('cancel-hold-menu')}
            />}
            {menu?.name === 'prev-route-menu' && <PreviousRouteMenu
              dragging={dragging}
              data={edst_data[asel?.cid]}
              amendEntry={this.amendEntry}
              startDrag={this.startDrag}
              stopDrag={this.stopDrag}
              pos={pos['prev-route-menu']}
              closeWindow={() => this.closeMenu('prev-route-menu')}
            />}
            {menu?.name === 'alt-menu' && <AltMenu
              pos={pos['alt-menu']}
              closeWindow={() => this.closeMenu('alt-menu')}
            />}
            {menu?.name === 'speed-menu' && <SpeedMenu
              pos={pos['speed-menu']}
              asel={asel}
              entry={edst_data[asel?.cid]}
              updateEntry={this.updateEntry}
              amendEntry={this.amendEntry}
              startDrag={this.startDrag}
              stopDrag={this.stopDrag}
              closeWindow={() => this.closeMenu('speed-menu')}
            />}
            {menu?.name === 'heading-menu' && <HeadingMenu
              pos={pos['heading-menu']}
              asel={asel}
              entry={edst_data[asel?.cid]}
              updateEntry={this.updateEntry}
              amendEntry={this.amendEntry}
              startDrag={this.startDrag}
              stopDrag={this.stopDrag}
              closeWindow={() => this.closeMenu('heading-menu')}
            />}
            {open_windows.includes('mca') && <MessageComposeArea
              pos={pos['edst-mca']}
              startDrag={this.startDrag}
            />}
          </EdstContext.Provider>
        </div>
      </div>
    );
  }
}
