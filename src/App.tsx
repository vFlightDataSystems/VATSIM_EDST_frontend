import React, {useCallback, useEffect, useState} from 'react';
import {invoke} from "@tauri-apps/api/tauri";

import './css/styles.scss';
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
import {SpeedMenu} from "./components/edst-windows/spd-hdg/SpeedMenu";
import {HeadingMenu} from "./components/edst-windows/spd-hdg/HeadingMenu";
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
  anyDraggingSelector, inputFocusedSelector, mcaCommandStringSelector, menusSelector,
  openWindow,
  setDragging,
  setMcaCommandString,
  setMenuPosition,
  setWindowPosition, showSectorSelectorSelector, windowsSelector,
} from "./redux/slices/appSlice";
import {useAppDispatch, useAppSelector} from "./redux/hooks";
import {ToolsMenu} from "./components/edst-windows/tools-components/ToolsMenu";
import {AltimeterWindow} from "./components/edst-windows/AltimeterWindow";
import {MetarWindow} from "./components/edst-windows/MetarWindow";
import {refreshWeatherThunk} from "./redux/thunks/weatherThunks";
import {useEventListener} from "usehooks-ts";
import {EquipmentTemplateMenu} from "./components/edst-windows/template-components/EquipmentTemplateMenu";
import {SigmetWindow} from "./components/edst-windows/SigmetWindow";
import {Gpd} from "./components/edst-windows/Gpd";
import {EdstDiv, EdstBodyDiv} from "./styles/edstStyles";
import {EdstDraggingOutline} from './styles/draggingStyles';
import {GpdMapOptions} from "./components/edst-windows/gpd-components/GpdMapOptions";

// const CACHE_TIMEOUT = 300000; // ms

const ENTRIES_REFRESH_RATE = 20000; // 20 seconds
const WEATHER_REFRESH_RATE = 120000; // 2 minutes

