import React from 'react';

import './css/styles.scss';
import './css/header-styles.scss';
import EdstHeader from "./components/EdstHeader";
import Acl from "./components/edst-windows/Acl";
import Dep from "./components/edst-windows/Dep";
import Status from "./components/edst-windows/Status";
import RouteMenu from "./components/edst-windows/RouteMenu";
import {getEdstData, updateEdstEntry} from "./api";
import Outage from "./components/edst-windows/Outage";
import AltMenu from "./components/edst-windows/AltMenu";
import PlanOptions from "./components/edst-windows/PlanOptions";
import SortMenu from "./components/edst-windows/SortMenu";
import PlansDisplay from "./components/edst-windows/PlansDisplay";
import SpeedMenu from "./components/edst-windows/SpeedMenu";
import HeadingMenu from "./components/edst-windows/HeadingMenu";

const defaultPos = {
  'edst-status': {x: 400, y: 100},
  'edst-outage': {x: 400, y: 100}
}

const draggingHideCursor = ['edst-status', 'edst-outage']

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
      acl: [],
      dep: [],
      sig: [],
      not: [],
      gi: [],
      dragging: null,
      dragging_cursor_hide: null,
      draggingRef: null,
      dragPreviewStyle: null,
      pos: defaultPos,
      edstData: {}, // keys are cid, values are data from db
      asel: null, // {cid, field, ref}
      plan_queue: []
    };
    this.globalRef = React.createRef();
  }

  async componentDidMount() {
    this.setState({sector_id: '37'});
    await this.refresh();
    const update_interval_id = setInterval(this.refresh, 60000);
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

  refresh = async () => {
    let {edstData, acl, dep} = this.state;
    await getEdstData()
      .then(response => response.json())
      .then(data => {
        if (data) {
          for (let x of data) {
            if (this.entryFilter(x)) {
              let entry = Object.keys(edstData).includes(x.cid) ? Object.assign(edstData?.[x.cid], x) : x;
              entry.pending_removal = entry.update_time === edstData?.[x.cid]?.update_time;
              edstData[x.cid] = entry;
              if (Number(entry.flightplan.ground_speed) < 40 && entry.departing) {
                if (!dep.includes(x.cid)) {
                  dep.push(x.cid);
                }
              }
              else {
                if (!acl.includes(x.cid)) {
                  acl.push(x.cid);
                  // remove cid from departure list if will populate the aircraft list
                  const index = dep.indexOf(x.cid);
                  if (index > -1) {
                    dep.splice(index, 1);
                  }
                }
              }
            }
          }
          this.setState({edstData: edstData, acl: acl, dep: dep});
        }
      });
  }

  trialPlan = (p) => {
    let {plan_queue, open_windows} = this.state;
    open_windows.push('plans')
    plan_queue.push(p);
    this.setState({plan_queue: plan_queue});
  }

  removeTrialPlan = (index) => {
    let {plan_queue} = this.state;
    plan_queue.splice(index);
    this.setState({plan_queue: plan_queue});
  }

  entryFilter = (entry) => {
    return true;
  }

  updateEntry = (cid, data) => {
    let {edstData} = this.state;
    let entry = edstData[cid];
    edstData[cid] = Object.assign(entry, data);
    this.setState({edstData: edstData});
  }

  amendEntry = async (cid, plan_data) => {
    let {edstData} = this.state;
    let entry = edstData[cid];
    if (Object.keys(plan_data).includes('altitude')) {
      plan_data.interim = null;
    }
    // for (let [key, val] of Object.entries(post_data)) {
    //   edstData[key] = val;
    // }
    plan_data.callsign = entry.callsign;
    await updateEdstEntry(plan_data)
      .then(response => response.json())
      .then(data => {
        if (data) {
          edstData[cid] = Object.assign(entry, data);
          this.setState({edstData: edstData, asel: null});
        }
      });
  }

  aircraftSelect = (event, window, cid, field) => {
    let {asel} = this.state;
    if (asel?.cid === cid && asel?.field === field && asel?.window === window) {
      this.setState({asel: null, menu: null});
    } else {
      asel = {cid: cid, field: field, window: window};
      // if (edstData[cid]?.acl_status === undefined) {
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
          this.openMenu(event.target, 'route-menu', false, asel);
          break;
        case 'spd':
          this.openMenu(event.target, 'speed-menu', false, asel);
          break;
        case 'hdg':
          this.openMenu(event.target, 'heading-menu', false, asel);
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
          y: plan ? ref.offsetTop : y - 2*height,
          w: width,
          h: height
        };
        break;
      case 'route-menu':
        pos[name] = (asel?.window !== 'dep') ? {
          x: x - (plan ? 0 : 570),
          y: plan ? ref.offsetTop : y - 2*height,
          w: width,
          h: height
        } : {
          x: x,
          y: y - height,
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
    this.setState({pos: pos, menu: {name: name, ref_id: ref?.target?.id}});
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

  render() {
    const {
      edstData,
      asel,
      disabled_windows,
      sorting,
      open_windows,
      plan_queue,
      sector_id,
      menu,
      acl,
      dep,
      sig,
      not,
      gi,
      pos,
      dragPreviewStyle,
      dragging,
      dragging_cursor_hide
    } = this.state;

    return (
      <div className="edst">
        <EdstHeader open_windows={open_windows}
                    disabled_windows={disabled_windows}
                    openWindow={this.openWindow}
                    toggleWindow={this.toggleWindow}
                    plan_disabled={plan_queue.length === 0}
                    sector_id={sector_id}
                    acl_num={acl.length}
                    dep_num={dep.length}
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
            sorting={sorting.acl}
            unmount={this.unmount}
            openMenu={this.openMenu}
            dragging={dragging}
            asel={asel?.window === 'acl' ? asel : null}
            cid_list={acl}
            edstData={edstData}
            updateEntry={this.updateEntry}
            amendEntry={this.amendEntry}
            aircraftSelect={this.aircraftSelect}
            // z_index={open_windows.indexOf('acl')}
            closeWindow={() => this.closeWindow('acl')}
          />}
          {open_windows.includes('dep') && <Dep
            sorting={sorting.dep}
            unmount={this.unmount}
            openMenu={this.openMenu}
            dragging={dragging}
            asel={asel?.window === 'dep' ? asel : null}
            cid_list={dep}
            edstData={edstData}
            updateEntry={this.updateEntry}
            amendEntry={this.amendEntry}
            aircraftSelect={this.aircraftSelect}
            // z_index={open_windows.indexOf('dep')}
            closeWindow={() => this.closeWindow('dep')}
          />}
          {open_windows.includes('plans') && <PlansDisplay
            unmount={this.unmount}
            openMenu={this.openMenu}
            dragging={dragging}
            asel={asel?.window === 'plans' ? asel : null}
            cleanup={() => {
              this.setState({plan_queue: []});
              this.closeWindow('plans');
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
            openMenu={this.openMenu}
            dragging={dragging}
            asel={asel}
            data={edstData[asel?.cid]}
            amendEntry={this.amendEntry}
            startDrag={this.startDrag}
            stopDrag={this.stopDrag}
            pos={pos['plan-menu']}
            // z_index={open_windows.indexOf('route-menu')}
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
            data={edstData[asel?.cid]}
            amendEntry={this.amendEntry}
            startDrag={this.startDrag}
            stopDrag={this.stopDrag}
            pos={pos['route-menu']}
            closeWindow={() => this.closeMenu('route-menu')}
          />}
          {menu?.name === 'alt-menu' && <AltMenu
            pos={pos['alt-menu']}
            asel={asel}
            trialPlan={this.trialPlan}
            data={edstData[asel?.cid]}
            amendEntry={this.amendEntry}
            closeWindow={() => this.closeMenu('alt-menu')}
          />}
          {menu?.name === 'speed-menu' && <SpeedMenu
            pos={pos['speed-menu']}
            asel={asel}
            data={edstData[asel?.cid]}
            updateEntry={this.updateEntry}
            amendEntry={this.amendEntry}
            startDrag={this.startDrag}
            stopDrag={this.stopDrag}
            closeWindow={() => this.closeMenu('speed-menu')}
          />}
          {menu?.name === 'heading-menu' && <HeadingMenu
            pos={pos['heading-menu']}
            asel={asel}
            data={edstData[asel?.cid]}
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
