import {createSlice} from "@reduxjs/toolkit";
import {PlanDataType, WindowPositionType} from "../../types";
import {
  aclRowFieldEnum,
  depRowFieldEnum,
  edstHeaderButtonEnum,
  menuEnum,
  planRowFieldEnum,
  windowEnum
} from "../../enums";
import {RootState} from "../store";

export const AIRCRAFT_MENUS = [
  menuEnum.planOptions,
  menuEnum.altitudeMenu,
  menuEnum.routeMenu,
  menuEnum.prevRouteMenu,
  menuEnum.speedMenu,
  menuEnum.headingMenu,
  menuEnum.holdMenu,
  menuEnum.cancelHoldMenu,
  menuEnum.templateMenu,
  menuEnum.equipmentTemplateMenu
];

type AppWindowType = {
  open: boolean,
  window: windowEnum,
  position: WindowPositionType | null,
  openedBy?: windowEnum | menuEnum,
  openedWithCid?: string | null
};

export type AselType = { cid: string, window: windowEnum, field: aclRowFieldEnum | depRowFieldEnum | planRowFieldEnum };

export type AppStateType = {
  disabledHeaderButtons: edstHeaderButtonEnum[];
  planQueue: PlanDataType[],
  inputFocused: boolean;
  windows: { [key in windowEnum]: AppWindowType },
  menus: { [key in menuEnum]: AppWindowType },
  dragging: boolean;
  mraMsg: string;
  mcaCommandString: string;
  tooltipsEnabled: boolean;
  showSectorSelector: boolean;
  asel: AselType | null
}

export const DISABLED_HEADER_BUTTONS = [
  edstHeaderButtonEnum.not,
  edstHeaderButtonEnum.gi,
  edstHeaderButtonEnum.ua,
  edstHeaderButtonEnum.keep,
  edstHeaderButtonEnum.adsb,
  edstHeaderButtonEnum.sat,
  edstHeaderButtonEnum.msg,
  edstHeaderButtonEnum.wind,
  edstHeaderButtonEnum.fel,
  edstHeaderButtonEnum.cpdlcHist,
  edstHeaderButtonEnum.cpdlcMsgOut
];

const defaultWindowPositions: { [key in windowEnum]?: { x: number, y: number } | null } = {
  [windowEnum.status]: {x: 400, y: 100},
  [windowEnum.outage]: {x: 400, y: 100},
  [windowEnum.messageComposeArea]: {x: 100, y: 600},
  [windowEnum.messageResponseArea]: {x: 100, y: 100},
  [windowEnum.altimeter]: {x: 100, y: 100},
  [windowEnum.metar]: {x: 100, y: 100},
  [windowEnum.sigmets]: {x: 100, y: 100}
};

const initialWindowState: { [key in windowEnum]: AppWindowType } = Object.fromEntries(Object.values(windowEnum)
  .map((value) => [value as windowEnum, {
    open: false,
    position: defaultWindowPositions[value as windowEnum] ?? null
  } as AppWindowType])) as { [key in windowEnum]: AppWindowType };

const initialMenuState: { [key in menuEnum]: AppWindowType } = Object.fromEntries(Object.values(menuEnum)
  .map((value) => [value as menuEnum, {
    open: false,
    position: null
  } as AppWindowType])) as { [key in menuEnum]: AppWindowType };

const initialState: AppStateType = {
  disabledHeaderButtons: DISABLED_HEADER_BUTTONS,
  planQueue: [],
  inputFocused: false,
  windows: initialWindowState,
  menus: initialMenuState,
  dragging: false,
  mraMsg: '',
  mcaCommandString: '',
  tooltipsEnabled: true,
  showSectorSelector: true,
  asel: null
};

