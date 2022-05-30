import { createSlice } from "@reduxjs/toolkit";
import { PlanQuery, WindowPosition } from "../../types";
import { AclRowField, DepRowField, edstHeaderButton, EdstMenu, PlanRowField, EdstWindow } from "../../enums";
import { RootState } from "../store";

export const AIRCRAFT_MENUS = [
  EdstMenu.planOptions,
  EdstMenu.altitudeMenu,
  EdstMenu.routeMenu,
  EdstMenu.prevRouteMenu,
  EdstMenu.speedMenu,
  EdstMenu.headingMenu,
  EdstMenu.holdMenu,
  EdstMenu.cancelHoldMenu,
  EdstMenu.templateMenu,
  EdstMenu.equipmentTemplateMenu
];

type AppWindow = {
  open: boolean;
  window: EdstWindow | EdstMenu;
  position: WindowPosition | null;
  openedBy?: EdstWindow | EdstMenu;
};

enum outageTypeEnum {
  facilityDown,
  facilityUp,
  serviceDown,
  serviceUp
}

type OutageEntryType = {
  message: string;
  outageType: outageTypeEnum;
  canDelete: boolean;
  acknowledged: boolean;
};

export type Asel = { cid: string; window: EdstWindow; field: AclRowField | DepRowField | PlanRowField };

export type AppState = {
  disabledHeaderButtons: edstHeaderButton[];
  planQueue: PlanQuery[];
  inputFocused: boolean;
  windows: Record<EdstWindow, AppWindow>;
  menus: Record<EdstMenu, AppWindow>;
  dragging: boolean;
  mraMsg: string;
  mcaCommandString: string;
  tooltipsEnabled: boolean;
  showSectorSelector: boolean;
  asel: Asel | null;
  zStack: (EdstWindow | EdstMenu)[];
  outage: OutageEntryType[];
};

export const DISABLED_HEADER_BUTTONS = [
  edstHeaderButton.not,
  edstHeaderButton.gi,
  edstHeaderButton.ua,
  edstHeaderButton.keep,
  edstHeaderButton.adsb,
  edstHeaderButton.sat,
  edstHeaderButton.msg,
  edstHeaderButton.wind,
  edstHeaderButton.fel,
  edstHeaderButton.cpdlcHist,
  edstHeaderButton.cpdlcMsgOut
];

const defaultWindowPositions: Partial<Record<EdstWindow, { x: number; y: number } | null>> = {
  [EdstWindow.status]: { x: 400, y: 100 },
  [EdstWindow.outage]: { x: 400, y: 100 },
  [EdstWindow.messageComposeArea]: { x: 100, y: 600 },
  [EdstWindow.messageResponseArea]: { x: 100, y: 100 },
  [EdstWindow.altimeter]: { x: 100, y: 100 },
  [EdstWindow.metar]: { x: 100, y: 100 },
  [EdstWindow.sigmets]: { x: 100, y: 100 }
};

const initialWindowState: Record<EdstWindow, AppWindow> = Object.fromEntries(
  Object.values(EdstWindow).map(value => [
    value as EdstWindow,
    {
      open: false,
      position: defaultWindowPositions[value as EdstWindow] ?? null
    } as AppWindow
  ])
) as Record<EdstWindow, AppWindow>;

const initialMenuState: Record<EdstMenu, AppWindow> = Object.fromEntries(
  Object.values(EdstMenu).map(value => [
    value as EdstMenu,
    {
      open: false,
      position: null
    } as AppWindow
  ])
) as Record<EdstMenu, AppWindow>;

const initialState: AppState = {
  disabledHeaderButtons: DISABLED_HEADER_BUTTONS,
  planQueue: [],
  inputFocused: false,
  windows: initialWindowState,
  menus: initialMenuState,
  dragging: false,
  mraMsg: "",
  mcaCommandString: "",
  tooltipsEnabled: true,
  showSectorSelector: true,
  asel: null,
  zStack: [],
  outage: []
};

