import React from 'react';

import {distance, point, polygon} from '@turf/turf';

import {getAarData, getBoundaryData, getEdstData, updateEdstEntry} from "./api";
import './css/styles.scss';
import './css/header-styles.scss';
import EdstHeader from "./components/EdstHeader";
import Acl from "./components/edst-windows/Acl";
import Dep from "./components/edst-windows/Dep";
import Status from "./components/edst-windows/Status";
import RouteMenu from "./components/edst-windows/RouteMenu";
import Outage from "./components/edst-windows/Outage";
import AltMenu from "./components/edst-windows/AltMenu";
import PlanOptions from "./components/edst-windows/PlanOptions";
import SortMenu from "./components/edst-windows/SortMenu";
import PlansDisplay from "./components/edst-windows/PlansDisplay";
import SpeedMenu from "./components/edst-windows/SpeedMenu";
import HeadingMenu from "./components/edst-windows/HeadingMenu";
import {
  getRemainingRouteData,
  getRouteDataDistance,
  getSignedDistancePointToPolygon, REMOVAL_TIMEOUT,
  routeWillEnterAirspace,
} from "./lib";
import PreviousRouteMenu from "./components/edst-windows/PreviousRouteMenu";
import HoldMenu from "./components/edst-windows/HoldMenu";
import CancelHoldMenu from "./components/edst-windows/CancelHoldMenu";

const defaultPos = {
  'edst-status': {x: 400, y: 100},
  'edst-outage': {x: 400, y: 100}
};

