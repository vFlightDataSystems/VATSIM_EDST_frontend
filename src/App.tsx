import React, {useCallback, useEffect, useState} from 'react';

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
import {initThunk} from "./redux/asyncThunks";
import {refreshEntriesThunk} from "./redux/slices/entriesSlice";
import {
  windowEnum
} from "./enums";
import {openWindow, setDragging, setMcaCommandString, setWindowPosition} from "./redux/slices/appSlice";
import {useAppDispatch, useAppSelector} from "./redux/hooks";

// const CACHE_TIMEOUT = 300000; // ms

const DRAGGING_HIDE_CURSOR = ['edst-status', 'edst-outage', 'edst-mca', 'edst-mra'];

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const windows = useAppSelector((state) => state.app.windows);
  const showSectorSelector = useAppSelector((state) => state.app.showSectorSelector);
  const mcaCommandString = useAppSelector((state) => state.app.mcaCommandString);
  const inputFocused = useAppSelector((state) => state.app.inputFocused);
  const dragging = useAppSelector((state) => state.app.dragging);

  const [updateIntervalId, setUpdateIntervalId] = useState<NodeJS.Timer | null>(null);
  const [draggingCursorHide, setDraggingCursorHide] = useState<boolean>(false);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<any | null>(null);
  const [mcaInputRef, setMcaInputRef] = useState<React.RefObject<HTMLInputElement> | null>(null);
  const outlineRef = React.useRef<HTMLDivElement & any>(null);

  useEffect(() => {
    dispatch(initThunk());
    setUpdateIntervalId(setInterval(async () => await dispatch(refreshEntriesThunk()), 20000));
    return () => {
      if (updateIntervalId) {
        clearInterval(updateIntervalId);
      }
    };
  }, []);

  const draggingHandler = useCallback((event: MouseEvent) => {
    if (event && outlineRef?.current?.draggingRef?.current) {
      const relX = event.pageX - outlineRef?.current.relativePos.x;
      const relY = event.pageY - outlineRef?.current.relativePos.y;
      const ppos = windows[outlineRef.current.draggingWindowName as windowEnum].position;
      if (!ppos) {
        return;
      }
      setDragPreviewStyle({
        left: ppos.x + relX,
        top: ppos.y + relY,
        position: "absolute",
        zIndex: 999,
        height: outlineRef.current.draggingRef.current.clientHeight,
        width: outlineRef.current.draggingRef.current.clientWidth
      });
    }
  }, [windows]);

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
      outlineRef.current.draggingRef = ref;
      outlineRef.current.draggingWindowName = window;
      outlineRef.current.relativePos = relativePos;
      setDragPreviewStyle(style);
      setDraggingCursorHide(DRAGGING_HIDE_CURSOR.includes(ref.current.id));
      dispatch(setDragging(true));
      // we need to remove the eventListener, but we are not...
      // function components suck for dynamic refs...
      outlineRef.current.addEventListener('mousemove', draggingHandler);
    }
  };

  const stopDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragging && outlineRef?.current) {
      const relX = event.pageX - outlineRef.current.relativePos.x;
      const relY = event.pageY - outlineRef.current.relativePos.y;
      const ppos = windows[outlineRef.current.draggingWindowName as windowEnum].position;
      if (!ppos) {
        return;
      }
      if (outlineRef?.current) {
        outlineRef.current.removeEventListener('mousemove', draggingHandler);
      }
      dispatch(setWindowPosition({
        window: outlineRef.current.draggingWindowName as windowEnum,
        pos: {x: ppos.x + relX, y: ppos.y + relY}
      }));
      dispatch(setDragging(false));
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
      <div className="edst-dragging-outline" style={dragging ? dragPreviewStyle : {display: 'none'}}
           onMouseUp={(e) => !draggingCursorHide && stopDrag(e)}
           draggable={true}
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