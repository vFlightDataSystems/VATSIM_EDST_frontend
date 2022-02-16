import React from 'react';

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
import {PreviousRouteMenu} from "./components/edst-windows/PreviousRouteMenu";
import {HoldMenu} from "./components/edst-windows/HoldMenu";
import {CancelHoldMenu} from "./components/edst-windows/CancelHoldMenu";
import {EdstContext} from "./contexts/contexts";
import {MessageComposeArea} from "./components/edst-windows/MessageComposeArea";
import {MessageResponseArea} from "./components/edst-windows/MessageResponseArea";
import {TemplateMenu} from "./components/edst-windows/TemplateMenu";
import {SectorSelector} from "./components/SectorSelector";
import {connect} from 'react-redux';
import {RootState} from './redux/store';
import {initThunk} from "./redux/asyncThunks";
import {EntriesStateType, refreshEntriesThunk} from "./redux/slices/entriesSlice";
import {
  windowEnum
} from "./enums";
import {AppStateType, openWindow, setDragging, setMcaCommandString, setWindowPosition} from "./redux/slices/appSlice";

// const CACHE_TIMEOUT = 300000; // ms

const DRAGGING_HIDE_CURSOR = ['edst-status', 'edst-outage', 'edst-mca', 'edst-mra'];
const DISABLED_WINDOWS = ['gpd', 'wx', 'sig', 'not', 'gi', 'ua', 'keep', 'adsb', 'sat', 'msg', 'wind', 'alt', 'fel', 'cpdlc-hist', 'cpdlc-msg-out'];

const initialState = {
  disabledWindows: DISABLED_WINDOWS,
  menu: null,
  spaList: [],
  draggingCursorHide: null,
  draggingRef: null,
  dragPreviewStyle: null,
  rel: null,
};

export interface State {
  disabledWindows: string[];
  menu: { window: windowEnum, refId: string | null } | null;
  draggingCursorHide: boolean | null;
  draggingRef: any | null;
  dragPreviewStyle: any | null;
  rel: { x: number, y: number } | null;
}