const draggingHideCursor = ['edst-status', 'edst-outage'];
const DISABLED_WINDOWS = ['gpd', 'wx', 'sig', 'not', 'gi', 'ua', 'keep', 'adsb', 'sat', 'msg', 'wind', 'alt', 'mca', 'ra', 'fel'];

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open_windows: [],
      sorting: {acl: {name: 'ACID', sector: false}, dep: {name: 'ACID'}},
      disabled_windows: DISABLED_WINDOWS,
      focused_window: '',
      sector_id: '',
      menu: null,
      acl_data: {deleted: [], cid_list: []},
      dep_data: {deleted: [], cid_list: []},
      spa_list: [],
      sig: [],
      not: [],
      gi: [],
      dragging: null,
      dragging_cursor_hide: null,
      draggingRef: null,
      dragPreviewStyle: null,
      pos: defaultPos,
      edst_data: {}, // keys are cid, values are data from db
      asel: null, // {cid, field, ref}
      plan_queue: []
    };
    this.globalRef = React.createRef();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !Object.is(this.state, nextState);
  }

  async componentDidMount() {
    const sector_artcc = 'zbw' // prompt('Choose an ARTCC').toLowerCase();
    this.setState({sector_id: '37', sector_artcc: sector_artcc});
    await getBoundaryData(sector_artcc)
      .then(response => response.json())
      .then(data => {
        this.setState({boundary_data: data[0]});
      });
    await this.refresh();
    const update_interval_id = setInterval(this.refresh, 20000);
    this.setState({
      fp_update_interval_id: update_interval_id
    });
  }

  componentWillUnmount() {
    const {update_interval_id} = this.state;
    if (update_interval_id) {
      clearInterval(update_interval_id);
    }
  }

  depFilter = (entry) => {
    let dep_airport_distance = 0;
    if (entry.dep_info) {
      const pos = [entry?.flightplan?.lon, entry?.flightplan?.lat];
      const dep_pos = [entry.dep_info.lon, entry.dep_info.lat];
      dep_airport_distance = distance(point(dep_pos), point(pos), {units: 'nauticalmiles'});
    }
    const {sector_artcc} = this.state;
    return Number(entry.flightplan.ground_speed) < 40
      && entry?.dep_info?.artcc?.toLowerCase() === sector_artcc
      && dep_airport_distance < 10;
  }

  entryFilter = (entry) => {
    const {acl_data} = this.state;
    const poly = polygon(this.state.boundary_data?.geometry?.coordinates?.[0]);
    const pos = [entry?.flightplan?.lon, entry?.flightplan?.lat]
    const pos_point = point(pos);
    const sdist = getSignedDistancePointToPolygon(pos_point, poly);
    const will_enter_airspace = routeWillEnterAirspace(entry?.route_data, poly, pos)
    const minutes_away = sdist * 60 / entry.flightplan.ground_speed;
    return ((minutes_away < 30 || acl_data.cid_list.includes(entry.cid))
      && will_enter_airspace
      && Number(entry.flightplan.ground_speed) > 40);
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
      current_entry._route_data = getRouteDataDistance(current_entry._route_data, pos);
      // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
      if (current_entry.aar_list) {
        current_entry._aar_list = this.processAar(current_entry, current_entry.aar_list);
      }
    } else {
      current_entry._route_data = getRouteDataDistance(new_entry.route_data, pos);
      // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
      if (current_entry.aar_list) {
        current_entry._aar_list = this.processAar(current_entry, current_entry.aar_list);
      }
    }
    const remaining_route_data = getRemainingRouteData(new_entry.route, current_entry._route_data, pos);
    Object.assign(current_entry, remaining_route_data);
    if (new_entry.update_time === current_entry.update_time || (current_entry._route_data?.[-1]?.dist < 15 && new_entry.dest_info) || !this.entryFilter(new_entry)) {
      current_entry.pending_removal = current_entry.pending_removal || performance.now();
    } else {
      current_entry.pending_removal = null;
    }
    Object.assign(current_entry, new_entry);
    return current_entry;
  }

  refresh = async () => {
    let {edst_data: current_data, acl_data, dep_data, sector_artcc} = this.state;
    await getEdstData()
      .then(response => response.json())
      .then(async new_data => {
          if (new_data) {
            for (let new_entry of new_data) {
              let current_entry = this.state.edst_data[new_entry.cid];
              let entry = this.refreshEntry(new_entry, current_entry || {
                acl_status: -1,
                dep_status: -1
              });
              if (this.depFilter(entry) && !dep_data.deleted.includes(new_entry.cid)) {
                if (current_entry?.aar_list === undefined) {
                  await getAarData(sector_artcc, new_entry.cid)
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
                if (this.entryFilter(new_entry)) {
                  if (current_entry?.aar_list === undefined) {
                    await getAarData(sector_artcc, new_entry.cid)
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
                }
              }
              current_data[new_entry.cid] = entry;
            }
            this.forceUpdate();
          }
        }
      );
  }

  processAar = (entry, aar_list) => {
    const {_route_data: current_route_data, _route: current_route} = entry;
    return aar_list?.map(aar_data => {
      const {fix: tfix, info: tfix_info} = aar_data.amendment.tfix_details;
      const current_route_data_fix_names = current_route_data.map(fix => fix.name);
      // if the current route data does not contain the tfix, this aar will not apply
      if (!current_route_data_fix_names.includes(tfix)) {
        return null;
      }
      let {route: aar_leading_route_string, aar_amendment: aar_amendment_route_string} = aar_data.amendment;
      let amended_route_string = aar_amendment_route_string;
      const current_route_data_tfix_index = current_route_data_fix_names.indexOf(tfix);
      const remaining_fix_names = current_route_data_fix_names.slice(0, current_route_data_tfix_index)
        .concat(aar_data.route_fixes.slice(aar_data.route_fixes.indexOf(tfix)));
      if (tfix_info === 'Prepend') {
        aar_amendment_route_string = tfix + aar_amendment_route_string;
      }
      // if current route contains the tfix, append the aar amendment after the tfix
      if (current_route.includes(tfix)) {
        amended_route_string = current_route.slice(0, current_route.indexOf(tfix)) + aar_amendment_route_string;
      } else {
        // if current route does not contain the tfix, append the amendment after the first common segment, e.g. airway
        const first_common_segment = current_route.split(/\.+/).filter(segment => amended_route_string?.includes(segment))?.[0];
        if (first_common_segment === undefined) {
          return null;
        }
        amended_route_string = current_route.slice(0, current_route.indexOf(first_common_segment) + first_common_segment.length)
          + aar_leading_route_string.slice(aar_leading_route_string.indexOf(first_common_segment) + first_common_segment.length);
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
        eligible: aar_data.amendment.eligible,
        on_eligible_aar: aar_data.amendment.eligible && current_route.includes(aar_amendment_route_string),
        aar_data: aar_data
      };
    }).filter(aar_data => aar_data);
  }

  deleteEntry = (window, cid) => {
    let {acl_data, dep_data} = this.state;
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
    this.setState({acl_data: acl_data, dep_data: dep_data})
  }

  trialPlan = (p) => {
    let {plan_queue, open_windows} = this.state;
    open_windows.push('plans')
    plan_queue.unshift(p);
    this.setState({plan_queue: plan_queue});
  }

  removeTrialPlan = (index) => {
    let {plan_queue} = this.state;
    plan_queue.splice(index);
    this.setState({plan_queue: plan_queue});
  }

  swapSpaEntries = (cid_1, cid_2) => {
    let {spa_list, edst_data} = this.state;
    const index_1 = spa_list.indexOf(cid_1)
    const index_2 = spa_list.indexOf(cid_2)
    if (index_1 > 0 && index_2 > 0) {
      spa_list[index_1] = cid_2;
      spa_list[index_2] = cid_1;
      edst_data[cid_1].spa = index_2;
      edst_data[cid_2].spa = index_1;
    }
    this.setState({spa_list: spa_list, edst_data: edst_data});
  }

  updateEntry = (cid, data) => {
    let {edst_data, spa_list} = this.state;
    let entry = edst_data[cid];
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
    edst_data[cid] = Object.assign(entry, data);
    this.setState({edst_data: edst_data});
  }

  addEntry = (window, str) => {
    let {edst_data, acl_data, dep_data} = this.state;
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
      this.setState({acl_data: acl_data, dep_data: dep_data, asel: asel});
      // this.updateEntry(entry.cid, window === 'acl' ? {acl_highlighted: true} : {dep_highlighted: true});
    }
  }

  amendEntry = async (cid, plan_data) => {
    let {edst_data} = this.state;
    let current_entry = edst_data[cid];
    if (Object.keys(plan_data).includes('altitude')) {
      plan_data.interim = null;
    }
    if (Object.keys(plan_data).includes('route')) {
      const dest = current_entry.dest
      if (plan_data.route.slice(-dest.length) === dest) {
        plan_data.route = plan_data.route.slice(0, -dest.length);
      }
      plan_data.previous_route = current_entry?._route;
      plan_data.previous_route_data = current_entry?._route_data;
    }
    plan_data.callsign = current_entry.callsign;
    await updateEdstEntry(plan_data)
      .then(response => response.json())
      .then(updated_entry => {
        if (updated_entry) {
          current_entry = this.refreshEntry(updated_entry, current_entry);
          current_entry.pending_removal = null;
          edst_data[cid] = current_entry;
          this.setState({asel: null});
          this.forceUpdate();
        }
      });
  }

  aircraftSelect = (event, window, cid, field) => {
    let {asel, edst_data} = this.state;
    if (asel?.cid === cid && asel?.field === field && asel?.window === window) {
      this.setState({asel: null, menu: null});
    } else {
      const entry = edst_data[cid];
      asel = {cid: cid, field: field, window: window};
      // if (edst_data[cid]?.acl_status === undefined) {
      //   this.amendEntry(cid, `${window}_status`, '');
      // }
      this.setState({
        asel: asel,
        menu: null
      });
      switch (field) {
        case 'alt':
          this.openMenu(event.target, 'alt-menu', false);
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
  }

  toggleWindow = (name) => {
    let {open_windows} = this.state;
    const index = open_windows.indexOf(name);
    if (index > -1) {
      open_windows.splice(index, 1);
    } else {
      open_windows.push(name);
    }
    this.setState({open_windows: open_windows});
  }

  openWindow = (name) => {
    let {open_windows} = this.state;
    const index = open_windows.indexOf(name);
    if (index > -1) {
      open_windows.splice(index, 1);
    }
    open_windows.push(name);
    this.setState({open_windows: open_windows});

  }

  closeWindow = (name) => {
    let {open_windows} = this.state;
    const index = open_windows.indexOf(name);
    if (index > -1) {
      open_windows.splice(index, 1);
      this.setState({open_windows: open_windows});
    }
  }

  openMenu = (ref, name, plan, asel = null) => {
    const {x, y, height, width} = ref.getBoundingClientRect();
    let {pos} = this.state;
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
          x: x - (plan ? 0 : 570),
          y: plan ? ref.offsetTop : y - 3 * height,
          w: width,
          h: height
        } : {
          x: x,
          y: y - height,
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
    this.setState({pos: pos, menu: {name: name, ref_id: ref?.id}});
  }

  closeMenu = (name) => {
    let {pos} = this.state;
    pos[name] = null;
    this.setState({menu: null});
  }

  startDrag = (event, ref) => {
    const {pos} = this.state;
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
    this.setState({
      draggingRef: ref,
      dragging: true,
      rel: rel,
      dragPreviewStyle: style,
      dragging_cursor_hide: draggingHideCursor.includes(ref.current.id)
    });
    this.globalRef.current.addEventListener('mousemove', this.dragging);
  }

  setPos = (key, x, y) => {
    let pos = this.state.pos;
    pos[key] = {x: x, y: y};
    this.setState({pos: pos});
  }

  dragging = (event) => {
    const {dragging} = this.state;
    if (dragging) {
      const {rel, draggingRef} = this.state;
      let pos = this.state.pos;
      const relX = event.pageX - rel.x;
      const relY = event.pageY - rel.y;
      const ppos = pos[draggingRef.current.id];
      const style = {
        left: ppos.x + relX,
        top: ppos.y + relY,
        position: "absolute",
        zIndex: 999,
        height: draggingRef.current.clientHeight,
        width: draggingRef.current.clientWidth
      };
      this.setState({dragPreviewStyle: style});
    }
  }

  stopDrag = (event) => {
    if (this.state.dragging) {
      const {rel, draggingRef} = this.state;
      let pos = this.state.pos;
      const relX = event.pageX - rel.x;
      const relY = event.pageY - rel.y;
      const ppos = pos[draggingRef.current.id]
      pos[draggingRef.current.id] = {x: ppos.x + relX, y: ppos.y + relY};
      this.setState({
        pos: pos,
        rel: null,
        draggingRef: null,
        dragging: false,
        dragging_cursor_hide: false,
        dragPreviewStyle: null
      });
    }
  }

  setSorting = (sorting) => {
    this.setState({sorting: sorting});
  }

  unmount = () => {
    this.setState({menu: null, asel: null});
  }

  aclCleanup = () => {
    const {edst_data, acl_data} = this.state;
    const now = performance.now()
    for (const cid of acl_data?.cid_list) {
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
      sorting,
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
    } = this.state;

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
             ref={this.globalRef}
             onMouseDown={(e) => (dragging && e.button === 0 && this.stopDrag(e))}
        >
          <div className="edst-dragging-outline" style={dragPreviewStyle || {display: 'none'}}
               onMouseUp={(e) => !dragging_cursor_hide && this.stopDrag(e)}
          >
            {dragging_cursor_hide && <div className="cursor"/>}
          </div>
          {open_windows.includes('acl') && <Acl
            addEntry={(s) => this.addEntry('acl', s)}
            cleanup={this.aclCleanup}
            sorting={sorting.acl}
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
          {open_windows.includes('dep') && <Dep
            addEntry={(s) => this.addEntry('dep', s)}
            sorting={sorting.dep}
            unmount={this.unmount}
            openMenu={this.openMenu}
            dragging={dragging}
            asel={asel?.window === 'dep' ? asel : null}
            cid_list={dep_data.cid_list}
            edst_data={edst_data}
            updateEntry={this.updateEntry}
            amendEntry={this.amendEntry}
            aircraftSelect={this.aircraftSelect}
            deleteEntry={this.deleteEntry}
            // z_index={open_windows.indexOf('dep')}
            closeWindow={() => this.closeWindow('dep')}
          />}
          {open_windows.includes('plans') && plan_queue.length > 0 && <PlansDisplay
            unmount={this.unmount}
            openMenu={this.openMenu}
            dragging={dragging}
            asel={asel?.window === 'plans' ? asel : null}
            cleanup={() => {
              this.setState({plan_queue: []});
            }}
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
            clearAsel={() => this.setState({asel: null})}
            closeWindow={() => this.closeMenu('plan-menu')}
          />}
          {menu?.name === 'sort-menu' && <SortMenu
            ref_id={menu?.ref_id}
            sorting={sorting}
            dragging={dragging}
            setSorting={this.setSorting}
            startDrag={this.startDrag}
            stopDrag={this.stopDrag}
            pos={pos['sort-menu']}
            // z_index={open_windows.indexOf('route-menu')}
            closeWindow={() => this.closeMenu('sort-menu')}
          />}
          {menu?.name === 'route-menu' && <RouteMenu
            openMenu={this.openMenu}
            trialPlan={this.trialPlan}
            dragging={dragging}
            asel={asel}
            entry={edst_data[asel?.cid]}
            amendEntry={this.amendEntry}
            startDrag={this.startDrag}
            stopDrag={this.stopDrag}
            pos={pos['route-menu']}
            closeWindow={() => this.closeMenu('route-menu')}
          />}
          {menu?.name === 'hold-menu' && <HoldMenu
            dragging={dragging}
            asel={asel}
            data={edst_data[asel?.cid]}
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
            asel={asel}
            trialPlan={this.trialPlan}
            data={edst_data[asel?.cid]}
            amendEntry={this.amendEntry}
            closeWindow={() => this.closeMenu('alt-menu')}
          />}
          {menu?.name === 'speed-menu' && <SpeedMenu
            pos={pos['speed-menu']}
            asel={asel}
            data={edst_data[asel?.cid]}
            updateEntry={this.updateEntry}
            amendEntry={this.amendEntry}
            startDrag={this.startDrag}
            stopDrag={this.stopDrag}
            closeWindow={() => this.closeMenu('speed-menu')}
          />}
          {menu?.name === 'heading-menu' && <HeadingMenu
            pos={pos['heading-menu']}
            asel={asel}
            data={edst_data[asel?.cid]}
            updateEntry={this.updateEntry}
            amendEntry={this.amendEntry}
            startDrag={this.startDrag}
            stopDrag={this.stopDrag}
            closeWindow={() => this.closeMenu('heading-menu')}
          />}
        </div>
      </div>
    );
  }
}
