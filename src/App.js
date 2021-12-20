import React from 'react';

import EdstHeader from "./components/EdstHeader";
import './css/styles.css';
import './css/header-styles.css';
import Acl from "./components/edst-windows/Acl";
import Dep from "./components/edst-windows/Dep";
import Status from "./components/edst-windows/Status";
import RouteMenu from "./components/edst-windows/RouteMenu";

const defaultPos = {
  'edst-status': {x: 100, y: 100},
  'route-menu': {x: 100, y: 100}
}

const draggingHideCursor = ['edst-status']


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open_windows: [],
      disabled_windows: ['gpd', 'plans', 'wx', 'sig', 'not', 'gi', 'ua', 'keep', 'adsb', 'sat', 'msg', 'wind', 'alt', 'mca', 'ra', 'fel'],
      focused_window: '',
      sector_id: '',
      acl: [{callsign: 'SWA123'}],
      dep: [],
      sig: [],
      not: [],
      gi: [],
      dragging: null,
      dragging_cursor_hide: null,
      draggingRef: null,
      pos: defaultPos
    }

    this.globalRef = React.createRef();
  }

  componentDidMount() {
    this.setState({sector_id: '37'});
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

  startDrag = (event, ref) => {
    const {pos} = this.state;
    const rel = {x: event.pageX, y: event.pageY};
    const relX = event.pageX - rel.x;
    const relY = event.pageY - rel.y;
    const ppos = pos[ref.current.id]
    const style = {
      left: ppos.x + relX,
      top: ppos.y + relY,
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
  }

  setPos = (key, x, y) => {
    let pos = this.state.pos;
    pos[key] = {x: x, y: y};
    this.setState({pos: pos});
  }

  onMouseMove = (event) => {
    const {dragging} = this.state;
    if (dragging) {
      const {rel, draggingRef} = this.state;
      let pos = this.state.pos;
      const relX = event.pageX - rel.x;
      const relY = event.pageY - rel.y;
      const ppos = pos[draggingRef.current.id]
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
      this.setState({pos: pos, rel: null, draggingRef: null, dragging: false, dragging_cursor_hide: false});
    }
  }

  render() {
    const {
      disabled_windows,
      open_windows,
      sector_id,
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
                    sector_id={sector_id}
                    acl_num={acl.length}
                    dep_num={dep.length}
                    sig_num={sig.length}
                    not_num={not.length}
                    gi_num={gi.length}
        />
        <div className={`edst-body ${dragging_cursor_hide ? 'hide-cursor' : ''}`}
             ref={this.globalRef}
             onMouseMove={this.onMouseMove}
             onMouseDown={(e) => (dragging && e.button === 0 && this.stopDrag(e))}
        >
          {dragging && <div className="edst-dragging-outline" style={dragPreviewStyle}
                            onMouseUp={(e) => !dragging_cursor_hide && this.stopDrag(e)}
          >
            {dragging_cursor_hide && <div className="cursor"/>}
          </div>}
          {open_windows.includes('acl') && <Acl
            z_index={open_windows.indexOf('acl')}
            closeWindow={() => this.closeWindow('acl')}
          />}
          {open_windows.includes('dep') && <Dep
            z_index={open_windows.indexOf('dep')}
            closeWindow={() => this.closeWindow('dep')}
          />}
          {open_windows.includes('status') && <Status
            startDrag={this.startDrag}
            pos={pos['edst-status']}
            z_index={open_windows.indexOf('status')}
            closeWindow={() => this.closeWindow('status')}
          />}
          {open_windows.includes('route-menu') && <RouteMenu
            startDrag={this.startDrag}
            stopDrag={this.stopDrag}
            pos={pos['route-menu']}
            z_index={open_windows.indexOf('route-menu')}
            closeWindow={() => this.closeWindow('route-menu')}
          />}
        </div>
      </div>
    );
  }
}