type Props = AppStateType & {
  entries: EntriesStateType,
  dispatch: (action: any) => void;
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

  // shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any) {
  //   return !Object.is(this.state, nextState);
  // }

  async componentDidMount() {
    await this.props.dispatch(initThunk());
    this.updateIntervalId = setInterval(async () => await this.props.dispatch(refreshEntriesThunk()), 20000);
    // update loop will run every 20 seconds
  }

  componentWillUnmount() {
    // localStorage.setItem(`vEDST_${this.state.artccId}_${this.state.sectorId}`, JSON.stringify({...this.state,
    // timestamp: new Date().getTime()}));
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
  }

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

  // amendEntry = async (cid: string, planData: any) => {
  //   const {cidList: depCidList} = this.props.dep;
  //   let currentEntry = {...this.props.entries[cid]};
  //   if (Object.keys(planData).includes('altitude')) {
  //     planData.interim = null;
  //   }
  //   if (Object.keys(planData).includes('route')) {
  //     const dest = currentEntry.dest;
  //     if (planData.route.slice(-dest.length) === dest) {
  //       planData.route = planData.route.slice(0, -dest.length);
  //     }
  //     planData.previous_route = depCidList.includes(cid) ? currentEntry?.route : currentEntry?._route;
  //     planData.previous_route_data = depCidList.includes(cid) ? currentEntry?.route_data : currentEntry?._route_data;
  //   }
  //   planData.callsign = currentEntry.callsign;
  //   updateEdstEntry(planData)
  //     .then(response => response.json())
  //     .then(async updated_entry => {
  //       if (updated_entry) {
  //         updated_entry = refreshEntry(updated_entry, this.props);
  //         updated_entry.pending_removal = null;
  //         if (planData.scratch_hdg !== undefined) updated_entry.scratch_hdg = planData.scratch_hdg;
  //         if (planData.scratch_spd !== undefined) updated_entry.scratch_spd = planData.scratch_spd;
  //         this.props.dispatch(updateEntry({cid: cid, data: updated_entry}));
  //       }
  //     });
  // };

  // aircraftSelect = (event: any & Event,
  //                   window: windowEnum | null,
  //                   cid: string, field: aclRowFieldEnum | depRowFieldEnum | planRowFieldEnum,
  //                   aselAction?: aclAselActionTriggerEnum | depAselActionTriggerEnum | null,
  //                   triggerOpenWindow?: windowEnum | null) => {
  //   let needOpenMenu: boolean = true;
  //   const asel = this.props.asel
  //   if (window === windowEnum.dep) {
  //     if (asel?.cid === cid && asel?.field === field) {
  //       this.setState({menu: null});
  //       needOpenMenu = false;
  //     }
  //     this.props.dispatch(depAircraftSelect(event, cid, field as depRowFieldEnum, aselAction as depAselActionTriggerEnum));
  //   }
  //   if (window === windowEnum.acl) {
  //     if (asel?.cid === cid && asel?.field === field) {
  //       this.setState({menu: null});
  //       needOpenMenu = false;
  //     }
  //     this.props.dispatch(aclAircraftSelect(event, cid, field as aclRowFieldEnum, aselAction as aclAselActionTriggerEnum));
  //   }
  //   if (needOpenMenu && triggerOpenWindow) {
  //     const entry = this.props.entries[cid];
  //     if (window === windowEnum.acl && !this.props.aclManualPosting && aselAction === aclAselActionTriggerEnum.setVciNeutral && entry?.vciStatus === -1) {
  //       this.props.dispatch(updateEntry({cid: cid, data: {vciStatus: 0}}));
  //     }
  //     if (window === windowEnum.dep && !this.props.depManualPosting && aselAction === depAselActionTriggerEnum.setDepStatusNeutral && entry?.depStatus === -1) {
  //       this.props.dispatch(updateEntry({cid: cid, data: {depStatus: 0}}));
  //     }
  //     this.props.dispatch(openWindowThunk(window as windowEnum, event.target, triggerOpenWindow, false));
  //   }
  // };

  startDrag = (event: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<any>, window: windowEnum) => {
    const rel = {x: event.pageX, y: event.pageY};
    const relX = event.pageX - rel.x;
    const relY = event.pageY - rel.y;
    const ppos = this.props.windows[window].position;
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
    ref.current.windowName = window;
    this.props.dispatch(setDragging(true));
    this.setState({
      draggingRef: ref,
      rel: rel,
      dragPreviewStyle: style,
      draggingCursorHide: DRAGGING_HIDE_CURSOR.includes(ref.current.id)
    });
  };

  draggingHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    const {rel, draggingRef} = this.state;
    const {windows, dragging} = this.props;
    if (dragging && rel) {
      const relX = event.pageX - rel.x;
      const relY = event.pageY - rel.y;
      const ppos = windows[draggingRef.current.windowName as windowEnum].position;
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
    const {rel, draggingRef} = this.state;
    const {windows, dragging} = this.props;
    if (dragging && rel) {
      const relX = event.pageX - rel.x;
      const relY = event.pageY - rel.y;
      const ppos = windows[draggingRef.current.windowName as windowEnum].position;
      if (!ppos) {
        return;
      }
      this.props.dispatch(setWindowPosition({
        window: draggingRef.current.windowName as windowEnum,
        pos: {x: ppos.x + relX, y: ppos.y + relY}
      }));
      this.props.dispatch(setDragging(false));
      this.setState({
        draggingRef: null,
        rel: null,
        dragPreviewStyle: null,
        draggingCursorHide: false,
      });
    }
  };

  handleKeyDownCapture = (event: React.KeyboardEvent) => {
    event.preventDefault();
    if (event.key.match(/(\w|\s|\d|\/)/gi) && event.key.length === 1) {
      this.props.dispatch(setMcaCommandString(this.props.mcaCommandString + event.key.toUpperCase()));
    }
    if (this.mcaInputRef === null) {
      this.props.dispatch(openWindow({window: windowEnum.edstMca}));
    } else {
      this.mcaInputRef.current.focus();
    }
  };

  render() {
    const {
      dragPreviewStyle,
      draggingCursorHide,
    } = this.state;

    const {windows, dragging, showSectorSelector, inputFocused} = this.props;

    return (
      <div className="edst"
           onContextMenu={(event) => process.env.NODE_ENV !== 'development' && event.preventDefault()}
           tabIndex={!(inputFocused || windows[windowEnum.altitudeMenu].open) ? -1 : 0}
           onKeyDown={(e) => !inputFocused && this.handleKeyDownCapture(e)}
      >
        <EdstHeader/>
        <div className={`edst-body ${draggingCursorHide ? 'hide-cursor' : ''}`}
             ref={this.outlineRef}
             onMouseDown={(e) => (dragging && e.button === 0 && this.stopDrag(e))}
        >
          {showSectorSelector && <SectorSelector/>}
          <div className="edst-dragging-outline" style={dragPreviewStyle ?? {display: 'none'}}
               onMouseUp={(e) => !draggingCursorHide && this.stopDrag(e)}
          >
            {draggingCursorHide && <div className="cursor"/>}
          </div>
          <EdstContext.Provider value={{
            startDrag: this.startDrag,
            stopDrag: this.stopDrag
          }}>
            {windows[windowEnum.acl].open ? <Acl/> : null}
            {windows[windowEnum.dep].open && <Dep/>}
            {windows[windowEnum.plansDisplay].open && <PlansDisplay/>}
            {windows[windowEnum.edstStatus].open && <Status/>}
            {windows[windowEnum.edstOutage].open && <Outage/>}
            {windows[windowEnum.planOptions].open && <PlanOptions/>}
            {windows[windowEnum.sortMenu].open && <SortMenu/>}
            {windows[windowEnum.routeMenu].open && <RouteMenu/>}
            {windows[windowEnum.templateMenu].open && <TemplateMenu/>}
            {windows[windowEnum.holdMenu].open && <HoldMenu/>}
            {windows[windowEnum.cancelHoldMenu].open && <CancelHoldMenu/>}
            {windows[windowEnum.prevRouteMenu].open && <PreviousRouteMenu/>}
            {windows[windowEnum.altitudeMenu].open && <AltMenu/>}
            {windows[windowEnum.speedMenu].open && <SpeedMenu/>}
            {windows[windowEnum.headingMenu].open && <HeadingMenu/>}
            {windows[windowEnum.edstMca].open && <MessageComposeArea
              setMcaInputRef={(ref: React.RefObject<any> | null) => this.mcaInputRef = ref}
            />}
            {windows[windowEnum.edstMra].open && <MessageResponseArea/>}
          </EdstContext.Provider>
        </div>
      </div>
    )
      ;
  }
}

const mapStateToProps = (state: RootState) => ({
  entries: state.entries,
  ...state.app
});
const mapDispatchToProps = (dispatch: any) => ({dispatch: dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(App);
