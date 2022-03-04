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
import {initThunk} from "./redux/thunks/initThunk";
import {refreshEntriesThunk} from "./redux/slices/entriesSlice";
import {menuEnum, windowEnum} from "./enums";
import {
  openWindow,
  setDragging,
  setMcaCommandString,
  setMenuPosition,
  setWindowPosition
} from "./redux/slices/appSlice";
import {useAppDispatch, useAppSelector} from "./redux/hooks";
import {ToolsMenu} from "./components/edst-windows/ToolsMenu";
import {AltimeterWindow} from "./components/edst-windows/AltimeterWindow";
import {MetarWindow} from "./components/edst-windows/MetarWindow";
import {refreshWeatherThunk} from "./redux/thunks/weatherThunks";
import {useEventListener} from "usehooks-ts";
import {EquipmentTemplateMenu} from "./components/edst-windows/template-components/EquipmentTemplateMenu";
import {SigmetWindow} from "./components/edst-windows/SigmetWindow";

// const CACHE_TIMEOUT = 300000; // ms

const ENTRIES_REFRESH_RATE = 20000; // 20 seconds
const WEATHER_REFRESH_RATE = 120000; // 2 minutes

const DRAGGING_HIDE_CURSOR: (windowEnum | menuEnum)[] = [
  windowEnum.status,
  windowEnum.outage,
  windowEnum.messageComposeArea,
  windowEnum.messageResponseArea,
  windowEnum.altimeter,
  windowEnum.metar,
  windowEnum.sigmets
];

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const windows = useAppSelector((state) => state.app.windows);
  const menus = useAppSelector((state) => state.app.menus);
  const showSectorSelector = useAppSelector((state) => state.app.showSectorSelector);
  const mcaCommandString = useAppSelector((state) => state.app.mcaCommandString);
  const inputFocused = useAppSelector((state) => state.app.inputFocused);
  const dragging = useAppSelector((state) => state.app.dragging);
  const [draggingCursorHide, setDraggingCursorHide] = useState<boolean>(false);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<any | null>(null);
  const [mcaInputRef, setMcaInputRef] = useState<React.RefObject<HTMLInputElement> | null>(null);
  const altMenuRef = React.useRef<{ showInput: boolean, inputRef: React.RefObject<HTMLInputElement> | null }>({
    showInput: false,
    inputRef: null
  });
  const bodyRef = React.useRef<HTMLDivElement & any>(null);

  useEffect(() => {
    dispatch(initThunk());
    const entriesUpdateIntervalId = setInterval(async () => await dispatch(refreshEntriesThunk()), ENTRIES_REFRESH_RATE);
    const weatherUpdateIntervalId = setInterval(() => dispatch(refreshWeatherThunk), WEATHER_REFRESH_RATE);
    return () => {
      if (entriesUpdateIntervalId) {
        clearInterval(entriesUpdateIntervalId);
      }
      if (weatherUpdateIntervalId) {
        clearInterval(weatherUpdateIntervalId);
      }
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (altMenuRef.current.inputRef === null) {
      altMenuRef.current.showInput = false;
    } else if (altMenuRef.current.inputRef?.current) {
      altMenuRef.current?.inputRef.current.focus();
    }
  }, [altMenuRef.current.inputRef]);

  const draggingHandler = useCallback((event: MouseEvent) => {
    if (event && bodyRef?.current?.windowRef?.current) {
      const relX = event.pageX - bodyRef?.current.relativePos.x;
      const relY = event.pageY - bodyRef?.current.relativePos.y;
      const window = bodyRef.current.draggingWindowName;
      let ppos;
      if (window in windowEnum) {
        ppos = windows[window as windowEnum].position;
      }
      else if (window in menuEnum) {
        ppos = menus[window as menuEnum].position;
      }
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
  }, [windows, menus]);

  const startDrag = (event: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<any>, window: windowEnum | menuEnum) => {
    const relativePos = {x: event.pageX, y: event.pageY};
    let ppos;
    if (window in windowEnum) {
      ppos = windows[window as windowEnum].position;
    }
    else if (window in menuEnum) {
      ppos = menus[window as menuEnum].position;
    }
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
      setDraggingCursorHide(DRAGGING_HIDE_CURSOR.includes(window));
      dispatch(setDragging(true));
      bodyRef.current.addEventListener('mousemove', draggingHandler);
    }
  };

  const stopDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragging && bodyRef?.current) {
      const relX = event.pageX - bodyRef.current.relativePos.x;
      const relY = event.pageY - bodyRef.current.relativePos.y;
      const window = bodyRef.current.draggingWindowName;
      if (bodyRef?.current) {
        bodyRef.current.removeEventListener('mousemove', draggingHandler);
      }
      let ppos;
      if (window in windowEnum) {
        ppos = windows[window as windowEnum].position;
      }
      else if (window in menuEnum) {
        ppos = menus[window as menuEnum].position;
      }
      if (!ppos) {
        return;
      }
      if (window in windowEnum) {
        dispatch(setWindowPosition({
          window: bodyRef.current.draggingWindowName as windowEnum,
          pos: {x: ppos.x + relX, y: ppos.y + relY}
        }));
      }
      else if (window in menuEnum) {
        dispatch(setMenuPosition({
          menu: bodyRef.current.draggingWindowName as menuEnum,
          pos: {x: ppos.x + relX, y: ppos.y + relY}
        }));
      }
      dispatch(setDragging(false));
      setDragPreviewStyle(null);
      setDraggingCursorHide(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    // event.preventDefault();
    if (!inputFocused) {
      if (menus[menuEnum.altitudeMenu].open) {
        altMenuRef.current.showInput = true;
        if (altMenuRef.current.inputRef?.current) {
          altMenuRef.current?.inputRef.current.focus();
        }
      } else {
        if (!mcaInputRef?.current) {
          dispatch(openWindow({window: windowEnum.messageComposeArea}));
          if (event.key.match(/(\w|\s|\d|\/)/gi) && event.key.length === 1) {
            dispatch(setMcaCommandString(mcaCommandString + event.key.toUpperCase()));
          }
        } else {
          mcaInputRef.current.focus();
        }
      }
    }
  };

  useEventListener('keydown', handleKeyDown);

  return <div className="edst no-select"
              onContextMenu={(event) => process.env.NODE_ENV !== 'development' && event.preventDefault()}
              tabIndex={!(inputFocused) ? -1 : 0}
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
        {menus[menuEnum.planOptions].open && <PlanOptions/>}
        {menus[menuEnum.sortMenu].open && <SortMenu/>}
        {menus[menuEnum.toolsMenu].open && <ToolsMenu/>}
        {menus[menuEnum.routeMenu].open && <RouteMenu/>}
        {menus[menuEnum.templateMenu].open && <TemplateMenu/>}
        {menus[menuEnum.equipmentTemplateMenu].open && <EquipmentTemplateMenu/>}
        {menus[menuEnum.holdMenu].open && <HoldMenu/>}
        {menus[menuEnum.cancelHoldMenu].open && <CancelHoldMenu/>}
        {menus[menuEnum.prevRouteMenu].open && <PreviousRouteMenu/>}
        {menus[menuEnum.speedMenu].open && <SpeedMenu/>}
        {menus[menuEnum.headingMenu].open && <HeadingMenu/>}
        {menus[menuEnum.altitudeMenu].open && <AltMenu
          setAltMenuInputRef={(ref: React.RefObject<HTMLInputElement> | null) => altMenuRef.current.inputRef = ref}
          showInput={altMenuRef.current.showInput}
        />}
        {windows[windowEnum.status].open && <Status/>}
        {windows[windowEnum.outage].open && <Outage/>}
        {windows[windowEnum.altimeter].open && <AltimeterWindow/>}
        {windows[windowEnum.metar].open && <MetarWindow/>}
        {windows[windowEnum.sigmets].open && <SigmetWindow/>}
        {windows[windowEnum.messageComposeArea].open && <MessageComposeArea
          setMcaInputRef={setMcaInputRef}
        />}
        {windows[windowEnum.messageResponseArea].open && <MessageResponseArea/>}
      </EdstContext.Provider>
    </div>
  </div>;
};