const DRAGGING_REPOSITION_CURSOR: (windowEnum | menuEnum)[] = [
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
  const windows = useAppSelector(windowsSelector);
  const menus = useAppSelector(menusSelector);
  const showSectorSelector = useAppSelector(showSectorSelectorSelector);
  const mcaCommandString = useAppSelector(mcaCommandStringSelector);
  const inputFocused = useAppSelector(inputFocusedSelector);
  const dragging = useAppSelector(anyDraggingSelector);
  const [draggingRepositionCursor, setDraggingRepositionCursor] = useState<boolean>(false);
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
    }; // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (altMenuRef.current.inputRef === null) {
      altMenuRef.current.showInput = false;
    } else if (altMenuRef.current.inputRef?.current) {
      altMenuRef.current?.inputRef.current.focus();
    }
  }, [altMenuRef.current.inputRef]);

  const computePreviewPos = (x: number, y: number, width: number, height: number): { left: number, top: number } => {
    return {
      left: Math.max(0, Math.min(x, bodyRef.current.clientWidth - width - 2)),
      top: Math.max(0, Math.min(y, bodyRef.current.clientHeight - height - 3))
    };
  }

  const draggingHandler = useCallback((event: MouseEvent) => {
    if (event && bodyRef?.current?.windowRef?.current) {
      if (bodyRef.current.reposition) {
        setDragPreviewStyle((prevStyle: any) => ({
          ...prevStyle, left: event.pageX, top: event.pageY
        }));
      } else {
        const relX = event.pageX - bodyRef?.current.relativePos.x;
        const relY = event.pageY - bodyRef?.current.relativePos.y;
        const {clientWidth: width, clientHeight: height} = bodyRef.current.windowRef.current;
        const ppos = bodyRef.current.ppos;
        setDragPreviewStyle((prevStyle: any) => ({
          ...prevStyle, ...computePreviewPos(ppos.x + relX, ppos.y + relY + 35, width, height)
        }));
      }
    }
  }, []);

  const startDrag = (event: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<any>, edstWindow: windowEnum | menuEnum) => {
    if (bodyRef.current) {
      let ppos;
      if (edstWindow in windowEnum) {
        ppos = windows[edstWindow as windowEnum].position;
      } else if (edstWindow in menuEnum) {
        ppos = menus[edstWindow as menuEnum].position;
      }
      if (!ppos) {
        return;
      }
      bodyRef.current.reposition = DRAGGING_REPOSITION_CURSOR.includes(edstWindow);
      if (window.__TAURI__) {
        invoke('set_cursor_grab', {value: true});
      }
      if (DRAGGING_REPOSITION_CURSOR.includes(edstWindow)) {
        let newCursorPos = {x: ppos.x - 1, y: ppos.y + 35};
        if (window.__TAURI__) {
          invoke('set_cursor_position', newCursorPos);
        }
        else {
          ppos = {x: event.pageX + 1, y: event.pageY - 35};
        }
      } else {
        bodyRef.current.relativePos = {x: event.pageX, y: event.pageY};
      }
      const style = {
        left: ppos.x - 1,
        top: ppos.y + 35,
        position: "absolute",
        height: ref.current.clientHeight,
        width: ref.current.clientWidth
      };
      bodyRef.current.windowRef = ref;
      bodyRef.current.draggingWindowName = edstWindow;
      bodyRef.current.ppos = ppos;
      setDragPreviewStyle(style);
      setDraggingRepositionCursor(DRAGGING_REPOSITION_CURSOR.includes(edstWindow));
      dispatch(setDragging(true));
      bodyRef.current.addEventListener('mousemove', draggingHandler);
    }
  }

  const stopDrag = (_event: React.MouseEvent<HTMLDivElement>) => {
    if (dragging && bodyRef?.current) {
      let newPos;
      const edstWindow = bodyRef.current.draggingWindowName;
      const {left: x, top: y} = dragPreviewStyle;
      newPos = {x: x + 1, y: y - 35};
      if (window.__TAURI__) {
        invoke('set_cursor_grab', {value: false});
      }
      if (edstWindow in windowEnum) {
        dispatch(setWindowPosition({
          window: bodyRef.current.draggingWindowName as windowEnum,
          pos: newPos
        }));
      } else if (edstWindow in menuEnum) {
        dispatch(setMenuPosition({
          menu: bodyRef.current.draggingWindowName as menuEnum,
          pos: newPos
        }));
      }
      bodyRef.current.reposition = null;
      bodyRef.current.relativePos = null;
      dispatch(setDragging(false));
      setDragPreviewStyle(null);
      setDraggingRepositionCursor(false);
      bodyRef.current.removeEventListener('mousemove', draggingHandler);
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

  return <EdstDiv
    ref={bodyRef}
    onContextMenu={(event) => process.env.NODE_ENV !== 'development' && event.preventDefault()}
    tabIndex={!(inputFocused) ? -1 : 0}
    onMouseDown={(e) => (dragging && e.button === 0 && stopDrag(e))}
  >
    {dragging && <EdstDraggingOutline
        style={dragPreviewStyle ?? {display: "none"}}
        onMouseUp={(e) => !draggingRepositionCursor && stopDrag(e)}
    />}
    <EdstHeader/>
    <div id='toPrint'/>
    <EdstBodyDiv>
      {showSectorSelector && <SectorSelector/>}
      <EdstContext.Provider value={{
        startDrag: startDrag,
        stopDrag: stopDrag
      }}>
        {windows[windowEnum.acl].open && <Acl/>}
        {windows[windowEnum.dep].open && <Dep/>}
        {windows[windowEnum.graphicPlanDisplay].open && <Gpd/>}
        {windows[windowEnum.plansDisplay].open && <PlansDisplay/>}
        {menus[menuEnum.planOptions].open && <PlanOptions/>}
        {menus[menuEnum.sortMenu].open && <SortMenu/>}
        {menus[menuEnum.toolsMenu].open && <ToolsMenu/>}
        {menus[menuEnum.gpdMapOptionsMenu].open && <GpdMapOptions/>}
        {menus[menuEnum.routeMenu].open && <RouteMenu/>}
        {menus[menuEnum.templateMenu].open && <TemplateMenu/>}
        {menus[menuEnum.equipmentTemplateMenu].open && <EquipmentTemplateMenu/>}
        {menus[menuEnum.holdMenu].open && <HoldMenu/>}
        {menus[menuEnum.cancelHoldMenu].open && <CancelHoldMenu/>}
        {menus[menuEnum.prevRouteMenu].open && <PreviousRouteMenu/>}
        {menus[menuEnum.speedMenu].open && <SpeedMenu/>}
        {menus[menuEnum.headingMenu].open && <HeadingMenu/>}
        {menus[menuEnum.altitudeMenu].open && <AltMenu
            setAltMenuInputRef={(ref) => altMenuRef.current.inputRef = ref}
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
    </EdstBodyDiv>
  </EdstDiv>;
}
