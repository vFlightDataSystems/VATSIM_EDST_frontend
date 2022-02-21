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
import {
  openWindow,
  setDragging,
  setMcaCommandString,
  setWindowPosition
} from "./redux/slices/appSlice";
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
  const altMenuRef = React.useRef<{showInput: boolean, inputRef: React.RefObject<HTMLInputElement> | null}>({showInput: false, inputRef: null});
  const bodyRef = React.useRef<HTMLDivElement & any>(null);

  useEffect(() => {
    dispatch(initThunk());
    setUpdateIntervalId(setInterval(async () => await dispatch(refreshEntriesThunk()), 20000));
    return () => {
      if (updateIntervalId) {
        clearInterval(updateIntervalId);
      }
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (altMenuRef.current.inputRef === null) {
      altMenuRef.current.showInput = false;
    }
    else if (altMenuRef.current.inputRef?.current) {
        altMenuRef.current?.inputRef.current.focus();
    }
  }, [altMenuRef.current.inputRef])

  const draggingHandler = useCallback((event: MouseEvent) => {
    if (event && bodyRef?.current?.windowRef?.current) {
      const relX = event.pageX - bodyRef?.current.relativePos.x;
      const relY = event.pageY - bodyRef?.current.relativePos.y;
      const ppos = windows[bodyRef.current.draggingWindowName as windowEnum].position;
      if (!ppos) {
        return;
      }
      setDragPreviewStyle({
        left: ppos.x + relX,
        top: ppos.y + relY,
        position: "absolute",
        zIndex: 999,
        height: bodyRef.current.windowRef.current.clientHeight,
        width: bodyRef.current.windowRef.current.clientWidth
      });
    }
  }, [windows]);

  const startDrag = (event: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<any>, window: windowEnum) => {
    const relativePos = {x: event.pageX, y: event.pageY};
    const ppos = windows[window].position;
    if (!ppos) {
      return;
    }
    const style = {
      left: ppos.x,
      top: ppos.y,
      position: "absolute",
      zIndex: 999,
      height: ref.current.clientHeight,
      width: ref.current.clientWidth
    };
    if (bodyRef.current) {
      bodyRef.current.windowRef = ref;
      bodyRef.current.draggingWindowName = window;
      bodyRef.current.relativePos = relativePos;
      setDragPreviewStyle(style);
      setDraggingCursorHide(DRAGGING_HIDE_CURSOR.includes(ref.current.id));
      dispatch(setDragging(true));
      bodyRef.current.addEventListener('mousemove', draggingHandler);
    }
  };

  const stopDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragging && bodyRef?.current) {
      const relX = event.pageX - bodyRef.current.relativePos.x;
      const relY = event.pageY - bodyRef.current.relativePos.y;
      const ppos = windows[bodyRef.current.draggingWindowName as windowEnum].position;
      if (!ppos) {
        return;
      }
      if (bodyRef?.current) {
        bodyRef.current.removeEventListener('mousemove', draggingHandler);
      }
      dispatch(setWindowPosition({
        window: bodyRef.current.draggingWindowName as windowEnum,
        pos: {x: ppos.x + relX, y: ppos.y + relY}
      }));
      dispatch(setDragging(false));
      setDragPreviewStyle(null);
      setDraggingCursorHide(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    event.preventDefault();
    if (windows[windowEnum.altitudeMenu].open) {
      altMenuRef.current.showInput = true;
      if (altMenuRef.current.inputRef?.current) {
        altMenuRef.current?.inputRef.current.focus();
      }
    }
    else {
      if (event.key.match(/(\w|\s|\d|\/)/gi) && event.key.length === 1) {
        dispatch(setMcaCommandString(mcaCommandString + event.key.toUpperCase()));
      }
      if (!mcaInputRef?.current) {
        dispatch(openWindow({window: windowEnum.edstMca}));
      } else {
        mcaInputRef.current.focus();
      }
    }
  };

  return <div className="edst"
              onContextMenu={(event) => process.env.NODE_ENV !== 'development' && event.preventDefault()}
              tabIndex={!(inputFocused) ? -1 : 0}
              onKeyDown={(e) => (!(inputFocused) || (windows[windowEnum.altitudeMenu].open && !altMenuRef.current.showInput)) && handleKeyDown(e)}
  >
    <EdstHeader/>
    <div className={`edst-body ${draggingCursorHide ? 'hide-cursor' : ''}`}
         ref={bodyRef}
         onMouseDown={(e) => (dragging && e.button === 0 && stopDrag(e))}
    >
      {showSectorSelector && <SectorSelector/>}
      <div className="edst-dragging-outline" style={dragging ? dragPreviewStyle : {display: 'none'}}
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
        {windows[windowEnum.altitudeMenu].open && <AltMenu
          setAltMenuInputRef={(ref: React.RefObject<HTMLInputElement> | null) => altMenuRef.current.inputRef = ref}
          showInput={altMenuRef.current.showInput}
        />}
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