const appSlice = createSlice({
  name: 'app',
  initialState: initialState as AppStateType,
  reducers: {
    toggleWindow(state, action: { payload: windowEnum }) {
      state.windows[action.payload].open = !state.windows[action.payload].open;
    },
    toggleMenu(state, action: { payload: menuEnum }) {
      state.menus[action.payload].open = !state.menus[action.payload].open;
    },
    closeWindow(state, action: { payload: windowEnum | windowEnum[] }) {
      if (action.payload instanceof Array) {
        for (const window of action.payload) {
          state.windows[window].open = false;
        }
      } else {
        state.windows[action.payload].open = false;
      }
    },
    closeMenu(state, action: { payload: menuEnum | menuEnum[] }) {
      if (action.payload instanceof Array) {
        for (const menu of action.payload) {
          state.menus[menu].open = false;
        }
      } else {
        state.menus[action.payload].open = false;
      }
    },
    openWindow(state, action: { payload: { window: windowEnum, openedBy?: windowEnum, openedWithCid?: string | null } }) {
      state.windows[action.payload.window].open = true;
      if (action.payload.openedBy) {
        state.windows[action.payload.window].openedBy = action.payload.openedBy;
      }
      if (action.payload.openedWithCid) {
        state.windows[action.payload.window].openedWithCid = action.payload.openedWithCid;
      }
    },
    openMenu(state, action: { payload: { menu: menuEnum, openedBy?: windowEnum | menuEnum, openedWithCid?: string | null } }) {
      state.menus[action.payload.menu].open = true;
      if (action.payload.openedBy) {
        state.menus[action.payload.menu].openedBy = action.payload.openedBy;
      }
      if (action.payload.openedWithCid) {
        state.menus[action.payload.menu].openedWithCid = action.payload.openedWithCid;
      }
    },
    setTooltipsEnabled(state, action: { payload: boolean }) {
      state.tooltipsEnabled = action.payload;
    },
    setShowSectorSelector(state, action: { payload: boolean }) {
      state.showSectorSelector = action.payload;
    },
    setWindowPosition(state, action: { payload: { window: windowEnum, pos: { x: number, y: number, w?: number, h?: number } | null } }) {
      state.windows[action.payload.window].position = action.payload.pos;
    },
    setMenuPosition(state, action: { payload: { menu: menuEnum, pos: { x: number, y: number, w?: number, h?: number } | null } }) {
      state.menus[action.payload.menu].position = action.payload.pos;
    },
    setMraMessage(state, action: { payload: string }) {
      state.windows[windowEnum.messageResponseArea].open = true;
      state.mraMsg = action.payload;
    },
    setMcaCommandString(state, action: { payload: string }) {
      state.mcaCommandString = action.payload;
    },
    setInputFocused(state, action: { payload: boolean }) {
      state.inputFocused = action.payload;
    },
    closeAllWindows(state) {
      for (let window of Object.values(windowEnum)) {
        state.windows[window as windowEnum].open = false;
      }
    },
    closeAllMenus(state) {
      for (let menu of Object.values(menuEnum)) {
        state.menus[menu as menuEnum].open = false;
      }
      state.asel = null;
    },
    closeAircraftMenus(state) {
      for (let menu of AIRCRAFT_MENUS) {
        state.menus[menu as menuEnum].open = false;
      }
    },
    setAsel(state, action: { payload: AselType | null }) {
      state.asel = action.payload;
    },
    setDragging(state, action: { payload: boolean }) {
      state.dragging = action.payload;
    }
  }
});

export const {
  setTooltipsEnabled,
  setShowSectorSelector,
  setWindowPosition,
  setMenuPosition,
  setMraMessage,
  setMcaCommandString,
  openWindow,
  openMenu,
  closeWindow,
  closeMenu,
  toggleWindow,
  toggleMenu,
  setInputFocused,
  closeAllWindows,
  closeAllMenus,
  closeAircraftMenus,
  setAsel,
  setDragging
} = appSlice.actions;
export default appSlice.reducer;

export const mcaCommandStringSelector = (state: RootState) => state.app.mcaCommandString;
export const mraMsgSelector = (state: RootState) => state.app.mraMsg;
export const windowSelector = (window: windowEnum) => (state: RootState) => state.app.windows[window];
export const menuSelector = (menu: menuEnum) => (state: RootState) => state.app.menus[menu];
export const windowPositionSelector = (window: windowEnum) => (state: RootState) => state.app.windows[window].position;
export const menuPositionSelector = (menu: menuEnum) => (state: RootState) => state.app.menus[menu].position;
export const aselSelector = (state: RootState) => state.app.asel;
export const aclAselSelector = (state: RootState) => state.app.asel?.window === windowEnum.acl ? state.app.asel : null;
export const depAselSelector = (state: RootState) => state.app.asel?.window === windowEnum.dep ? state.app.asel : null;
export const gpdAselSelector = (state: RootState) => state.app.asel?.window === windowEnum.graphicPlanDisplay ? state.app.asel : null;
export const draggingSelector = (state: RootState) => state.app.dragging;