const appSlice = createSlice({
  name: "app",
  initialState: initialState as AppState,
  reducers: {
    toggleWindow(state, action: { payload: EdstWindow }) {
      state.windows[action.payload].open = !state.windows[action.payload].open;
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload);
      state.zStack = [action.payload, ...zStack];
    },
    toggleMenu(state, action: { payload: EdstMenu }) {
      state.menus[action.payload].open = !state.menus[action.payload].open;
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload);
      state.zStack = [action.payload, ...zStack];
    },
    closeWindow(state, action: { payload: EdstWindow | EdstWindow[] }) {
      if (action.payload instanceof Array) {
        action.payload.forEach(window => {
          state.windows[window].open = false;
        });
      } else {
        state.windows[action.payload].open = false;
      }
    },
    closeMenu(state, action: { payload: EdstMenu | EdstMenu[] }) {
      if (action.payload instanceof Array) {
        action.payload.forEach(menu => {
          state.menus[menu].open = false;
        });
      } else {
        state.menus[action.payload].open = false;
      }
    },
    openWindow(state, action: { payload: { window: EdstWindow; openedBy?: EdstWindow } }) {
      state.windows[action.payload.window].open = true;
      if (action.payload.openedBy) {
        state.windows[action.payload.window].openedBy = action.payload.openedBy;
      }
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload.window);
      state.zStack = [action.payload.window, ...zStack];
    },
    openMenu(state, action: { payload: { menu: EdstMenu; openedBy?: EdstWindow | EdstMenu } }) {
      state.menus[action.payload.menu].open = true;
      if (action.payload.openedBy) {
        state.menus[action.payload.menu].openedBy = action.payload.openedBy;
      }
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload.menu);
      state.zStack = [action.payload.menu, ...zStack];
    },
    setTooltipsEnabled(state, action: { payload: boolean }) {
      state.tooltipsEnabled = action.payload;
    },
    setShowSectorSelector(state, action: { payload: boolean }) {
      state.showSectorSelector = action.payload;
    },
    setWindowPosition(state, action: { payload: { window: EdstWindow; pos: { x: number; y: number; w?: number; h?: number } | null } }) {
      state.windows[action.payload.window].position = action.payload.pos;
    },
    setMenuPosition(state, action: { payload: { menu: EdstMenu; pos: { x: number; y: number; w?: number; h?: number } | null } }) {
      state.menus[action.payload.menu].position = action.payload.pos;
    },
    setMraMessage(state, action: { payload: string }) {
      state.windows[EdstWindow.messageResponseArea].open = true;
      state.mraMsg = action.payload;
    },
    setMcaCommandString(state, action: { payload: string }) {
      state.mcaCommandString = action.payload;
    },
    setInputFocused(state, action: { payload: boolean }) {
      state.inputFocused = action.payload;
    },
    closeAllWindows(state) {
      Object.values(EdstWindow).forEach(window => {
        state.windows[window as EdstWindow].open = false;
      });
    },
    closeAllMenus(state) {
      Object.values(EdstMenu).forEach(menu => {
        state.menus[menu as EdstMenu].open = false;
      });
      state.asel = null;
    },
    closeAircraftMenus(state) {
      AIRCRAFT_MENUS.forEach(menu => {
        state.menus[menu as EdstMenu].open = false;
      });
    },
    setAsel(state, action: { payload: Asel | null }) {
      state.asel = action.payload;
    },
    setAnyDragging(state, action: { payload: boolean }) {
      state.dragging = action.payload;
    },
    pushZStack(state, action: { payload: EdstWindow | EdstMenu }) {
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload);
      state.zStack = [action.payload, ...zStack];
    },
    addOutageMessage(state, action: { payload: OutageEntryType }) {
      state.outage = [...state.outage, action.payload];
    },
    // removes outage message at index
    removeOutageMessage(state, action: { payload: number }) {
      if (action.payload > -1 && action.payload < state.outage.length) {
        state.outage.splice(action.payload, 1);
      }
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
  setAnyDragging,
  pushZStack,
  addOutageMessage,
  removeOutageMessage
} = appSlice.actions;
export default appSlice.reducer;

export const mcaCommandStringSelector = (state: RootState) => state.app.mcaCommandString;
export const mraMsgSelector = (state: RootState) => state.app.mraMsg;
export const windowSelector = (window: EdstWindow) => (state: RootState) => state.app.windows[window];
export const menuSelector = (menu: EdstMenu) => (state: RootState) => state.app.menus[menu];
export const windowPositionSelector = (window: EdstWindow) => (state: RootState) => state.app.windows[window].position;
export const menuPositionSelector = (menu: EdstMenu) => (state: RootState) => state.app.menus[menu].position;
export const aselSelector = (state: RootState) => state.app.asel;
export const aclAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.acl ? state.app.asel : null);
export const depAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.dep ? state.app.asel : null);
export const gpdAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.graphicPlanDisplay ? state.app.asel : null);
export const anyDraggingSelector = (state: RootState) => state.app.dragging;
export const zStackSelector = (state: RootState) => state.app.zStack;
export const outageSelector = (state: RootState) => state.app.outage;
export const menusSelector = (state: RootState) => state.app.menus;
export const windowsSelector = (state: RootState) => state.app.windows;
export const tooltipsEnabledSelector = (state: RootState) => state.app.tooltipsEnabled;
export const showSectorSelectorSelector = (state: RootState) => state.app.showSectorSelector;
export const inputFocusedSelector = (state: RootState) => state.app.inputFocused;
export const disabledHeaderButtonsSelector = (state: RootState) => state.app.disabledHeaderButtons;
