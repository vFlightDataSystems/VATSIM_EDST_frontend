import React, {useEffect, useState} from 'react';

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
import {refreshEntriesThunk} from "./redux/slices/entriesSlice";
import {
  windowEnum
} from "./enums";
import {AppStateType, openWindow, setDragging, setMcaCommandString, setWindowPosition} from "./redux/slices/appSlice";
import {useAppDispatch, useAppSelector} from "./redux/hooks";

// const CACHE_TIMEOUT = 300000; // ms

const DRAGGING_HIDE_CURSOR = ['edst-status', 'edst-outage', 'edst-mca', 'edst-mra'];

export const AppFunction: React.FC = () => {
  const dispatch = useAppDispatch();
  const windows = useAppSelector((state) => state.app.windows);
  const showSectorSelector = useAppSelector((state) => state.app.showSectorSelector);
  const mcaCommandString = useAppSelector((state) => state.app.mcaCommandString);
  const inputFocused = useAppSelector((state) => state.app.inputFocused);
  const dragging = useAppSelector((state) => state.app.dragging);

  const [draggingWindowName, setDraggingWindowName] = useState<windowEnum | null>(null);
  const [relativePos, setRelativePos] = useState<{ x: number, y: number } | null>(null);
  const [updateIntervalId, setUpdateIntervalId] = useState<NodeJS.Timer | null>(null);
  const [draggingCursorHide, setDraggingCursorHide] = useState<boolean>(false);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<any | null>(null);
  const [mcaInputRef, setMcaInputRef] = useState<React.RefObject<HTMLInputElement> | null>(null);
  const outlineRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(initThunk());
    setUpdateIntervalId(setInterval(async () => await dispatch(refreshEntriesThunk()), 20000));
    return () => {
      if (updateIntervalId) {
        clearInterval(updateIntervalId);
      }
    };
  }, []);

  const startDrag = (event: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<any>, window: windowEnum) => {
    const relativePos = {x: event.pageX, y: event.pageY};
    const relX = event.pageX - relativePos.x;
    const relY = event.pageY - relativePos.y;
    const ppos = windows[window].position;
    if (!ppos) {
      return;
    }
    const style = {
      left: ppos.x + relX,
      top: ppos.y + relY,
      position: "absolute",
      zIndex: 999,
      height: ref.current.clientHeight,
      width: ref.current.clientWidth
    };
    if (outlineRef.current) {
      const draggingHandler = (event: MouseEvent) => {
        console.log(draggingWindowName, dragging)
        if (ref && relativePos && draggingWindowName && dragging) {
          const relX = event.pageX - relativePos.x;
          const relY = event.pageY - relativePos.y;
          const ppos = windows[draggingWindowName].position;
          console.log(ppos);
          if (!ppos) {
            return;
          }
          setDragPreviewStyle({
            left: ppos.x + relX,
            top: ppos.y + relY,
            position: "absolute",
            zIndex: 999,
            height: ref.current.clientHeight,
            width: ref.current.clientWidth
          });
        }
      };
      // we need to remove the eventListener, but we are not...
      // function components suck for dynamic refs...
      setDraggingWindowName(window);
      setRelativePos(relativePos);
      setDragPreviewStyle(style);
      setDraggingCursorHide(DRAGGING_HIDE_CURSOR.includes(ref.current.id));
      dispatch(setDragging(true));
      outlineRef.current.addEventListener('mousemove',  draggingHandler);
    }
  };

  const stopDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragging && relativePos && draggingWindowName) {
      const relX = event.pageX - relativePos.x;
      const relY = event.pageY - relativePos.y;
      const ppos = windows[draggingWindowName].position;
      if (!ppos) {
        return;
      }
      dispatch(setWindowPosition({
        window: draggingWindowName,
        pos: {x: ppos.x + relX, y: ppos.y + relY}
      }));
      dispatch(setDragging(false));
      setDraggingWindowName(null);
      setDragPreviewStyle(null);
      setDraggingCursorHide(false);
    }
  };

  const handleKeyDownCapture = (event: React.KeyboardEvent) => {
    event.preventDefault();
    if (event.key.match(/(\w|\s|\d|\/)/gi) && event.key.length === 1) {
      dispatch(setMcaCommandString(mcaCommandString + event.key.toUpperCase()));
    }
    if (!mcaInputRef?.current) {
      dispatch(openWindow({window: windowEnum.edstMca}));
    } else {
      mcaInputRef.current.focus();
    }
  };

  return <div className="edst"
              onContextMenu={(event) => process.env.NODE_ENV !== 'development' && event.preventDefault()}
              tabIndex={!(inputFocused || windows[windowEnum.altitudeMenu].open) ? -1 : 0}
              onKeyDown={(e) => !inputFocused && handleKeyDownCapture(e)}
  >
    <EdstHeader/>
    <div className={`edst-body ${draggingCursorHide ? 'hide-cursor' : ''}`}
         ref={outlineRef}
         onMouseDown={(e) => (dragging && e.button === 0 && stopDrag(e))}
    >
      {showSectorSelector && <SectorSelector/>}
      <div className="edst-dragging-outline" style={dragPreviewStyle ?? {display: 'none'}}
           onMouseUp={(e) => !draggingCursorHide && stopDrag(e)}
      >
        {draggingCursorHide && <div className="cursor"/>}
      </div>
      <EdstContext.Provider value={{
        startDrag: startDrag,
        stopDrag: stopDrag
      }}>
        {windows[windowEnum.acl].open && <Acl/>}
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
          setMcaInputRef={setMcaInputRef}
        />}
        {windows[windowEnum.edstMra].open && <MessageResponseArea/>}
      </EdstContext.Provider>
    </div>
  </div>;
};

const initialState = {
  draggingCursorHide: null,
  draggingRef: null,
  dragPreviewStyle: null,
  relativePos: null,
};

export interface State {
  draggingCursorHide: boolean | null;
  draggingRef: React.RefObject<HTMLDivElement> & { current: { windowName?: windowEnum } } | null;
  dragPreviewStyle: any | null;
  relativePos: { x: number, y: number } | null;
}

type Props = AppStateType & {
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
      relativePos: rel,
      dragPreviewStyle: style,
      draggingCursorHide: DRAGGING_HIDE_CURSOR.includes(ref.current.id)
    });
  };

  draggingHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    const {relativePos, draggingRef} = this.state;
    const {windows, dragging} = this.props;
    if (dragging && relativePos && draggingRef?.current) {
      const relX = event.pageX - relativePos.x;
      const relY = event.pageY - relativePos.y;
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
    const {relativePos, draggingRef} = this.state;
    const {windows, dragging} = this.props;
    if (dragging && relativePos && draggingRef?.current) {
      const relX = event.pageX - relativePos.x;
      const relY = event.pageY - relativePos.y;
      const ppos = windows[draggingRef.current.windowName as windowEnum].position;
      if (!ppos) {
        return;
      }
      this.props.dispatch(setWindowPosition({
        window: draggingRef.current.windowName as windowEnum,
        pos: {x: ppos.x + relX, y: ppos.y + relY}
      }));
      if (this.outlineRef?.current) {
        this.outlineRef.current.removeEventListener('mousemove', this.draggingHandler);
      }
      this.props.dispatch(setDragging(false));
      this.setState({
        draggingRef: null,
        relativePos: null,
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
            {windows[windowEnum.acl].open && <Acl/>}
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

const mapStateToProps = (state: RootState) => ({...state.app});
const mapDispatchToProps = (dispatch: any) => ({dispatch: dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(App);
