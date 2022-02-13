import React from 'react';

import {updateEdstEntry} from "./api";
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
  REMOVAL_TIMEOUT
} from "./lib";
import {PreviousRouteMenu} from "./components/edst-windows/PreviousRouteMenu";
import {HoldMenu} from "./components/edst-windows/HoldMenu";
import {CancelHoldMenu} from "./components/edst-windows/CancelHoldMenu";
import {AclContext, DepContext, EdstContext, TooltipContext} from "./contexts/contexts";
import {MessageComposeArea} from "./components/edst-windows/MessageComposeArea";
import {MessageResponseArea} from "./components/edst-windows/MessageResponseArea";
import {TemplateMenu} from "./components/edst-windows/TemplateMenu";
import {AselType, PlanDataType} from "./types";
import _ from "lodash";
import {BoundarySelector} from "./components/BoundarySelector";
import {connect} from 'react-redux';
import {RootState} from './redux/store';
import {fetchReferenceFixes, fetchSectorData} from "./redux/asyncActions";
import {addAclCid, deleteAclCid, setAclLists} from "./redux/slices/aclSlice";
import {addDepCid, deleteDepCid} from "./redux/slices/depSlice";
import {setArtccId, setSectorId} from "./redux/slices/sectorSlice";
import {fetchRefresh, refreshEntry} from "./redux/fetchRefresh";
import {updateEntry} from "./redux/slices/entriesSlice";
import {depFilter} from "./filters";
import {refreshStart} from "./redux/slices/actionSlice";

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

type Props = RootState & {
  dispatch: (action: any) => void
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

  shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any) {
    return !Object.is(this.state, nextState);
  }

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
    this.props.dispatch(setArtccId(artccId));
    this.props.dispatch(setSectorId(sectorId));
    if (Object.keys(this.props.sectorData.sectors).length === 0) {
      this.props.dispatch(fetchSectorData);
    }
    // if we have no reference fixes for computing FRD, get some
    if (!(this.props.sectorData.referenceFixes.length > 0)) {
      this.props.dispatch(fetchReferenceFixes);
    }
    this.props.dispatch(refreshStart());
    this.updateIntervalId = setInterval(() => this.props.dispatch(refreshStart()), 20000); // update loop will run every 20
                                                                                    // seconds
  }

  componentWillUnmount() {
    // localStorage.setItem(`vEDST_${this.state.artccId}_${this.state.sectorId}`, JSON.stringify({...this.state,
    // timestamp: new Date().getTime()}));
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
  }

  deleteEntry = (window: string, cid: string) => {
    switch (window) {
      case 'acl':
        this.props.dispatch(deleteAclCid(cid));
        break;
      case 'dep':
        this.props.dispatch(deleteDepCid(cid));
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

  addEntry = (window: string | null, fid: string) => {
    let {entries} = this.props;
    let entry = Object.values(entries ?? {})?.find(e => String(e?.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid);
    if (window === null && entry) {
      if (depFilter(entry, this.props)) {
        this.addEntry('dep', fid);
      } else {
        this.addEntry('acl', fid);
      }
    } else if (entry && (window === 'acl' || window === 'dep')) {
      if (window === 'acl') {
        this.props.dispatch(addAclCid(entry.cid));
      } else {
        this.props.dispatch(addDepCid(entry.cid));
      }
      const asel = {cid: entry.cid, field: 'fid', window: window};
      this.setState({
        asel: asel
      });
      // this.updateEntry(entry.cid, window === 'acl' ? {aclHighlighted: true} : {depHighlighted: true});
    }
  };

  amendEntry = async (cid: string, planData: any) => {
    const {cidList: depCidList} = this.props.dep;
    let currentEntry = {...this.props.entries[cid]};
    if (Object.keys(planData).includes('altitude')) {
      planData.interim = null;
    }
    if (Object.keys(planData).includes('route')) {
      const dest = currentEntry.dest;
      if (planData.route.slice(-dest.length) === dest) {
        planData.route = planData.route.slice(0, -dest.length);
      }
      planData.previous_route = depCidList.includes(cid) ? currentEntry?.route : currentEntry?._route;
      planData.previous_route_data = depCidList.includes(cid) ? currentEntry?.route_data : currentEntry?._route_data;
    }
    planData.callsign = currentEntry.callsign;
    updateEdstEntry(planData)
      .then(response => response.json())
      .then(async updated_entry => {
        if (updated_entry) {
          updated_entry = refreshEntry(updated_entry, this.props);
          updated_entry.pending_removal = null;
          if (planData.scratch_hdg !== undefined) updated_entry.scratch_hdg = planData.scratch_hdg;
          if (planData.scratch_spd !== undefined) updated_entry.scratch_spd = planData.scratch_spd;
          this.props.dispatch(updateEntry({cid: cid, data: updated_entry}));
        }
      });
  };

  aircraftSelect = (event: any & Event, window: string | null, cid: string, field: string) => {
    let {asel} = this.state;
    if (asel?.cid === cid && asel?.field === field && asel?.window === window) {
      this.setState({menu: null, asel: null});
    } else {
      const entry = this.props.entries[cid];
      asel = {cid: cid, field: field, window: window};
      if (window === 'acl' && !this.props.acl.manualPosting && field === 'fid-2' && entry?.vciStatus === -1) {
        this.props.dispatch(updateEntry({cid: cid, data: {vciStatus: 0}}));
      }
      if (window === 'dep' && !this.props.dep.manualPosting && field === 'fid-2' && entry?.depStatus === -1) {
        this.props.dispatch(updateEntry({cid: cid, data: {depStatus: 0}}));
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
    let {entries} = this.props;
    const {cidList, deletedList} = this.props.acl;
    const now = new Date().getTime();
    let aclCidListCopy, aclDeletedListCopy;
    const pendingRemovalCidList = cidList.filter(cid => (now - (entries[cid]?.pending_removal ?? now) > REMOVAL_TIMEOUT));

    aclCidListCopy = _.difference(cidList, pendingRemovalCidList);
    aclDeletedListCopy = deletedList.concat(pendingRemovalCidList);
    this.props.dispatch(setAclLists({cidList: [...aclCidListCopy], deletedList: [...new Set(aclDeletedListCopy)]}));
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
              asel: asel,
              planQueue: planQueue,
              menu: menu,
              unmount: this.unmount,
              openMenu: this.openMenu,
              closeMenu: this.closeMenu,
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
const mapDispatchToProps = (dispatch: any) => ({dispatch: dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(App);
